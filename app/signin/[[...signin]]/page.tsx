"use client";

import { SignIn } from "@clerk/nextjs";
import { MeshGradient } from "@paper-design/shaders-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen relative overflow-hidden flex items-center justify-center">
      <MeshGradient
        className="w-full h-full absolute inset-0"
        colors={["#000000", "#1a1a1a", "#D4A574", "#C68E52"]}
        speed={0.5}
      />

      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-8 left-8 z-50 flex items-center p-2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all group"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <div className="relative z-10">
        <SignIn routing="path" path="/signin" signUpUrl="/signup" />
      </div>
    </div>
  );
}
