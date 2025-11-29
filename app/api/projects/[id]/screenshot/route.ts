import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { writeFile } from "fs/promises";
import { join } from "path";

/**
 * POST: 클라이언트에서 캡처한 스크린샷을 업로드
 * 클라이언트 사이드에서 html2canvas로 캡처한 이미지를 받아 저장
 */
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

    // 프로젝트 소유권 확인
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // FormData에서 이미지 파일 추출
    const formData = await req.formData();
    const imageFile = formData.get("screenshot") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No screenshot provided" },
        { status: 400 }
      );
    }

    // 이미지를 Buffer로 변환
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/screenshots에 저장
    const filename = `${id}.png`;
    const filepath = join(process.cwd(), "public", "screenshots", filename);
    await writeFile(filepath, buffer);

    // 캐시 버스팅을 위한 타임스탬프 추가
    const timestamp = Date.now();
    const screenshotPath = `/screenshots/${filename}?v=${timestamp}`;

    // DB 업데이트
    await prisma.project.update({
      where: { id },
      data: {
        screenshot: screenshotPath,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      screenshotPath,
    });
  } catch (error) {
    console.error("Screenshot upload error:", error);
    return NextResponse.json(
      { error: "Failed to save screenshot" },
      { status: 500 }
    );
  }
}
