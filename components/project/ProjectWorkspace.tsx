"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import ProjectNav from "./ProjectNav";
import ProjectCode from "./ProjectCode";
import ProjectScreen, { ProjectScreenRef } from "./ProjectScreen";
import ProjectChat from "./ProjectChat";

import { MorphingSquare } from "../ui/morphing-square";
import { captureAndUploadScreenshot } from "@/lib/screenshot";

interface Project {
  id: string;
  prompt: string;
  name: string | null;
  files: Record<string, string> | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ProjectWorkspace({ project }: { project: Project }) {
  const router = useRouter();
  const projectScreenRef = useRef<ProjectScreenRef>(null);
  const [currentStatus, setCurrentStatus] = useState(project.status);
  const [currentView, setCurrentView] = useState<"code" | "preview">("preview");
  const [viewportSize, setViewportSize] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const isGeneratingRef = useRef(false); // 중복 호출 방지

  // 스크린샷 캡처 함수 (백그라운드에서 캡처)
  const handleCaptureScreenshot = useCallback(async () => {
    if (isCapturingScreenshot) return;

    const iframe = projectScreenRef.current?.getIframeElement();
    if (!iframe) {
      console.warn("Preview iframe not ready yet, will retry...");
      return;
    }

    setIsCapturingScreenshot(true);
    try {
      await captureAndUploadScreenshot(iframe, project.id);
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [isCapturingScreenshot, project.id]);

  useEffect(() => {
    if (currentStatus === "generating" && !isGeneratingRef.current) {
      isGeneratingRef.current = true; // 중복 호출 방지 플래그 설정

      const startGeneration = async () => {
        try {
          const response = await fetch(`/api/projects/${project.id}/generate`, {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Failed to start generation");
          }

          if (!response.body) {
            throw new Error("No response body");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "complete") {
                    // 생성 완료
                    setCurrentStatus("ready");
                    router.refresh();

                    // 스크린샷 자동 캡처
                    setTimeout(() => handleCaptureScreenshot(), 3000);
                  } else if (data.type === "error") {
                    setCurrentStatus("failed");
                    router.refresh();
                  }
                } catch (e) {
                  // JSON 파싱 실패는 무시
                  if (e instanceof SyntaxError) continue;
                  throw e;
                }
              }
            }
          }
        } catch (error) {
          console.error("Generation error:", error);
          setCurrentStatus("failed");
          router.refresh();
        }
      };

      startGeneration();
    }
  }, [currentStatus, project.id, router, handleCaptureScreenshot]);

  // Handle chat resize
  const handleResizeStart = () => {
    setIsResizing(true);

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Generating state
  if (currentStatus === "generating") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <MorphingSquare message="Generating..." />
        </div>
      </div>
    );
  }

  // Failed state
  if (currentStatus === "failed") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Generation failed
          </h1>
          <p className="text-white/60 mb-8">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#D4A574] hover:bg-[#C68E52] text-black rounded-lg transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  // Ready state - IDE layout
  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Nav */}
      <ProjectNav
        projectName={project.name}
        currentView={currentView}
        onViewChange={setCurrentView}
        viewportSize={viewportSize}
        onViewportChange={setViewportSize}
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code or Preview */}
        <div
          className="flex-1 overflow-hidden"
          style={{ pointerEvents: isResizing ? "none" : "auto" }}
        >
          {/* Code 뷰 */}
          <div className={currentView === "code" ? "h-full" : "hidden"}>
            <ProjectCode
              files={project.files}
              projectId={project.id}
              onFilesUpdate={() => {
                setTimeout(async () => {
                  await handleCaptureScreenshot();
                  router.refresh();
                }, 3000);
              }}
            />
          </div>

          {/* Preview 뷰 - 항상 렌더링 (Code 뷰일 때는 숨김) */}
          <div className={currentView === "preview" ? "h-full" : "hidden"}>
            <ProjectScreen
              ref={projectScreenRef}
              files={project.files}
              viewportSize={viewportSize}
            />
          </div>
        </div>

        {/* Right: Chat */}
        {isChatOpen && (
          <div
            className="shrink-0 relative flex"
            style={{ width: `${chatWidth}px` }}
          >
            {/* Resizer */}
            <div
              className="w-px bg-none cursor-col-resize transition-all relative group"
              onMouseDown={handleResizeStart}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>

            {/* Chat content */}
            <div className="flex-1 overflow-hidden">
              <ProjectChat
                projectId={project.id}
                onFilesUpdate={() => {
                  setTimeout(async () => {
                    await handleCaptureScreenshot();
                    router.refresh();
                  }, 3000);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
