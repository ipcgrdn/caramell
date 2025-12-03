"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-media-query";
import { Menu, X, Briefcase } from "lucide-react";

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
        maxWidth: isScrolled ? "56rem" : "100%",
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
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center">
            <span className="hover:text-[#D4A574] transition-colors font-playfair font-bold text-lg">
              Caramell
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <>
            {/* Center - Navigation Links */}
            <div className="flex items-center justify-center gap-8">
              <Link
                href="/blog"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/enterprises"
                className="hover:text-[#D4A574] transition-colors text-sm font-medium"
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
            </div>
          </>
        )}

        {/* Mobile Hamburger Menu */}
        {isMobile && (
          <div className="flex items-center gap-3">
            <SignedIn>
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
            className="overflow-hidden bg-black/80 rounded-2xl backdrop-blur-xl mt-2"
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
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium hover:text-[#D4A574] transition-colors py-2"
                >
                  Pricing
                </Link>
                <Link
                  href="/enterprises"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium hover:text-[#D4A574] transition-colors py-2"
                >
                  Enterprise
                </Link>
              </div>

              {/* Auth Buttons - SignedOut Only */}
              <SignedOut>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2 text-center text-lg font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2 text-center text-lg font-medium bg-black hover:bg-[#D4A574] rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
