/**
 * ScreenshotOne API를 사용한 스크린샷 생성
 * 프로젝트의 스크린샷을 서버에서 생성하도록 요청
 */

export async function captureAndUploadScreenshot(
  projectId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/projects/${projectId}/screenshot`, {
      method: "POST",
    });

    if (!response.ok) {
      console.error("Failed to capture screenshot:", response.statusText);
      return false;
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error("Screenshot capture error:", error);
    return false;
  }
}
