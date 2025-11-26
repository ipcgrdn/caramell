import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { chatWithAI } from "@/lib/generators/aiGenerator";

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

    // Get current files
    const currentFiles = (project.files as Record<string, string>) || {};

    // Call AI to get response and potentially updated files
    try {
      const result = await chatWithAI(message, currentFiles);

      // If AI returned updated files, save them
      if (result.files) {
        await prisma.project.update({
          where: { id },
          data: { files: result.files },
        });
      }

      return NextResponse.json({
        response: result.response,
        filesUpdated: !!result.files,
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
