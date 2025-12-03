"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { ModelIcons } from "@/lib/aiIcon";
import { AIModel, AI_MODELS } from "@/lib/aiTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PromptEnhancerModal from "./PromptEnhancer";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini");
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [designStyle, setDesignStyle] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    if (!isSignedIn) {
      router.push("/signin");
      return;
    }

    setIsLoading(true);

    try {
      const encodedFiles = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file),
        }))
      );

      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          aiModel: selectedModel,
          files: encodedFiles.length > 0 ? encodedFiles : undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.projectId) {
        setSelectedFiles([]);
        router.push(`/project/${data.projectId}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleApplyStyle = (style: string) => {
    setDesignStyle(style);
    if (prompt && !prompt.includes(style)) {
      setPrompt((prev) => `${prev}\n\n${style}`);
    } else if (!prompt) {
      setPrompt(style);
    }
  };

  // 파일 선택 버튼 클릭 핸들러
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 유효성 검사
  const validateFiles = (files: File[]): File[] => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];

    for (const file of files) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }

      // 파일 크기 확인
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 5MB size limit.`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const validFiles = validateFiles(newFiles);

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => {
          const combined = [...prev, ...validFiles];
          if (combined.length > 5) {
            toast.error("You can attach up to 5 files.");
            return combined.slice(0, 5);
          }
          return combined;
        });
      }
    }
    e.target.value = "";
  };

  // 파일 제거 핸들러
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 파일을 Base64로 인코딩하는 함수
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const validFiles = validateFiles(newFiles);

      if (validFiles.length > 0) {
        setSelectedFiles((prev) => {
          const combined = [...prev, ...validFiles];
          if (combined.length > 5) {
            toast.error("You can attach up to 5 files.");
            return combined.slice(0, 5);
          }
          return combined;
        });
      }
    }
  };

  const selectedModelConfig = AI_MODELS.find((m) => m.id === selectedModel);

  return (
    <div
      className={`w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-2xl border p-4 shadow-2xl transition-all ${
        isDragging
          ? "border-[#D4A574] border-2 bg-[#D4A574]/10"
          : "border-white/10"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your landing page..."
          className="w-full bg-transparent text-white text-sm placeholder:text-white/40 outline-none resize-none min-h-[60px] max-h-[200px]"
          rows={1}
          disabled={isLoading}
          style={{
            height: "auto",
            overflowY: prompt.split("\n").length > 3 ? "auto" : "hidden",
          }}
        />
      </div>

      {/* 파일 미리보기 */}
      {selectedFiles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1 text-xs text-white group hover:bg-white/10 transition-colors"
            >
              {/* 파일 아이콘 */}
              <div className="shrink-0">
                {file.type.startsWith("image/") ? (
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
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
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* 파일 정보 */}
              <div className="flex-1 min-w-0">
                <div className="truncate">{file.name}</div>
              </div>

              {/* 제거 버튼 */}
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                title="Remove file"
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
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={isLoading}
            className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          {/* AI Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-white text-xs font-medium disabled:opacity-50 border border-white/10 focus:outline-none"
              >
                {ModelIcons[selectedModel]}
                <span>{selectedModelConfig?.name}</span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[200px] border-white/10 p-2"
            >
              {AI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className="flex items-start gap-3 px-2 py-2 cursor-pointer rounded-lg hover:bg-white/10 focus:bg-white/10 data-highlighted:bg-white/10"
                >
                  <div className="mt-0.5">{ModelIcons[model.id]}</div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-medium">
                      {model.name}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Prompt Enhancer Button */}
          <button
            onClick={() => setIsEnhancerOpen(true)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-white text-xs font-medium disabled:opacity-50 border border-white/10 hover:bg-white/10"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <span>Enhancer</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
          className="p-2 hover:bg-white/10 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="w-4 h-4 animate-spin"
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
                d="M12 19V5M5 12l7-7 7 7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Prompt Enhancer Modal */}
      <PromptEnhancerModal
        isOpen={isEnhancerOpen}
        onClose={() => setIsEnhancerOpen(false)}
        onApply={handleApplyStyle}
        currentStyle={designStyle}
      />
    </div>
  );
}
