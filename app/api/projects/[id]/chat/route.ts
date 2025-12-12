import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { AIModel, ChatMessage, getModelCredits } from "@/lib/aiTypes";
import { chatWithAIStream } from "@/lib/aiChat";

export const runtime = "nodejs";
export const maxDuration = 300; // 5분

// 중단된 요청 ID를 추적하는 Set (5분 후 자동 정리)
const abortedRequests = new Map<string, number>();

// 주기적으로 오래된 항목 정리 (5분 이상 지난 것)
setInterval(() => {
  const now = Date.now();
  for (const [requestId, timestamp] of abortedRequests.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      abortedRequests.delete(requestId);
    }
  }
}, 60 * 1000); // 1분마다 정리

// GET: Fetch chat history
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get project and verify ownership
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get chat messages
    const messages = await prisma.chatMessage.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        filesChanged: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Send a new message (SSE Streaming)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const encoder = new TextEncoder();

  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get project
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get request body
    const body = await req.json();
    const { message, aiModel, files, requestId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Validate AI model (fall back to project's default if not provided)
    const validModels = ["claude", "chatgpt", "gemini"];
    const selectedModel =
      aiModel && validModels.includes(aiModel)
        ? aiModel
        : (project.aiModel as AIModel) || "gemini";

    // 크레딧 체크
    const requiredCredits = getModelCredits(selectedModel as AIModel);

    if (user.credits < requiredCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    // Get chat history before saving new message (최근 10개만 - 성능 최적화)
    const previousMessages = await prisma.chatMessage
      .findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          role: true,
          content: true,
        },
      })
      .then((msgs) => msgs.reverse()); // 시간순 정렬

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        projectId: id,
        role: "user",
        content: message,
        aiModel: selectedModel,
      },
    });

    // Get current files
    const currentFiles = (project.files as Record<string, string>) || {};

    // SSE 스트리밍 응답
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. 시작 알림
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "start" })}\n\n`
            )
          );

          // 2. AI 스트리밍 생성
          const generator = chatWithAIStream(
            message,
            currentFiles,
            previousMessages as ChatMessage[],
            selectedModel as AIModel,
            files
          );

          let result;

          // 3. 청크 전송
          while (true) {
            const { done, value } = await generator.next();

            if (done) {
              result = value;
              break;
            }

            // 청크 전송
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", text: value })}\n\n`
              )
            );
          }

          if (!result || !result.response) {
            throw new Error("AI returned invalid response");
          }

          // 4. 파일 변경사항 처리
          let updatedFiles = { ...currentFiles };
          let filesChanged: string[] = [];

          if (result.fileChanges) {
            updatedFiles = {
              ...currentFiles,
              ...result.fileChanges,
            };
            filesChanged = Object.keys(result.fileChanges);

            await prisma.project.update({
              where: { id },
              data: {
                files: updatedFiles,
                updatedAt: new Date(),
              },
            });
          }

          // 5. 중단된 요청인지 확인
          if (requestId && abortedRequests.has(requestId)) {
            abortedRequests.delete(requestId);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", error: "Request was aborted" })}\n\n`
              )
            );
            controller.close();
            return;
          }

          // 6. DB 저장 + 크레딧 차감
          await prisma.$transaction([
            prisma.chatMessage.create({
              data: {
                projectId: id,
                role: "assistant",
                content: result.response,
                filesChanged: filesChanged.length > 0 ? filesChanged : undefined,
                aiModel: selectedModel,
              },
            }),
            prisma.user.update({
              where: { id: user.id },
              data: {
                credits: { decrement: requiredCredits },
              },
            }),
          ]);

          // 7. 완료 알림
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                response: result.response,
                filesUpdated: filesChanged.length > 0,
                filesChanged,
                updatedFiles,
                requestId,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Chat streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Failed to get AI response",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Abort a pending request
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "requestId required" },
        { status: 400 }
      );
    }

    // 중단된 요청으로 표시
    abortedRequests.set(requestId, Date.now());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error aborting request:", error);
    return NextResponse.json(
      { error: "Failed to abort request" },
      { status: 500 }
    );
  }
}
