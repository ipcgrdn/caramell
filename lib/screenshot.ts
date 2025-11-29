import html2canvas from "html2canvas";

/**
 * 모든 리소스 로딩 완료 대기 (이미지, 폰트 등)
 */
async function waitForResources(doc: Document): Promise<void> {
  // readyState 확인
  if (doc.readyState !== "complete") {
    await new Promise((resolve) => {
      doc.addEventListener("readystatechange", () => {
        if (doc.readyState === "complete") resolve(true);
      });
    });
  }

  // 이미지 로딩 대기
  const images = Array.from(doc.images);
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true); // 에러도 완료로 처리
      });
    })
  );

  // 폰트 로딩 대기
  if (doc.fonts) {
    await doc.fonts.ready.catch(() => {});
  }

  // 최종 렌더링 대기 (애니메이션, CSS 전환 완료)
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

/**
 * iframe의 내용을 캡처하여 서버에 업로드 (재시도 로직 포함)
 */
export async function captureAndUploadScreenshot(
  iframeElement: HTMLIFrameElement,
  projectId: string
): Promise<boolean> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await captureScreenshotOnce(iframeElement, projectId);
      if (result) return true;

      // 실패 시 재시도 전 대기
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Screenshot attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) return false;
    }
  }

  return false;
}

/**
 * 단일 스크린샷 캡처 시도
 */
async function captureScreenshotOnce(
  iframeElement: HTMLIFrameElement,
  projectId: string
): Promise<boolean> {
  try {
    // iframe의 document에 접근
    const iframeDocument =
      iframeElement.contentDocument || iframeElement.contentWindow?.document;

    if (!iframeDocument || !iframeDocument.body) {
      console.error("Cannot access iframe content");
      return false;
    }

    // 모든 리소스 로딩 대기
    await waitForResources(iframeDocument);

    // 고정 크기: Full HD (1920 x 1080)
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    const canvas = await html2canvas(iframeDocument.body, {
      backgroundColor: "#ffffff",
      scale: 1,
      logging: false, // 로그 비활성화
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      foreignObjectRendering: false,
      // viewport 크기만 캡처 (스크롤된 영역 제외)
      width: viewportWidth,
      height: viewportHeight,
      windowWidth: viewportWidth,
      windowHeight: viewportHeight,
      x: 0,
      y: 0,
    });

    // Canvas가 유효한지 확인
    if (canvas.width === 0 || canvas.height === 0) {
      console.error("Canvas has invalid dimensions");
      return false;
    }

    // Canvas를 Blob으로 변환
    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(null);
            }
          },
          "image/png"
          // 품질 파라미터 제거 (PNG는 품질 파라미터를 무시함)
        );
      } catch (error) {
        console.error("toBlob threw error:", error);
        resolve(null);
      }
    });

    if (!blob) {
      console.error("Failed to create blob from canvas");
      return false;
    }

    // FormData로 서버에 전송
    const formData = new FormData();
    formData.append("screenshot", blob, "screenshot.png");

    const response = await fetch(`/api/projects/${projectId}/screenshot`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to upload screenshot:", response.statusText);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Screenshot capture error:", error);
    return false;
  }
}
