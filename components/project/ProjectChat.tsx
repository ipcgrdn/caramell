"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ProjectChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Implement AI chat API call
    // For now, just add a placeholder response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "Chat functionality coming soon...",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] border-l border-white/10 relative">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 pb-32 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-[200px]">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-linear-to-br from-[#D4A574]/20 to-[#C68E52]/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#D4A574]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <p className="text-white/40 text-xs text-center leading-relaxed">
                Ask AI to help improve your project
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                  message.role === "user"
                    ? "bg-linear-to-br from-[#D4A574] to-[#C68E52] text-white"
                    : "bg-white/5 text-white/90 backdrop-blur-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block px-3 py-2 rounded-xl text-xs bg-white/5 text-white/90 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-pulse delay-100" />
                <div className="w-1.5 h-1.5 bg-[#D4A574] rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-2 p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything..."
                className="flex-1 bg-transparent border-0 outline-none text-xs text-white placeholder:text-white/30 px-2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-[#D4A574] to-[#C68E52] hover:from-[#C68E52] hover:to-[#B57D41] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
                aria-label="Send message"
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
