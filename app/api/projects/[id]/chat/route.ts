import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { chatWithAI } from "@/lib/aiGenerator";
import { regenerateProjectScreenshot } from "@/lib/screenshot";

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
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

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
      },
    });

    // Get current files
    const currentFiles = (project.files as Record<string, string>) || {};

    // Call AI to get response with chat history for context
    try {
      const result = await chatWithAI(message, currentFiles, previousMessages);

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

        // Regenerate screenshot since files changed
        let screenshotPath: string | null = null;
        try {
          screenshotPath = await regenerateProjectScreenshot(id, updatedFiles);
        } catch (screenshotError) {
          console.error("Screenshot regeneration failed:", screenshotError);
          // Continue without screenshot update
        }

        // Update project with merged files and new screenshot
        await prisma.project.update({
          where: { id },
          data: {
            files: updatedFiles,
            screenshot: screenshotPath || project.screenshot, // Keep old screenshot if regeneration fails
            updatedAt: new Date(),
          },
        });
      }

      // Save assistant message to database
      await prisma.chatMessage.create({
        data: {
          projectId: id,
          role: "assistant",
          content: result.response,
          filesChanged: filesChanged.length > 0 ? filesChanged : undefined,
        },
      });

      return NextResponse.json({
        response: result.response,
        filesUpdated: filesChanged.length > 0,
        filesChanged,
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
