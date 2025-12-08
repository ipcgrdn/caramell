import HeroSection from "@/components/sections/heroSection";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

import SmoothScroll from "@/components/animations/SmoothScroll";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <SmoothScroll>
        <HeroSection />
        <Footer />
      </SmoothScroll>
    </main>
  );
}
