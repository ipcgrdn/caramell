"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MorphingSquare } from "@/components/ui/morphing-square";

interface CreatingModalProps {
  isOpen: boolean;
  streamingCode?: string;
}

export default function CreatingModal({
  isOpen,
  streamingCode,
}: CreatingModalProps) {
  const codeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 자동 스크롤 (최신 코드를 보여주기 위해)
  useEffect(() => {
    if (codeScrollRef.current && streamingCode) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [streamingCode]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-9999 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <style jsx>{`
        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(212, 165, 116, 0.4),
              0 0 40px rgba(212, 165, 116, 0.2),
              0 0 60px rgba(212, 165, 116, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(212, 165, 116, 0.6),
              0 0 60px rgba(212, 165, 116, 0.3),
              0 0 90px rgba(212, 165, 116, 0.15);
          }
        }
        .code-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="text-center px-8">
        {/* Loading Animation */}
        <div className="mb-8">
          <MorphingSquare />
        </div>

        {/* Title/Message */}
        <h2 className="text-2xl md:text-4xl font-playfair text-white mb-4">
          Caramelizing
        </h2>

        {/* Description */}
        <p className="text-white/60 text-sm md:text-base mb-8 max-w-lg mx-auto">
          It takes about a minute
        </p>

        {/* Code Streaming Area */}
        {streamingCode && (
          <div className="code-glow bg-white/5 border border-[#D4A574]/50 rounded-2xl p-4 max-w-2xl mx-auto">
            <div
              ref={codeScrollRef}
              className="text-xs text-left h-64 overflow-y-auto overflow-x-hidden [&_pre]:bg-transparent! [&_pre]:m-0! [&_pre]:p-2! [&_pre]:whitespace-pre-wrap! [&_pre]:break-all! [&_code]:whitespace-pre-wrap! [&_code]:break-all!"
            >
              <SyntaxHighlighter
                language="tsx"
                style={vscDarkPlus}
                wrapLongLines
                customStyle={{
                  background: "transparent",
                  margin: 0,
                  padding: "0.5rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {streamingCode || " "}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
