import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import JSZip from "jszip";
import { generateNextJsProject } from "@/lib/nextjsGenerator";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

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

    // Get HTML content from request
    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json(
        { error: "HTML content not provided" },
        { status: 400 }
      );
    }

    // Generate Next.js project files using AI
    const projectFiles = await generateNextJsProject(htmlContent);

    // Create ZIP file
    const zip = new JSZip();

    // Add all files to ZIP
    for (const [filePath, content] of Object.entries(projectFiles)) {
      zip.file(filePath, content);
    }

    // Generate ZIP buffer as ArrayBuffer to satisfy NextResponse body types
    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Caramell-nextjs-${id}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error generating Next.js project:", error);
    return NextResponse.json(
      { error: "Failed to generate Next.js project" },
      { status: 500 }
    );
  }
}
