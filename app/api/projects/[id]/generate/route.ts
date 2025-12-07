import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AIModel, getModelCredits } from "@/lib/aiTypes";
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

    // 크레딧 체크
    const aiModel = (project.aiModel as AIModel) || "gemini";
    const requiredCredits = getModelCredits(aiModel);

    if (user.credits < requiredCredits) {
      return NextResponse.json(
        { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
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

          // 2. AI 스트리밍 생성 (선택한 모델 사용, 첨부 파일 포함)
          const aiModel = (project.aiModel as AIModel) || "gemini";
          const attachedFiles = project.attachedFiles as Array<{
            name: string;
            type: string;
            size: number;
            data: string;
          }> | null;
          const generator = generateLandingPageStream(
            project.prompt,
            aiModel,
            attachedFiles || undefined
          );
          let result;

          // 3. 제너레이터를 끝까지 실행하여 return 값 가져오기
          while (true) {
            const { done, value } = await generator.next();

            if (done) {
              // done일 때 value가 제너레이터의 return 값
              result = value;
              break;
            }
            // done이 아닐 때 value는 yield된 청크 (프론트엔드로 전송)
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", text: value })}\n\n`
              )
            );
          }

          if (!result) {
            throw new Error("Generation did not complete properly");
          }

          const { files, message } = result;

          // 4. DB에 저장 + 크레딧 차감
          await prisma.$transaction([
            prisma.project.update({
              where: { id },
              data: {
                files,
                status: "ready",
                name: project.name || extractTitleFromPrompt(project.prompt),
              },
            }),
            prisma.user.update({
              where: { id: user.id },
              data: {
                credits: { decrement: requiredCredits },
              },
            }),
          ]);

          // 5. 채팅 기록에 저장
          const existingMessages = await prisma.chatMessage.count({
            where: { projectId: id },
          });

          // user 메시지를 먼저 기록 (순서 보장)
          if (existingMessages === 0) {
            await prisma.chatMessage.create({
              data: {
                projectId: id,
                role: "user",
                content: project.prompt,
              },
            });
          }

          // assistant 메시지를 나중에 기록
          await prisma.chatMessage.create({
            data: {
              projectId: id,
              role: "assistant",
              content: message,
              filesChanged: Object.keys(files),
            },
          });

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
