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

  // Poll for status updates if generating
  useEffect(() => {
    if (currentStatus === "generating") {
      const interval = setInterval(async () => {
        const response = await fetch(`/api/projects/${project.id}/status`);
        const data = await response.json();

        if (data.status !== "generating") {
          setCurrentStatus(data.status);
          router.refresh();

          // 생성이 완료되면 스크린샷 자동 캡처
          if (data.status === "ready") {
            setTimeout(() => handleCaptureScreenshot(), 1500);
          }
        }
      }, 2000);

      return () => clearInterval(interval);
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
                }, 1500);
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
                  }, 1500);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
