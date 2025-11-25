import HeroSection from "@/components/sections/heroSection";
import Navbar from "@/components/sections/navbar";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
    </main>
  );
}
