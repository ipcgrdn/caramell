"use client";

import { useMemo } from "react";

type ViewportSize = "desktop" | "tablet" | "mobile";

interface ProjectScreenProps {
  files: Record<string, string> | null;
  viewportSize?: ViewportSize;
}

const viewportDimensions = {
  desktop: { width: "100%", maxWidth: "100%" },
  tablet: { width: "768px", maxWidth: "768px" },
  mobile: { width: "375px", maxWidth: "375px" },
};

export default function ProjectScreen({
  files,
  viewportSize = "desktop",
}: ProjectScreenProps) {
  // Generate preview HTML from React files
  const previewHTML = useMemo(() => {
    if (!files || Object.keys(files).length === 0) {
      return null;
    }

    // Transform files to browser-executable code
    const transformedCode = transformFilesToBrowserCode(files);

    // Build complete HTML with React runtime
    return buildPreviewHTML(transformedCode);
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
          srcDoc={previewHTML}
          title="Preview"
          className="w-full h-full border-0 p-2 rounded-2xl"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}

// Transform React files to browser-executable code
function transformFilesToBrowserCode(files: Record<string, string>): string {
  let code = "";

  // Sort files to ensure components are defined before page
  const sortedFiles = Object.entries(files).sort(([pathA], [pathB]) => {
    // Components first, then app/page.tsx
    if (pathA.startsWith("components/")) return -1;
    if (pathB.startsWith("components/")) return 1;
    return 0;
  });

  for (const [filePath, content] of sortedFiles) {
    // Skip non-tsx/jsx files for now
    if (!filePath.endsWith(".tsx") && !filePath.endsWith(".jsx")) {
      continue;
    }

    // Transform the code
    let transformed = content;

    // Remove 'use client' directive
    transformed = transformed.replace(/['"]use client['"];?\n/g, "");

    // Remove import statements (we'll use CDN for React)
    transformed = transformed.replace(/^import .+$/gm, "");

    // Remove export default, just keep the function
    transformed = transformed.replace(/export default /g, "");

    // Clean up empty lines
    transformed = transformed.trim();

    code += `\n${transformed}\n`;
  }

  return code;
}

// Build complete HTML with React runtime
function buildPreviewHTML(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useMemo, useCallback, useRef } = React;

    ${code}

    // Render the Page component
    const root = ReactDOM.createRoot(document.getElementById('root'));

    // Try to render Page component if it exists
    try {
      if (typeof Page !== 'undefined') {
        root.render(<Page />);
      } else {
        root.render(
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Page component not found</p>
          </div>
        );
      }
    } catch (error) {
      console.error('Render error:', error);
      root.render(
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
          <h3>Error rendering preview</h3>
          <p>{error.message}</p>
        </div>
      );
    }
  </script>
</body>
</html>`;
}
