import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { generateLandingPage } from "@/lib/aiGenerator";

export async function POST(
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

    // Generate code
    try {
      const { files, message } = await generateLandingPage(project.prompt);

      // Note: 스크린샷은 클라이언트 사이드에서 자동으로 캡처됨
      await prisma.project.update({
        where: { id },
        data: {
          files,
          status: "ready",
          name: project.name || extractTitleFromPrompt(project.prompt),
        },
      });

      // 채팅 기록에 생성 결과 저장 (최초 프롬프트 포함)
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

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Generation error:", error);

      // Mark as failed
      await prisma.project.update({
        where: { id },
        data: { status: "failed" },
      });

      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
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
