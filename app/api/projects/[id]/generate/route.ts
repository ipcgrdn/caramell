import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AIModel } from "@/lib/aiTypes";
import { generateLandingPageStream } from "@/lib/aiGenerator";

export const runtime = "nodejs";
export const maxDuration = 300; // 5분

export async function POST(
  _req: Request,
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

    // 스트리밍 응답 시작
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. 생성 시작 알림
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "generating" })}\n\n`
            )
          );

          // 2. AI 스트리밍 생성 (선택한 모델 사용)
          const aiModel = (project.aiModel as AIModel) || "gemini";
          const generator = generateLandingPageStream(project.prompt, aiModel);
          let result;

          // 3. 제너레이터를 끝까지 실행하여 return 값 가져오기
          while (true) {
            const { done, value } = await generator.next();

            if (done) {
              // done일 때 value가 제너레이터의 return 값
              result = value;
              break;
            }
            // done이 아닐 때 value는 yield된 청크 (UI에 표시 안함)
          }

          if (!result) {
            throw new Error("Generation did not complete properly");
          }

          const { files, message } = result;

          // 4. DB에 저장
          await prisma.project.update({
            where: { id },
            data: {
              files,
              status: "ready",
              name: project.name || extractTitleFromPrompt(project.prompt),
            },
          });

          // 5. 채팅 기록에 저장
          const existingMessages = await prisma.chatMessage.count({
            where: { projectId: id },
          });

          const chatWrites: Promise<unknown>[] = [];

          if (existingMessages === 0) {
            chatWrites.push(
              prisma.chatMessage.create({
                data: {
                  projectId: id,
                  role: "user",
                  content: project.prompt,
                },
              })
            );
          }

          chatWrites.push(
            prisma.chatMessage.create({
              data: {
                projectId: id,
                role: "assistant",
                content: message,
                filesChanged: Object.keys(files),
              },
            })
          );

          await Promise.all(chatWrites);

          // 6. 완료 알림
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                files,
                message,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Generation error:", error);

          // Mark as failed
          await prisma.project.update({
            where: { id },
            data: { status: "failed" },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Generation failed",
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

// Extract a title from the prompt
function extractTitleFromPrompt(prompt: string): string {
  const words = prompt.split(" ").slice(0, 5);
  return words.join(" ") + (prompt.split(" ").length > 5 ? "..." : "");
}
