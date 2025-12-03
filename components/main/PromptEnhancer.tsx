"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface DesignStyle {
  id: string;
  name: string;
}

const DESIGN_STYLES: DesignStyle[] = [
  { id: "business", name: "Business" },
  { id: "technology", name: "Technology" },
  { id: "landing", name: "Landing Page" },
  { id: "ecommerce", name: "E-commerce" },
  { id: "realestate", name: "Real Estate" },
  { id: "health", name: "Health" },
  { id: "food", name: "Food" },
  { id: "education", name: "Education" },
  { id: "portfolio", name: "Portfolio" },
  { id: "minimal", name: "Minimal" },
  { id: "creative", name: "Creative" },
  { id: "corporate", name: "Corporate" },
];

interface PromptEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (style: string) => void;
  currentStyle: string;
}

export default function PromptEnhancerModal({
  isOpen,
  onClose,
  onApply,
  currentStyle,
}: PromptEnhancerModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isOpen) return null;

  const handleApply = () => {
    if (selectedStyle) {
      const style = DESIGN_STYLES.find((s) => s.id === selectedStyle);
      onApply(`${style?.name}`);
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full mx-4 max-w-4xl max-h-[85vh] bg-black/80 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 flex items-center justify-between border-b border-white/10">
          <h2 className="text-sm md:text-lg font-semibold text-white">Enhancer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-white"
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {DESIGN_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`group relative p-6 rounded-2xl transition-all ${
                  selectedStyle === style.id
                    ? "border border-white/50 bg-white/5"
                    : " bg-white/5"
                }`}
              >
                <div className="relative flex flex-col items-center justify-center aspect-video">
                  <h3 className="text-white font-semibold text-sm">
                    {style.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Footer */}
        <div className="absolute bottom-4 right-4 p-2">
          <button
            onClick={handleApply}
            disabled={!selectedStyle}
            className="px-4 py-2 text-sm font-semibold text-black bg-[#C68E52] hover:bg-[#B07A3E] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply →
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
