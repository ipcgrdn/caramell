import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as screenshotone from "screenshotone-api-sdk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * GET: ScreenshotOne이 접속하여 HTML을 가져가는 엔드포인트
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { files: true },
    });

    if (!project || !project.files) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const files = project.files as Record<string, string>;
    const htmlContent = files["index.html"];

    if (!htmlContent) {
      return new NextResponse("No HTML file found", { status: 404 });
    }

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("HTML preview error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

/**
 * POST: ScreenshotOne SDK를 사용하여 프로젝트 스크린샷 생성
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
      select: { id: true, files: true },
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

    // 현재 요청의 origin으로 URL 구성
    const url = new URL(req.url);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    const previewUrl = `${baseUrl}/api/projects/${id}/screenshot`;

    // ScreenshotOne SDK 클라이언트 생성
    const client = new screenshotone.Client(accessKey, secretKey);

    // URL 방식으로 옵션 설정
    const options = screenshotone.TakeOptions.url(previewUrl)
      .viewportWidth(1920)
      .viewportHeight(1080)
      .deviceScaleFactor(1)
      .format("png")
      .fullPage(false)
      .blockAds(true)
      .blockCookieBanners(true)
      .delay(5);

    // 스크린샷 생성
    const imageBlob = await client.take(options);
    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    // Cloudflare R2에 업로드
    const r2Client = new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    const filename = `${id}.png`;
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: "image/png",
      })
    );

    // 캐시 버스팅을 위한 타임스탬프 추가
    const timestamp = Date.now();
    const screenshotPath = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${filename}?v=${timestamp}`;

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
