import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as screenshotone from "screenshotone-api-sdk";

import { writeFile } from "fs/promises";
import { join } from "path";

/**
 * POST: ScreenshotOne SDK를 사용하여 프로젝트 스크린샷 생성
 */
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

    // 프로젝트 소유권 확인 및 파일 가져오기
    const project = await prisma.project.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.files) {
      return NextResponse.json(
        { error: "No files to screenshot" },
        { status: 400 }
      );
    }

    // HTML 파일 추출
    const files = project.files as Record<string, string>;
    const htmlContent = files["index.html"];

    if (!htmlContent) {
      return NextResponse.json(
        { error: "No HTML file found" },
        { status: 400 }
      );
    }

    // ScreenshotOne API Key 확인
    const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
    const secretKey = process.env.SCREENSHOTONE_SECRET_KEY;

    if (!accessKey || !secretKey) {
      console.error("ScreenshotOne API keys not configured");
      return NextResponse.json(
        { error: "Screenshot service not configured" },
        { status: 500 }
      );
    }

    // ScreenshotOne SDK 클라이언트 생성
    const client = new screenshotone.Client(accessKey, secretKey);

    // 옵션 설정
    const options = screenshotone.TakeOptions.html(htmlContent)
      .viewportWidth(1920)
      .viewportHeight(1080)
      .deviceScaleFactor(1)
      .format("png")
      .fullPage(false)
      .blockAds(true)
      .blockCookieBanners(true)
      .delay(2);

    // 스크린샷 생성
    const imageBlob = await client.take(options);
    const buffer = Buffer.from(await imageBlob.arrayBuffer());

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
    console.error("Screenshot generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate screenshot" },
      { status: 500 }
    );
  }
}
