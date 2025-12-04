import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { generatingHTML, noContentHTML, notFoundHTML } from "../statusPages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Fetch project
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      files: true,
      status: true,
    },
  });

  // Project not found
  if (!project) {
    return new NextResponse(notFoundHTML(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Still generating
  if (project.status === "generating") {
    return new NextResponse(generatingHTML(), {
      status: 202,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        Refresh: "3", // Auto-refresh after 3 seconds
      },
    });
  }

  // Extract index.html from files
  const files = project.files as Record<string, string> | null;
  const htmlContent = files?.["index.html"];

  if (!htmlContent) {
    return new NextResponse(noContentHTML(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Return raw HTML
  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
