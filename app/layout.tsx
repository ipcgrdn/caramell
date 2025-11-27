import type { Metadata } from "next";
import { Geist, Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
          colorTextSecondary: "rgba(255, 255, 255, 0.7)",
          colorBackground: "#1a1a1a",
          colorInputBackground: "rgba(255, 255, 255, 0.08)",
          colorInputText: "#FFFFFF",
          borderRadius: "0.5rem",
          fontSize: "0.9375rem",
        },
        elements: {
          // Container - 전체 간격 줄이기
          rootBox: "text-white",
          card: "bg-[#1a1a1a] backdrop-blur-xl border border-white/10 shadow-2xl px-6 py-6",

          // Header - Aura 스타일, 간격 조정
          headerTitle: "!text-white font-inter text-[1.75rem] font-semibold tracking-tight",
          headerSubtitle: "!text-white/70 text-[0.9375rem] font-normal",

          // Social buttons - 명확한 흰색 배경, 높이 줄이기
          socialButtonsBlockButton:
            "!bg-white/10 !border-white/20 !text-white hover:!bg-white/15 !transition-all !duration-200 !h-10 !font-medium",
          socialButtonsBlockButtonText: "!text-white !font-medium !text-[0.9375rem]",
          socialButtonsProviderIcon: "!brightness-0 !invert",

          // Divider - 더 미묘하게
          dividerLine: "!bg-white/10",
          dividerText: "!text-white/50 !text-sm !font-normal !uppercase !tracking-wider",

          // Tabs - Sign In / Sign Up
          alternativeMethodsBlockButton:
            "!bg-transparent hover:!bg-white/5 !text-white/60 hover:!text-white !transition-all !border-b-2 !border-transparent data-[active]:!border-[#D4A574] data-[active]:!text-white !rounded-none !font-semibold",

          // Primary button - Caramel 색상 강조, 높이 줄이기
          formButtonPrimary:
            "!bg-[#D4A574] hover:!bg-black !text-black hover:!text-white !font-semibold !shadow-lg !transition-all !duration-200 !h-10 !text-[0.9375rem]",

          // Form fields - 더 명확한 배경, 간격 줄이기
          formFieldLabel: "!text-white !font-medium !text-[0.9375rem]",
          formFieldInput:
            "!bg-white/8 !border-white/20 !text-white placeholder:!text-white/40 focus:!border-[#D4A574] focus:!ring-2 focus:!ring-[#D4A574]/30 !transition-all !h-10 !text-[0.9375rem]",
          formFieldInputShowPasswordButton: "!text-white/60 hover:!text-white",

          // Footer - 간격 더 줄이기
          footer: "!bg-transparent !border-t !border-white/10 !pt-3",
          footerAction: "!bg-transparent",
          footerActionText: "!text-white/60 !text-sm",
          footerActionLink:
            "!text-[#D4A574] hover:!text-[#C68E52] !font-semibold !transition-colors",

          // Links
          formFieldLabelRow: "!mb-0",
          formFieldAction: "!text-white/60 hover:!text-white !text-sm !font-normal",

          // Modal
          modalBackdrop: "!backdrop-blur-md",
          modalContent:
            "!bg-[#1a1a1a] !backdrop-blur-xl !border !border-white/10 !shadow-2xl",

          // Other elements
          identityPreviewText: "!text-white",
          identityPreviewEditButton: "!text-[#D4A574] hover:!text-[#C68E52]",
          formHeaderTitle: "!text-white !font-semibold !text-lg",
          formHeaderSubtitle: "!text-white/70 !text-sm",

          // Alert and errors
          alertText: "!text-white/90 !text-sm",
          formFieldErrorText: "!text-red-400 !text-sm",

          // Form field rows - 간격 줄이기
          formFieldRow: "!gap-1",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${playfair.variable} ${inter.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
