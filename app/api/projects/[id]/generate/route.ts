import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { generateLandingPage } from "@/lib/aiGenerator";
import { regenerateProjectScreenshot } from "@/lib/screenshot";

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
      const files = await generateLandingPage(project.prompt);

      // Generate screenshot from the generated files
      let screenshotPath: string | null = null;
      try {
        screenshotPath = await regenerateProjectScreenshot(id, files);
      } catch (screenshotError) {
        console.error("Screenshot generation failed:", screenshotError);
        // Continue without screenshot
      }

      // Update project with generated files and screenshot
      await prisma.project.update({
        where: { id },
        data: {
          files,
          status: "ready",
          name: project.name || extractTitleFromPrompt(project.prompt),
          screenshot: screenshotPath,
        },
      });

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
