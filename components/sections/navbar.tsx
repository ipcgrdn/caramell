"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "px-8 py-4 mx-auto max-w-4xl mt-4 rounded-4xl bg-black/50 backdrop-blur-xl shadow-lg border border-black/10"
          : "px-12 py-8"
      }`}
    >
      <div className="max-w-8xl mx-auto grid grid-cols-3 items-center">
        {/* Left - Logo */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center">
            <span
              className={`hover:text-[#D4A574] transition-colors font-playfair font-bold text-lg`}
            >
              Caramell
            </span>
          </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className="flex items-center justify-center gap-8">
          <Link
            href="/blog"
            className={`hover:text-[#D4A574] transition-colors text-sm font-medium `}
          >
            Blog
          </Link>
          <Link
            href="/pricing"
            className={`hover:text-[#D4A574] transition-colors text-sm font-medium `}
          >
            Pricing
          </Link>
          <Link
            href="/enterprises"
            className={`hover:text-[#D4A574] transition-colors text-sm font-medium `}
          >
            Enterprise
          </Link>
        </div>

        {/* Right - Auth Buttons */}
        <div className="flex items-center justify-end">
          <SignedOut>
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all backdrop-blur-sm `}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-white text-sm font-medium bg-black hover:bg-[#D4A574] rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard:
                    "bg-white/95 backdrop-blur-xl border border-black/10",
                  userButtonPopoverActionButton: "!text-white hover:bg-black/5",
                  userButtonPopoverActionButtonText: "!text-white",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
