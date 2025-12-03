import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, aiModel } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate AI model
    const validModels = ["claude", "chatgpt", "gemini"];
    const selectedModel = aiModel && validModels.includes(aiModel) ? aiModel : "gemini";

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create project (status: generating)
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        prompt: prompt.trim(),
        status: "generating",
        aiModel: selectedModel,
      },
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
