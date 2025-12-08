import HeroSection from "@/components/sections/heroSection";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

import SmoothScroll from "@/components/animations/SmoothScroll";
import FooterSpacer from "@/components/animations/FooterSpacer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <SmoothScroll>
        <HeroSection />
        <div className="bg-background relative z-10">
          {/* Add other sections here as they are built */}
        </div>
        <FooterSpacer />
      </SmoothScroll>
      <Footer />
    </main>
  );
}
