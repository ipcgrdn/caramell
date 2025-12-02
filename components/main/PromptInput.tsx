"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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
  const [selectedModel, setSelectedModel] = useState<AIModel>("claude");
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [designStyle, setDesignStyle] = useState<string>("");
  const router = useRouter();
  const { isSignedIn } = useUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
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
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, aiModel: selectedModel }),
      });

      const data = await response.json();

      if (data.success && data.projectId) {
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

  const selectedModelConfig = AI_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl">
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

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Attach Button */}
          <button
            disabled={isLoading}
            className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
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
