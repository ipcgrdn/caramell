import { MeshGradient } from "@paper-design/shaders-react";
import PromptInput from "@/components/main/PromptInput";
import RecentProject from "@/components/main/recentProject";

export default function HeroSection() {
  return (
    <div className="w-full min-h-screen relative overflow-hidden pt-32 pb-20">
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#000000", "#1a1a1a", "#333333", "#D4A574", "#C68E52"]}
        speed={1.0}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-20 mb-20">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-playfair text-white mb-4 text-center">
          <span className="font-playfair italic">Beautiful</span>{" "}
          <span className="font-playfair">Landing Page</span>
          <br />
          <span className="font-playfair">in Seconds</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-lg mb-12 text-center max-w-2xl font-sans not-italic">
          Create stunning landing page in seconds
        </p>

        {/* Prompt Input */}
        <PromptInput />
      </div>

      {/* Recent Projects Section - Inside Hero */}
      <RecentProject />
    </div>
  );
}
