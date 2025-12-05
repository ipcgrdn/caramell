import HeroSection from "@/components/sections/heroSection";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  );
}
