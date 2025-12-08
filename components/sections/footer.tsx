import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="main-footer"
      className="fixed bottom-0 left-0 w-full z-[-1] bg-[#EEE6DD] min-h-screen flex flex-col justify-between overflow-hidden"
    >
      {/* Top Section */}
      <div className="relative z-10 w-full px-8 md:px-16 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Left - Logo & Tagline */}
          <div className="flex items-center gap-4">
            <span className="font-playfair text-[#C4886B] text-xl md:text-2xl italic">
              &ldquo;Sweet Creativity&rdquo;
            </span>
          </div>

          {/* Right - Navigation */}
          <div className="flex gap-8 md:gap-16 text-sm tracking-wider uppercase">
            <div className="flex flex-col gap-2">
              <Link
                href="/blog"
                className="text-[#5A4030] hover:text-[#3D2A1F] transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/pricing"
                className="text-[#5A4030] hover:text-[#3D2A1F] transition-colors"
              >
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/privacy"
                className="text-[#5A4030] hover:text-[#3D2A1F] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[#5A4030] hover:text-[#3D2A1F] transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Giant Typography - Center */}
      <div className="relative flex-1 flex items-center overflow-hidden">
        {/* Registered Symbol */}
        <div className="absolute top-12 right-8 md:right-16 z-20">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-[#6B4E36] flex items-center justify-center">
            <span className="text-2xl md:text-4xl font-light text-[#6B4E36]">
              R
            </span>
          </div>
        </div>

        {/* Main Logo Typography - Staggered */}
        <div
          className="flex flex-col select-none pointer-events-none leading-[0.85] tracking-tighter font-black"
          style={{ fontFamily: "var(--font-bungee), sans-serif" }}
        >
          <span className="text-[20vw] md:text-[22vw] ml-[5vw] text-[#C97B63]">
            CARA
          </span>
          <span className="text-[20vw] md:text-[22vw] ml-[30vw] text-[#6B4E36]">
            MELL
          </span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 w-full px-8 md:px-16 pb-8">
        <div className="flex items-center justify-center">
          <p className="text-xs text-[#5A4030] uppercase tracking-wider">
            © {currentYear} Caramell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
