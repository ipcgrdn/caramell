import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { AIModel, ChatMessage } from "@/lib/aiTypes";
import { chatWithAI } from "@/lib/aiChat";

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

// POST: Send a new message
export async function POST(
  req: Request,
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

    // Get chat history before saving new message
    const previousMessages = await prisma.chatMessage.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        content: true,
      },
    });

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

    // Call AI to get response with chat history for context
    try {
      const result = await chatWithAI(
        message,
        currentFiles,
        previousMessages as ChatMessage[],
        selectedModel as AIModel,
        files
      );

      // Validate response
      if (!result || !result.response) {
        throw new Error("AI returned invalid response: missing response field");
      }

      // Merge fileChanges with current files (only update changed files)
      let updatedFiles = { ...currentFiles };
      let filesChanged: string[] = [];

      if (result.fileChanges) {
        // Merge: keep all existing files, update/add only changed ones
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

      // 중단된 요청인지 확인
      if (requestId && abortedRequests.has(requestId)) {
        abortedRequests.delete(requestId);
        return NextResponse.json(
          { error: "Request was aborted" },
          { status: 499 } // Client Closed Request
        );
      }

      // Save assistant message to database
      await prisma.chatMessage.create({
        data: {
          projectId: id,
          role: "assistant",
          content: result.response,
          filesChanged: filesChanged.length > 0 ? filesChanged : undefined,
          aiModel: selectedModel,
        },
      });

      return NextResponse.json({
        response: result.response,
        filesUpdated: filesChanged.length > 0,
        filesChanged,
        updatedFiles: updatedFiles,
        requestId,
      });
    } catch (error) {
      console.error("Chat AI error:", error);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }
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
