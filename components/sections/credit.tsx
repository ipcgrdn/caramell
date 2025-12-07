"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreditDropdownProps {
  initialCredits?: number;
}

export default function CreditDropdown({
  initialCredits,
}: CreditDropdownProps) {
  const [credits, setCredits] = useState<number | null>(initialCredits ?? null);
  const [isLoading, setIsLoading] = useState(!initialCredits);

  useEffect(() => {
    if (initialCredits !== undefined) return;

    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/user/credits");
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [initialCredits]);

  const displayCredits = credits ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 focus:outline-none rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
          <span className="w-2 h-2 bg-[#D4A574] mb-0.5" />
          {isLoading ? (
            <span className="w-5 h-4 bg-white/20 animate-pulse rounded" />
          ) : (
            <span className="tabular-nums font-mono">{displayCredits}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 bg-[#151515] border border-white/10 rounded-xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4">
          <p className="text-[10px] text-white/60 uppercase tracking-widest mb-2">
            Credits
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-white tabular-nums">
              {isLoading ? "—" : displayCredits}
            </span>
            <span className="text-white/40 text-xs">remained</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Action */}
        <div className="p-2">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#D4A574] hover:bg-[#c49664] text-black text-sm font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Buy Credits
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
