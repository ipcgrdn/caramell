"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewportSize = "desktop" | "tablet" | "mobile";

interface ProjectNavProps {
  currentView: "code" | "preview";
  onViewChange: (view: "code" | "preview") => void;
  viewportSize?: ViewportSize;
  onViewportChange?: (size: ViewportSize) => void;
  isChatOpen?: boolean;
  onChatToggle?: () => void;
  projectId?: string;
  files?: Record<string, string> | null;
  onGenerateNextProject?: () => void;
}

export default function ProjectNav({
  currentView,
  onViewChange,
  viewportSize = "desktop",
  onViewportChange,
  isChatOpen = false,
  onChatToggle,
  projectId,
  files,
  onGenerateNextProject,
}: ProjectNavProps) {
  const router = useRouter();

  // Export handlers
  const handleCopyHTML = async () => {
    if (!files || !files["index.html"]) {
      toast.error("File not found");
      return;
    }

    try {
      await navigator.clipboard.writeText(files["index.html"]);
      toast.success("HTML copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy HTML:", error);
      toast.error("Failed to copy HTML");
    }
  };

  const handleDownloadHTML = () => {
    if (!files || !files["index.html"]) {
      toast.error("File not found");
      return;
    }

    try {
      const blob = new Blob([files["index.html"]], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Caramell-project-${projectId || "export"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("File downloaded!");
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  return (
    <nav className="h-10 flex items-center justify-between px-4 border-b border-white/20">
      {/* Left: Back button + Project name */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Go back"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 12H5M5 12l6-6M5 12l6 6"
            />
          </svg>
        </button>
      </div>

      {/* Center: View toggle and Viewport controls */}
      <div className="flex items-center gap-3">
        {/* View toggle */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => onViewChange("code")}
            className={`px-2 py-1 rounded-md text-xs font-instrument transition-all flex items-center gap-1.5 ${
              currentView === "code"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <span className="hidden md:block">Code</span>
          </button>
          <button
            onClick={() => onViewChange("preview")}
            className={`px-2 py-1 rounded-md text-xs font-instrument transition-all flex items-center gap-1.5 ${
              currentView === "preview"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="hidden md:block">Preview</span>
          </button>
        </div>

        {/* Viewport controls - disabled when not in preview mode */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => onViewportChange?.("desktop")}
            disabled={currentView !== "preview" || !onViewportChange}
            className={`p-1.5 rounded-md transition-all ${
              currentView !== "preview" || !onViewportChange
                ? "text-white/60 cursor-not-allowed"
                : viewportSize === "desktop"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
            aria-label="Desktop view"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="8"
                y1="21"
                x2="16"
                y2="21"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="21"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewportChange?.("tablet")}
            disabled={currentView !== "preview" || !onViewportChange}
            className={`p-1.5 rounded-md transition-all ${
              currentView !== "preview" || !onViewportChange
                ? "text-white/60 cursor-not-allowed"
                : viewportSize === "tablet"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
            aria-label="Tablet view"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="5"
                y="2"
                width="14"
                height="20"
                rx="2"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="18"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewportChange?.("mobile")}
            disabled={currentView !== "preview" || !onViewportChange}
            className={`p-1.5 rounded-md transition-all ${
              currentView !== "preview" || !onViewportChange
                ? "text-white/60 cursor-not-allowed"
                : viewportSize === "mobile"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
            aria-label="Mobile view"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect
                x="7"
                y="2"
                width="10"
                height="20"
                rx="2"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="18"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="px-2 py-1 text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="hidden md:block">Upgrade</span>
        </button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-1 bg-white hover:bg-[#D4A574] text-black text-xs rounded-lg transition-colors flex items-center gap-1.5">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="hidden md:block">Export</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-white/90 backdrop-blur-md border border-black/15 rounded-2xl overflow-hidden shadow-lg"
          >
            <DropdownMenuItem
              onClick={handleCopyHTML}
              className="cursor-pointer px-4 py-2 text-black/80 hover:bg-black/5 hover:text-black focus:bg-black/5 focus:text-black transition-colors flex items-center gap-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Copy HTML</span>
                <span className="text-xs text-black/60">Copy to clipboard</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleDownloadHTML}
              className="cursor-pointer px-4 py-2 text-black/80 hover:bg-black/5 hover:text-black focus:bg-black/5 focus:text-black transition-colors flex items-center gap-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Download HTML</span>
                <span className="text-xs text-black/60">Save as HTML file</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onGenerateNextProject}
              className="cursor-pointer px-4 py-2 text-black/80 hover:bg-black/5 hover:text-black focus:bg-black/5 focus:text-black transition-colors flex items-center gap-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-black">
                  Download as Next.js
                </span>
                <span className="text-xs text-black/60">
                  Download as complete project
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Chat toggle button */}
        {onChatToggle && (
          <button
            onClick={onChatToggle}
            className={`p-2 rounded-lg transition-all ${
              isChatOpen
                ? "text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            aria-label={isChatOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Sidebar panel icon */}
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="1"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Vertical divider line */}
              <line
                x1="15"
                y1="4"
                x2="15"
                y2="20"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {/* Arrow indicating close/open direction */}
              {isChatOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9l-2 3 2 3"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 9l2 3-2 3"
                />
              )}
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}
