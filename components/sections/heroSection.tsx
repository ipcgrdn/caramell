import { MeshGradient } from "@paper-design/shaders-react";
import PromptInput from "@/components/main/PromptInput";
import RecentProject from "@/components/main/recentProject";
import Showcase from "@/components/main/Showcase";

export default function HeroSection() {
  return (
    <div className="w-full min-h-screen relative overflow-hidden pt-52 pb-20">
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#000000", "#1a1a1a", "#D4A574", "#6B4E36"]}
        speed={0.5}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8 py-4 md:py-20 mb-20">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-playfair text-white mb-4 text-center tracking-tighter">
          <span className="">So </span> <span className="italic">Sweet,</span>{" "}
          <span className="">they</span> <span className="">convert</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-sm md:text-lg mb-12 text-center max-w-2xl font-sans">
          Create the most beautiful and interactive landing pages
        </p>

        {/* Prompt Input */}
        <PromptInput />
      </div>

      {/* Recent Projects Section - Inside Hero */}
      <RecentProject />

      {/* Showcase Section */}
      <div className="mt-20">
        <Showcase />
      </div>
    </div>
  );
}
