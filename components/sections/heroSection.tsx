"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useState } from "react";

export default function HeroSection() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="w-full min-h-screen relative overflow-hidden pt-32">
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#000000", "#1a1a1a", "#333333", "#D4A574", "#C68E52"]}
        speed={1.0}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-20">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-playfair text-white mb-4 text-center">
          <span className="font-playfair italic">Beautiful</span>{" "}
          <span className="font-playfair">Landing Pages</span>
          <br />
          <span className="font-playfair">in Seconds</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-lg mb-12 text-center max-w-2xl font-sans not-italic">
          Create stunning landing pages in seconds
        </p>

        {/* Input Box */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your landing page..."
              className="w-full bg-transparent text-white text-base placeholder:text-white/40 outline-none resize-none"
              rows={1}
            />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <svg
                  className="w-5 h-5 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <svg
                  className="w-5 h-5 text-white/60"
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
              </button>
            </div>

            <button className="p-2 bg-black hover:bg-[#C68E52] text-white rounded-lg transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
