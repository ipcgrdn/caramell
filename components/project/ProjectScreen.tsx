"use client";

import { useMemo, useRef, useImperativeHandle, forwardRef } from "react";

type ViewportSize = "desktop" | "tablet" | "mobile";

interface ProjectScreenProps {
  files: Record<string, string> | null;
  viewportSize?: ViewportSize;
}

export interface ProjectScreenRef {
  getIframeElement: () => HTMLIFrameElement | null;
}

const viewportDimensions = {
  desktop: { width: "100%", maxWidth: "100%" },
  tablet: { width: "768px", maxWidth: "768px" },
  mobile: { width: "375px", maxWidth: "375px" },
};

const ProjectScreen = forwardRef<ProjectScreenRef, ProjectScreenProps>(
  function ProjectScreen({ files, viewportSize = "desktop" }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // iframe 요소에 접근할 수 있도록 ref 노출
    useImperativeHandle(ref, () => ({
      getIframeElement: () => iframeRef.current,
    }));

    // Get HTML content directly
    const previewHTML = useMemo(() => {
      if (!files || Object.keys(files).length === 0) {
        return null;
      }

      // Simply return the index.html content
      return files["index.html"] || null;
    }, [files]);

    if (!previewHTML) {
      return (
        <div className="flex items-center justify-center h-full bg-white">
          <div className="text-center">
            <p className="text-black text-sm">No preview available</p>
          </div>
        </div>
      );
    }

    const dimensions = viewportDimensions[viewportSize];

    return (
      <div className="h-full w-full overflow-auto flex items-start justify-center">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: dimensions.width,
            maxWidth: dimensions.maxWidth,
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={previewHTML}
            title="Preview"
            className="w-full h-full border-0 p-2 rounded-2xl"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    );
  }
);

export default ProjectScreen;
