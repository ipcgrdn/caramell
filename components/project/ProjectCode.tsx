"use client";

import { useState } from "react";

interface ProjectCodeProps {
  code: string | null;
}

export default function ProjectCode({ code }: ProjectCodeProps) {
  const [selectedFile, setSelectedFile] = useState("index.html");

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center">
          <p className="text-white/40 text-sm">No code generated yet</p>
        </div>
      </div>
    );
  }

  // Simple file structure (can be expanded later)
  const files = [
    { name: "index.html", icon: "html", content: code },
  ];

  return (
    <div className="h-full flex bg-[#1E1E1E]">
      {/* File Tree */}
      <div className="w-48 bg-[#181818] border-r border-white/10 overflow-auto">
        <div className="p-3">
          <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider mb-2">
            Files
          </div>
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file.name)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition-colors ${
                selectedFile === file.name
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {file.icon === "html" && (
                <svg
                  className="w-3 h-3 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10H7v-2h5V8l3 4-3 4v-2z" />
                </svg>
              )}
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <div className="h-8 bg-[#181818] border-b border-white/10 flex items-center px-3">
          <div className="flex items-center gap-2 bg-[#1E1E1E] px-3 py-1 rounded-t-lg text-xs text-white/80 font-mono">
            <svg
              className="w-3 h-3 text-orange-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10H7v-2h5V8l3 4-3 4v-2z" />
            </svg>
            {selectedFile}
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto">
          <pre className="p-4 text-xs text-white/90 font-mono leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
