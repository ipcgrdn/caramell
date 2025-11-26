"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectNav from "./ProjectNav";
import ProjectCode from "./ProjectCode";
import ProjectScreen from "./ProjectScreen";
import ProjectChat from "./ProjectChat";

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
  const [currentStatus, setCurrentStatus] = useState(project.status);
  const [currentView, setCurrentView] = useState<"code" | "preview">("preview");
  const [viewportSize, setViewportSize] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Poll for status updates if generating
  useEffect(() => {
    if (currentStatus === "generating") {
      const interval = setInterval(async () => {
        const response = await fetch(`/api/projects/${project.id}/status`);
        const data = await response.json();

        if (data.status !== "generating") {
          setCurrentStatus(data.status);
          router.refresh();
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentStatus, project.id, router]);

  // Generating state
  if (currentStatus === "generating") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="w-8 h-8 mx-auto animate-spin text-[#D4A574]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-playfair text-white mb-4">Generating</h1>
        </div>
      </div>
    );
  }

  // Failed state
  if (currentStatus === "failed") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Generation failed
          </h1>
          <p className="text-white/60 mb-8">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#D4A574] hover:bg-[#C68E52] text-white rounded-lg transition-colors"
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
        <div className="flex-1 overflow-hidden">
          {currentView === "code" ? (
            <ProjectCode
              files={project.files}
              projectId={project.id}
              onFilesUpdate={() => router.refresh()}
            />
          ) : (
            <ProjectScreen files={project.files} viewportSize={viewportSize} />
          )}
        </div>

        {/* Right: Chat */}
        {isChatOpen && (
          <div className="w-100 shrink-0">
            <ProjectChat
              initialPrompt={project.prompt}
              projectId={project.id}
              onFilesUpdate={() => router.refresh()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
