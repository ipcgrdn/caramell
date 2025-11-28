"use client";

import { useState, useRef, useEffect } from "react";

interface ProjectChatProps {
  initialPrompt: string;
  projectId: string;
  onFilesUpdate?: () => void;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  filesChanged?: string[];
  createdAt?: string;
}

export default function ProjectChat({
  initialPrompt,
  projectId,
  onFilesUpdate,
}: ProjectChatProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/chat`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [projectId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput("");
    setIsLoading(true);

    // Call AI API to get response
    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If files were updated, refresh the parent
      if (data.filesUpdated && onFilesUpdate) {
        // Small delay to ensure DB is updated
        setTimeout(() => {
          onFilesUpdate();
        }, 500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Liquid Glass Container */}
      <div className="absolute inset-0 backdrop-blur-xl bg-linear-to-br from-white/8 via-white/5 to-white/2 rounded-3xl border border-white/10 pointer-events-none" />

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 pb-32 space-y-4 relative z-10">
        {/* Initial User Prompt */}
        <div className="space-y-2">
          <div className="bg-white/5 backdrop-blur-sm text-white rounded-2xl px-5 py-4 relative border border-white/10">
            <div
              className={`text-sm leading-relaxed ${
                !showFullPrompt && initialPrompt.length > 200
                  ? "line-clamp-3"
                  : ""
              }`}
            >
              {initialPrompt}
            </div>
            {initialPrompt.length > 200 && (
              <button
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="mt-2 text-xs text-white/60 hover:text-white flex items-center gap-1"
              >
                {showFullPrompt ? "Show Less" : "Show All"}
                <svg
                  className={`w-3 h-3 transition-transform ${
                    showFullPrompt ? "rotate-180" : ""
                  }`}
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
            )}
          </div>

          {/* Copy Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleCopyMessage(initialPrompt)}
              className="text-white/40 hover:text-white/60 p-1 transition-colors"
              title="Copy message"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation Messages */}
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            {message.role === "user" ? (
              <>
                <div className="flex justify-end">
                  <div className="bg-white/10 backdrop-blur-sm text-white rounded-lg px-4 py-1 max-w-[85%] border border-white/10">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
                {/* Copy Button */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="text-white/40 hover:text-white/60 p-1 transition-colors"
                    title="Copy message"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="backdrop-blur-sm text-white px-4 py-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                {/* Copy Button */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="text-white/40 hover:text-white/60 p-1 transition-colors"
                    title="Copy message"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#D4A574] rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Floating Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        {/* Dark Gradient Backdrop */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="relative bg-white/10 border border-white/20 rounded-lg overflow-hidden">
            {/* Two-layer structure */}
            <div className="relative">
              {/* Top Layer - Input */}
              <div className="px-4 pt-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask for revisions..."
                  className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/30 resize-none min-h-[32px] max-h-[200px]"
                  disabled={isLoading}
                  rows={1}
                  style={{
                    height: "auto",
                    overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
                  }}
                />
              </div>

              {/* Bottom Layer - Actions */}
              <div className="px-4 py-1.5 flex items-center justify-between">
                {/* Plus Button */}
                <button
                  type="button"
                  className="shrink-0 text-white/40 hover:text-white/60 transition-colors"
                  title="Add attachment"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 w-5 h-5 rounded-full bg-linear-to-br from-[#D4A574] to-[#C68E52] hover:from-[#C68E52] hover:to-[#B57D41] disabled:opacity-40 disabled:cursor-not-allowed text-black transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
