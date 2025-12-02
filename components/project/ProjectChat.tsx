"use client";

import { useState, useRef, useEffect } from "react";
import { MorphingSquare } from "../ui/morphing-square";
import { AIModel, AI_MODELS } from "@/lib/aiTypes";
import { ModelIcons } from "@/lib/aiIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface ProjectChatProps {
  projectId: string;
  onFilesUpdate?: () => void;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  aiModel?: AIModel;
  filesChanged?: string[];
  createdAt?: string;
}

export default function ProjectChat({
  projectId,
  onFilesUpdate,
}: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("claude");
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
    const modelToUse = selectedModel;
    setInput("");
    setIsLoading(true);

    // Call AI API to get response
    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, aiModel: modelToUse }),
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
        onFilesUpdate();
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
    <div className="h-full flex flex-col border-l border-white/20">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 pb-32 space-y-4 relative z-10">
        {/* Conversation Messages */}
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            {message.role === "user" ? (
              <>
                <div className="flex justify-end">
                  <div className="bg-white/10 backdrop-blur-sm text-white rounded-lg px-4 py-2 max-w-[85%]">
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
                <div className="backdrop-blur-sm text-white px-4 py-2">
                  <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match;
                          return isInline ? (
                            <code
                              className="bg-white/10 px-1.5 py-0.5 rounded text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-black/30 border border-white/10 rounded-lg p-3 overflow-x-auto">
                            {children}
                          </pre>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold mb-2 mt-3">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold mb-2 mt-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-bold mb-2 mt-2">
                            {children}
                          </h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-white/30 pl-4 italic my-2">
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
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
            )}
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center pl-4">
            <MorphingSquare className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Floating Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="relative bg-white/10 border border-white/10 rounded-2xl overflow-hidden">
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
                  className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/40 resize-none min-h-[32px] max-h-[200px]"
                  disabled={isLoading}
                  rows={1}
                  style={{
                    height: "auto",
                    overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
                  }}
                />
              </div>

              {/* Bottom Layer - Actions */}
              <div className="px-2 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    disabled={isLoading}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <svg
                      className="w-3 h-3 text-white"
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        disabled={isLoading}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors text-white text-xs font-medium disabled:opacity-50 border border-white/8 focus:outline-none"
                      >
                        {ModelIcons[selectedModel]}
                        <span>
                          {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                        </span>
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
                      className="w-[200px] border-white/8 p-2"
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
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 w-5 h-5 p-1 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center"
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
