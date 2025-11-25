import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caramell",
  description: "Caramell",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#D4A574",
          colorText: "#FFFFFF",
          colorTextSecondary: "rgba(255, 255, 255, 0.8)",
          colorBackground: "rgba(26, 26, 26, 0.95)",
          colorInputBackground: "rgba(255, 255, 255, 0.12)",
          colorInputText: "#FFFFFF",
          borderRadius: "0.75rem",
        },
        elements: {
          // Container - 더 밝은 배경
          rootBox: "text-white",
          card: "bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/30 shadow-2xl",

          // Header
          headerTitle: "!text-white font-playfair text-2xl font-bold",
          headerSubtitle: "!text-white/80",

          // Social buttons - 더 명확한 대비
          socialButtonsBlockButton:
            "bg-white border-white !text-white hover:bg-white/25 transition-all",
          socialButtonsBlockButtonText: "!text-white font-medium",
          socialButtonsIconButton: "!text-white",

          // Primary button
          formButtonPrimary:
            "bg-[#D4A574] hover:bg-[#C68E52] !text-white font-semibold shadow-lg transition-all",

          // Form fields - 더 밝은 배경
          formFieldLabel: "!text-white font-semibold mb-2",
          formFieldInput:
            "bg-white/15 border-white/40 !text-white placeholder:!text-white/60 focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/50 transition-all",
          formFieldInputShowPasswordButton: "!text-white/80 hover:!text-white",

          // Footer - 더 밝은 배경
          footer: "bg-[#1a1a1a]/95 border-t border-white/30",
          footerAction: "bg-[#1a1a1a]/95",
          footerActionText: "!text-white/80",
          footerActionLink:
            "!text-[#D4A574] hover:!text-[#C68E52] font-semibold",

          // Divider
          dividerLine: "bg-white",
          dividerText: "!text-white font-medium",

          // Modal
          modalBackdrop: "backdrop-blur-md",
          modalContent:
            "bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/30 shadow-2xl",

          // Other elements
          identityPreviewText: "!text-white",
          identityPreviewEditButton: "!text-[#D4A574] hover:!text-[#C68E52]",
          formHeaderTitle: "!text-white font-bold",
          formHeaderSubtitle: "!text-white/80",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
