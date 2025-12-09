"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { TEMPLATES, Template } from "@/templates";

interface PromptTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: Template) => void;
  currentTemplateId?: string;
}

export default function PromptTemplate({
  isOpen,
  onClose,
  onApply,
  currentTemplateId,
}: PromptTemplateProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    currentTemplateId || null
  );
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
    if (selectedTemplateId) {
      const template = TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (template) {
        onApply(template);
        onClose();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full mx-4 max-w-6xl max-h-[75vh] border border-white/20 bg-black/50 rounded-2xl flex flex-col overflow-hidden"
        onWheel={handleWheel}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-white/20">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Choose a Template
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors mb-0.5"
          >
            <svg
              className="w-5 h-5 text-white"
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
        <div className="flex-1 p-6 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`group relative rounded-2xl border border-white/20 overflow-hidden transition-all ${
                  selectedTemplateId === template.id
                    ? "ring-2 ring-[#C68E52]"
                    : "hover:border-white/50"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-16/10">
                  {template.thumbnail ? (
                    <Image
                      src={template.thumbnail}
                      alt={template.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10">
                      <span className="text-white/40 text-sm font-medium">
                        {template.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-sm font-medium text-left">
                    {template.name}
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
            disabled={!selectedTemplateId}
            className="px-6 py-2.5 text-sm font-semibold text-black bg-[#C68E52] hover:bg-[#B07A3E] rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply →
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
