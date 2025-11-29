"use client";

import { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface ProjectCodeProps {
  files: Record<string, string> | null;
  projectId: string;
  onFilesUpdate?: () => void;
}

export default function ProjectCode({
  files,
  projectId,
  onFilesUpdate,
}: ProjectCodeProps) {
  const [htmlCode, setHtmlCode] = useState<string>(files?.["index.html"] || "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved"
  );

  useEffect(() => {
    if (files?.["index.html"]) {
      setHtmlCode(files["index.html"]);
    }
  }, [files]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    setHtmlCode(value);
    setSaveStatus("unsaved");
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/projects/${projectId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: { "index.html": htmlCode } }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSaveStatus("saved");

      if (onFilesUpdate) {
        setTimeout(onFilesUpdate, 500);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("unsaved");
    }
  }, [projectId, htmlCode, onFilesUpdate]);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
    } catch (error) {
      console.error("Copy error:", error);
    }
  }, [htmlCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (!files?.["index.html"]) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center">
          <p className="text-white/40 text-sm">No code generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E]">
      {/* Header with Action Buttons */}
      <div className="h-12 bg-[#181818] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-orange-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />
          </svg>
          <span className="text-white/60 text-sm font-mono">index.html</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status */}
          {saveStatus === "unsaved" && (
            <span className="text-xs text-orange-400 font-mono">• Unsaved</span>
          )}
          {saveStatus === "saving" && (
            <span className="text-xs text-white font-mono">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-white font-mono">✓ Saved</span>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
            title="Copy code (Cmd+C)"
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
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save changes (Cmd+S)"
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="html"
          value={htmlCode}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            readOnly: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  );
}
