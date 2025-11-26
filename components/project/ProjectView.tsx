"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  prompt: string;
  name: string | null;
  generatedCode: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

{/* 아직까지 구현되지 않은 상태 나중에 전부 다 뜯어 고쳐야 함 */}

export default function ProjectView({ project }: { project: Project }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(project.status);

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
          <h1 className="text-2xl font-playfair text-white mb-4">
            Generating
          </h1>
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

  // Ready state - show preview
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-playfair text-white mb-2">
              {project.name || "Untitled Project"}
            </h1>
            <p className="text-white/60 text-sm">{project.prompt}</p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              Regenerate  
            </button>
            <button className="px-4 py-2 bg-[#D4A574] hover:bg-[#C68E52] text-white rounded-lg transition-colors">
              Publish
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
          {project.generatedCode ? (
            <div
              dangerouslySetInnerHTML={{ __html: project.generatedCode }}
              className="w-full min-h-screen"
            />
          ) : (
            <div className="p-20 text-center text-gray-500">
              No code generated yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
