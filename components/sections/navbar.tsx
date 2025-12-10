"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-media-query";
import { Menu, X, Briefcase } from "lucide-react";
import CreditDropdown from "@/components/sections/credit";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 모바일 메뉴가 열렸을 때 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <motion.nav
      initial={false}
      animate={{
        paddingLeft: isScrolled ? "2rem" : "3rem",
        paddingRight: isScrolled ? "2rem" : "3rem",
        paddingTop: isScrolled ? "1rem" : "2rem",
        paddingBottom: isScrolled ? "1rem" : "2rem",
        marginTop: isScrolled ? "1rem" : "0rem",
        maxWidth: isScrolled ? "48rem" : "100%",
        borderRadius: isScrolled ? "3rem" : "0rem",
        backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 30,
        mass: 0.8,
      }}
      className={`fixed top-0 left-0 right-0 z-50 mx-auto ${
        isScrolled ? "shadow-lg border border-black/10" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center">
        {/* Logo - 왼쪽 고정 */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/caramell.svg"
              alt="Caramell Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="group-hover:text-[#D4A574] transition-colors font-playfair font-bold text-lg tracking-tighter">
              Caramell
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <>
            {/* Center - Navigation Links 중앙 고정 */}
            <div className="flex-1 flex items-center justify-center gap-8">
              <Link
                href="/blog"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
              >
                Blog
              </Link>
              <Link
                href="/showcase"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
              >
                Showcase
              </Link>
              <Link
                href="/pricing"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="https://discord.gg/3CAsg3RG"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Right - Auth Buttons 오른쪽 고정 */}
            <div className="flex-1 flex items-center justify-end">
              <SignedOut>
                <div className="flex items-center gap-3">
                  <Link
                    href="/signin"
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all backdrop-blur-sm"
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
                <div className="flex items-center gap-2 md:gap-4">
                  <CreditDropdown />
                  <UserButton>
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="Workspace"
                        href="/project/workspace"
                        labelIcon={<Briefcase className="w-4 h-4" />}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </SignedIn>
            </div>
          </>
        )}

        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <SignedOut>
              <Link
                href="/signin"
                className="px-3 py-1.5 mt-0.5 text-sm font-medium"
              >
                Log in
              </Link>
            </SignedOut>
            <SignedIn>
              <CreditDropdown />
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Workspace"
                    href="/project/workspace"
                    labelIcon={<Briefcase className="w-4 h-4" />}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-white/10 items-center justify-center rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-transparent mt-2"
          >
            <div className="flex flex-col py-4 px-4 space-y-4">
              {/* Navigation Links */}
              <div className="flex flex-col space-y-2">
                <Link
                  href="/blog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium hover:text-[#D4A574] transition-colors py-2"
                >
                  Blog
                </Link>
                <Link
                  href="/showcase"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium hover:text-[#D4A574] transition-colors py-2"
                >
                  Showcase
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium hover:text-[#D4A574] transition-colors py-2"
                >
                  Pricing
                </Link>
                <Link
                  href="https://discord.gg/3CAsg3RG"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium hover:text-[#D4A574] transition-colors py-2"
                >
                  Contact
                </Link>
              </div>

              {/* Sign up Button - SignedOut Only */}
              <SignedOut>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3 text-center text-base font-medium bg-[#D4A574] hover:bg-[#c49664] text-black rounded-xl transition-colors"
                >
                  Sign up
                </Link>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
