import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Find or create user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        prompt: prompt.trim(),
        status: "generating",
      },
    });

    // Trigger code generation in background (don't await)
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${project.id}/generate`,
      {
        method: "POST",
        headers: {
          Cookie: req.headers.get("cookie") || "",
        },
      }
    ).catch((error) => {
      console.error("Failed to trigger generation:", error);
    });

    return NextResponse.json({
      success: true,
      projectId: project.id,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
