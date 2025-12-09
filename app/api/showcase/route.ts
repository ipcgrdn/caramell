import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = Math.min(Math.max(parseInt(limitParam || "8", 10), 1), 50);
    const offset = Math.max(parseInt(offsetParam || "0", 10), 0);

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          isPublic: true,
          status: "ready",
          screenshot: { not: null },
        },
        select: {
          id: true,
          name: true,
          screenshot: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.project.count({
        where: {
          isPublic: true,
          status: "ready",
          screenshot: { not: null },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      projects,
      total,
      hasMore: offset + projects.length < total,
    });
  } catch (error) {
    console.error("Error fetching showcase projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
