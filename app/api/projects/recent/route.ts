import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get limit from query params (default: 6, max: 12)
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(
      Math.max(parseInt(limitParam || "6", 10), 1),
      12
    );

    // Get recent projects with user lookup in single query
    const projects = await prisma.project.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        name: true,
        prompt: true,
        status: true,
        createdAt: true,
        files: true,
        screenshot: true,
      },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
