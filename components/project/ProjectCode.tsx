"use client";

import { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface ProjectCodeProps {
  files: Record<string, string> | null;
  projectId: string;
  onFilesUpdate?: (updatedFiles: Record<string, string>) => void;
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
      const updatedFiles = { ...files, "index.html": htmlCode };
      const response = await fetch(`/api/projects/${projectId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: updatedFiles }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSaveStatus("saved");

      // ProjectScreen 업데이트를 위해 부모에게 알림
      if (onFilesUpdate) {
        onFilesUpdate(updatedFiles);
      }

    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("unsaved");
    }
  }, [projectId, htmlCode, files, onFilesUpdate]);

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
      <div className="h-12 bg-transparent flex items-center justify-between px-4">
        <div className="flex items-center pl-4">
          <span className="text-white/60 text-sm font-mono">index.html</span>
        </div>

        <div className="flex items-center gap-2 bg-white/10 rounded-full px-2">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className={`p-2 hover:bg-white/10 rounded transition-colors disabled:cursor-not-allowed ${
              saveStatus === "unsaved"
                ? "text-blue-400 hover:text-blue-300"
                : "text-white/60 hover:text-white"
            }`}
            title="⌘+S"
          >
            {saveStatus === "saving" ? (
              <svg
                className="w-4 h-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="p-2 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
            title="Copy code"
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
