"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-media-query";
import { toast } from "sonner";

import ProjectNav from "./ProjectNav";
import ProjectCode from "./ProjectCode";
import ProjectScreen from "./ProjectScreen";
import ProjectChat from "./ProjectChat";
import GeneratingModal from "./GeneratingModal";
import CreatingModal from "./CreatingModal";

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
  const isMobile = useIsMobile();

  const [currentStatus, setCurrentStatus] = useState(project.status);
  const [files, setFiles] = useState<Record<string, string> | null>(
    project.files
  );

  const getStorageKey = (key: string) => `project_${project.id}_${key}`;

  const [currentView, setCurrentView] = useState<"code" | "preview">("preview");
  const [viewportSize, setViewportSize] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(!isMobile);
  const [chatWidth, setChatWidth] = useState(400);
  const [isGeneratingNextJs, setIsGeneratingNextJs] = useState(false);
  const [streamingCode, setStreamingCode] = useState<string>("");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    const savedView = localStorage.getItem(getStorageKey("currentView"));
    if (savedView) setCurrentView(savedView as "code" | "preview");

    const savedViewport = localStorage.getItem(getStorageKey("viewportSize"));
    if (savedViewport)
      setViewportSize(savedViewport as "desktop" | "tablet" | "mobile");

    const savedChat = localStorage.getItem(getStorageKey("isChatOpen"));
    if (savedChat !== null) setIsChatOpen(savedChat === "true");

    const savedWidth = localStorage.getItem(getStorageKey("chatWidth"));
    if (savedWidth) setChatWidth(parseInt(savedWidth, 10));
  }, [project.id]);

  const [isResizing, setIsResizing] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const isGeneratingRef = useRef(false);

  const handleCaptureScreenshot = useCallback(async () => {
    if (isCapturingScreenshot) return;

    setIsCapturingScreenshot(true);
    try {
      await captureAndUploadScreenshot(project.id);
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [isCapturingScreenshot, project.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("currentView"), currentView);
  }, [currentView, project.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("viewportSize"), viewportSize);
  }, [viewportSize, project.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("isChatOpen"), String(isChatOpen));
  }, [isChatOpen, project.id]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("chatWidth"), String(chatWidth));
  }, [chatWidth, project.id]);

  useEffect(() => {
    if (currentStatus === "generating" && !isGeneratingRef.current) {
      isGeneratingRef.current = true;

      const startGeneration = async () => {
        try {
          const response = await fetch(`/api/projects/${project.id}/generate`, {
            method: "POST",
          });

          if (!response.ok) {
            // 크레딧 부족 에러 처리
            if (response.status === 402) {
              toast.error("Not enough credits", {
                action: {
                  label: "Buy Credits",
                  onClick: () => router.push("/pricing"),
                },
              });
              setCurrentStatus("failed");
              return;
            }
            throw new Error("Failed to start generation");
          }

          if (!response.body) {
            throw new Error("No response body");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "chunk") {
                    // 스트리밍 텍스트 누적
                    accumulatedText += data.text;

                    // HTML 코드 부분만 추출 (콜론 앞뒤 공백 허용)
                    const htmlMatch = accumulatedText.match(
                      /"index\.html"\s*:\s*"([\s\S]*?)(?:"}}|$)/
                    );
                    if (htmlMatch) {
                      // 이스케이프된 문자 처리
                      const htmlCode = htmlMatch[1]
                        .replace(/\\n/g, "\n")
                        .replace(/\\"/g, '"')
                        .replace(/\\t/g, "\t")
                        .replace(/\\\\/g, "\\");

                      setStreamingCode(htmlCode);
                    }
                  } else if (data.type === "complete") {
                    setCurrentStatus("ready");
                    setStreamingCode("");
                    // SSE에서 받은 파일로 즉시 업데이트
                    if (data.files) {
                      setFiles(data.files);
                    }
                    setTimeout(() => handleCaptureScreenshot(), 1000);
                  } else if (data.type === "error") {
                    setCurrentStatus("failed");
                    setStreamingCode("");
                  }
                } catch (e) {
                  if (e instanceof SyntaxError) continue;
                  throw e;
                }
              }
            }
          }
        } catch (error) {
          console.error("Generation error:", error);
          setCurrentStatus("failed");
        }
      };

      startGeneration();
    }
  }, [currentStatus, project.id, handleCaptureScreenshot]);

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

  const handleGenerateNextProject = async () => {
    if (!files || !files["index.html"]) {
      toast.error("File not found");
      return;
    }

    setIsGeneratingNextJs(true);

    try {
      const response = await fetch(`/api/projects/${project.id}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          htmlContent: files["index.html"],
        }),
      });

      if (!response.ok) {
        // 크레딧 부족 에러 처리
        if (response.status === 402) {
          toast.error("Not enough credits", {
            action: {
              label: "Buy Credits",
              onClick: () => router.push("/pricing"),
            },
          });
          return;
        }
        throw new Error("Failed to generate project");
      }

      // Get ZIP file as blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Caramell-NextJS-${project.id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Next.js project downloaded!");
    } catch (error) {
      console.error("Failed to generate Next.js project:", error);
      toast.error("Failed to generate Next.js project");
    } finally {
      setIsGeneratingNextJs(false);
    }
  };

  if (currentStatus === "generating") {
    return <CreatingModal isOpen={true} streamingCode={streamingCode} />;
  }

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

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Generating Modal */}
      <GeneratingModal isOpen={isGeneratingNextJs} />

      {/* Nav */}
      <ProjectNav
        currentView={currentView}
        onViewChange={setCurrentView}
        viewportSize={viewportSize}
        onViewportChange={setViewportSize}
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        projectId={project.id}
        files={files}
        onGenerateNextProject={handleGenerateNextProject}
        onRefreshPreview={() => setPreviewKey((prev) => prev + 1)}
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
              files={files}
              projectId={project.id}
              onFilesUpdate={(updatedFiles) => setFiles(updatedFiles)}
            />
          </div>

          {/* Preview 뷰 - 항상 렌더링 (Code 뷰일 때는 숨김) */}
          <div className={currentView === "preview" ? "h-full" : "hidden"}>
            <ProjectScreen
              key={previewKey}
              files={files}
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
                onFilesUpdate={(updatedFiles) => {
                  setFiles(updatedFiles);
                  setTimeout(() => handleCaptureScreenshot(), 1000);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
