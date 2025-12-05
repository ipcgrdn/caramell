import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#EEE6DD] py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Image
                src="/caramell.svg"
                alt="Caramell Logo"
                width={28}
                height={28}
                className="rounded-md"
              />
              <h2 className="text-2xl font-playfair font-bold text-[#6B4E36] tracking-tighter">
                Caramell
              </h2>
            </div>
            <p className="text-xs text-black/60">
              © {currentYear} Caramell. All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-black/60 hover:text-black transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-black/60 hover:text-black transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-black/60 hover:text-black transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
