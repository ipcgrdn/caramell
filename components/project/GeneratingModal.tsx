"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MorphingSquare } from "@/components/ui/morphing-square";

interface GeneratingModalProps {
  isOpen: boolean;
}

export default function GeneratingModal({ isOpen }: GeneratingModalProps) {
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

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-9999 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center px-8">
        {/* Loading Animation */}
        <div className="mb-8">
          <MorphingSquare />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-playfair text-white mb-4">
          Generating Next.js Project
        </h2>

        {/* Description */}
        <p className="text-white/60 text-sm md:text-base mb-8 max-w-lg mx-auto">
          Creating a Next.js project with clean, reusable code structure
        </p>

        {/* Command Instructions */}
        <div className="bg-white/5 border border-[#D4A574] rounded-2xl p-6 max-w-lg mx-auto">
          <p className="text-white/80 text-sm mb-4">
            Once downloaded, run these commands
          </p>

          <div className="space-y-3">
            <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-left">
              <span className="text-white/50">$</span>{" "}
              <span className="text-white">npm install</span>
            </div>

            <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-left">
              <span className="text-white/50">$</span>{" "}
              <span className="text-white">npm run dev</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
