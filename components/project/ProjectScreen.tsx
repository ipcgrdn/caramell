"use client";

type ViewportSize = "desktop" | "tablet" | "mobile";

interface ProjectScreenProps {
  code: string | null;
  viewportSize?: ViewportSize;
}

const viewportDimensions = {
  desktop: { width: "100%", maxWidth: "100%" },
  tablet: { width: "768px", maxWidth: "768px" },
  mobile: { width: "375px", maxWidth: "375px" },
};

export default function ProjectScreen({
  code,
  viewportSize = "desktop"
}: ProjectScreenProps) {
  if (!code) {
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
    <div className="h-full w-full overflow-auto bg-[#F5F5F5] flex items-start justify-center">
      <div
        className="h-full bg-white transition-all duration-300"
        style={{
          width: dimensions.width,
          maxWidth: dimensions.maxWidth
        }}
      >
        <iframe
          srcDoc={code}
          title="Preview"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
