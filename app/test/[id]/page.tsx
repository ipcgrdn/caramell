"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { unicornProjects, unicornProjectsMap } from "@/app/test/unicorn-projects";

declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized: boolean;
      init: () => void;
    };
  }
}

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const project = unicornProjectsMap[id];

  useEffect(() => {
    if (!project) return;

    // Load Unicorn Studio script
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: () => {} };
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js";
      script.onload = () => {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    } else if (window.UnicornStudio.isInitialized) {
      // Re-initialize for new project
      window.UnicornStudio.init();
    }
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">프로젝트를 찾을 수 없습니다</h1>
        <Link href="/test" className="text-blue-400 hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Navigation */}
      <div className="hidden fixed top-4 left-4 z-50 gap-2">
        <Link
          href="/test"
          className="px-4 py-2 bg-black/80 text-white rounded-lg hover:bg-black/90 transition-colors border border-white/20"
        >
          ← 목록
        </Link>
        {unicornProjects.map((p) => (
          <Link
            key={p.id}
            href={`/test/${p.id}`}
            className={`px-4 py-2 rounded-lg transition-colors border ${
              p.id === id
                ? "bg-white text-black border-white"
                : "bg-black/80 text-white border-white/20 hover:bg-black/90"
            }`}
          >
            {p.id}
          </Link>
        ))}
      </div>

      {/* Full page embed */}
      <div
        data-us-project={project.projectId}
        style={{ width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
