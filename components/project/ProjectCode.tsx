"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  const [localFiles, setLocalFiles] = useState<Record<string, string>>(
    files || {}
  );
  const [openTabs, setOpenTabs] = useState<string[]>(["app/page.tsx"]);
  const [selectedFile, setSelectedFile] = useState<string>("app/page.tsx");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved"
  );

  // Sync with props when files change
  useEffect(() => {
    if (files) {
      setLocalFiles(files);
    }
  }, [files]);

  // Convert files object to sorted array for file tree
  const fileList = useMemo(() => {
    if (!localFiles) return [];
    return Object.keys(localFiles).sort();
  }, [localFiles]);

  // Set initial selected file
  useEffect(() => {
    if (fileList.length > 0 && !fileList.includes(selectedFile)) {
      setSelectedFile(fileList[0]);
      setOpenTabs([fileList[0]]);
    }
  }, [fileList, selectedFile]);

  if (!files || fileList.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center">
          <p className="text-white/40 text-sm">No code generated yet</p>
        </div>
      </div>
    );
  }

  // Get file language for syntax highlighting
  const getLanguage = (filePath: string) => {
    if (filePath.endsWith(".tsx") || filePath.endsWith(".ts"))
      return "typescript";
    if (filePath.endsWith(".jsx") || filePath.endsWith(".js"))
      return "javascript";
    if (filePath.endsWith(".json")) return "json";
    if (filePath.endsWith(".css")) return "css";
    if (filePath.endsWith(".html")) return "html";
    return "typescript";
  };

  // Get file icon
  const getFileIcon = (filePath: string) => {
    if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
      return (
        <svg
          className="w-3 h-3 text-blue-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />
        </svg>
      );
    }
    if (filePath.endsWith(".ts")) {
      return (
        <svg
          className="w-3 h-3 text-blue-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />
        </svg>
      );
    }
    if (filePath.endsWith(".json")) {
      return (
        <svg
          className="w-3 h-3 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />
        </svg>
      );
    }
    return (
      <svg
        className="w-3 h-3 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" />
      </svg>
    );
  };

  // Get display name for file (show nested structure)
  const getDisplayName = (filePath: string) => {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts.length > 1 ? parts[0] + "/" : "";
    return { folder, fileName };
  };

  // Group files by folder
  const groupedFiles = useMemo(() => {
    const groups: Record<string, string[]> = {};
    fileList.forEach((file) => {
      const folder = file.includes("/") ? file.split("/")[0] : "root";
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(file);
    });
    return groups;
  }, [fileList]);

  // Handle code changes
  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;

    setLocalFiles((prev) => ({
      ...prev,
      [selectedFile]: value,
    }));
    setSaveStatus("unsaved");
  }, [selectedFile]);

  // Save code to database
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: localFiles }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSaveStatus("saved");

      // Trigger refresh after save
      if (onFilesUpdate) {
        setTimeout(() => {
          onFilesUpdate();
        }, 500);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus("unsaved");
    } finally {
      setIsSaving(false);
    }
  }, [projectId, localFiles, onFilesUpdate]);

  // Open file in new tab
  const handleFileClick = useCallback((file: string) => {
    setSelectedFile(file);
    setOpenTabs((prev) => {
      if (!prev.includes(file)) {
        return [...prev, file];
      }
      return prev;
    });
  }, []);

  // Close tab
  const handleCloseTab = useCallback((file: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const newTabs = prev.filter((tab) => tab !== file);
      if (selectedFile === file && newTabs.length > 0) {
        setSelectedFile(newTabs[newTabs.length - 1]);
      }
      return newTabs;
    });
  }, [selectedFile]);

  // Copy code to clipboard
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localFiles[selectedFile] || "");
    } catch (error) {
      console.error("Copy error:", error);
    }
  }, [localFiles, selectedFile]);

  // Keyboard shortcut for save
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

  return (
    <div className="h-full flex bg-[#1E1E1E]">
      {/* File Tree */}
      <div className="w-64 bg-[#181818] border-r border-white/10 overflow-auto">
        <div className="p-3">
          <div className="text-white/50 text-[10px] font-mono uppercase tracking-wider mb-3">
            Files
          </div>

          {Object.entries(groupedFiles).map(([folder, filesInFolder]) => (
            <div key={folder} className="mb-3">
              {folder !== "root" && (
                <div className="text-white/50 text-[10px] font-mono uppercase tracking-wider mb-1 px-2">
                  {folder}/
                </div>
              )}
              {filesInFolder.map((file) => {
                const { fileName } = getDisplayName(file);
                return (
                  <button
                    key={file}
                    onClick={() => handleFileClick(file)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition-colors ${
                      selectedFile === file
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {getFileIcon(file)}
                    <span className="truncate">{fileName}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar with Multiple Tabs */}
        <div className="h-9 bg-[#181818] border-b border-white/10 flex items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center overflow-x-auto">
            {openTabs.map((file) => (
              <div
                key={file}
                className={`h-9 px-3 flex items-center gap-2 text-xs font-mono border-r border-white/10 transition-colors group relative ${
                  selectedFile === file
                    ? "bg-[#1E1E1E] text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <button
                  onClick={() => setSelectedFile(file)}
                  className="flex items-center gap-2 flex-1"
                >
                  {getFileIcon(file)}
                  <span className="max-w-[120px] truncate">{file}</span>
                </button>
                {openTabs.length > 1 && (
                  <div
                    onClick={(e) => handleCloseTab(file, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleCloseTab(file, e as unknown as React.MouseEvent);
                      }
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 transition-opacity cursor-pointer"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 px-2">
            {/* Save Status */}
            {saveStatus === "unsaved" && (
              <span className="text-[10px] text-orange-400 font-mono mr-2">
                • Unsaved
              </span>
            )}
            {saveStatus === "saving" && (
              <span className="text-[10px] text-blue-400 font-mono mr-2">
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-[10px] text-green-400 font-mono mr-2">
                ✓ Saved
              </span>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
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
              disabled={isSaving || saveStatus === "saved"}
              className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            language={getLanguage(selectedFile)}
            value={localFiles[selectedFile] || ""}
            onChange={handleCodeChange}
            theme="vs-dark"
            beforeMount={(monaco) => {
              // Configure TypeScript to reduce errors for virtual file system
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: false,
                noSuggestionDiagnostics: true,
              });

              // Add compiler options
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.React,
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                moduleResolution:
                  monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                allowSyntheticDefaultImports: true,
                esModuleInterop: true,
                skipLibCheck: true,
              });
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
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
    </div>
  );
}
