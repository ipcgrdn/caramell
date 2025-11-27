import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
      select: {
        screenshot: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If screenshot exists, serve it
    if (project.screenshot) {
      try {
        const filepath = join(
          process.cwd(),
          "public",
          project.screenshot.replace(/^\//, "")
        );
        const image = await readFile(filepath);

        return new NextResponse(image, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (error) {
        console.error("Error reading screenshot:", error);
        // Fall through to placeholder
      }
    }

    // No screenshot found, return placeholder
    return NextResponse.redirect(
      "https://via.placeholder.com/800x450/E5E5E5/999999?text=No+Preview"
    );
  } catch (error) {
    console.error("Error fetching project preview:", error);
    return NextResponse.redirect(
      "https://via.placeholder.com/800x450/EF4444/FFFFFF?text=Error"
    );
  }
}
