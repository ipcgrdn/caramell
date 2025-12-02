import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
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
      localization={{
        socialButtonsBlockButton: "Sign in with {{provider|titleize}}",
        dividerText: "or",
        formFieldLabel__emailAddress: "Email",
        formFieldLabel__password: "Password",
        formButtonPrimary: "Continue",
        signUp: {
          start: {
            title: "Sign up",
            subtitle: "Start by creating an account",
            actionText: "Already have an account?",
            actionLink: "Sign in",
          },
          emailLink: {
            title: "Email confirmation",
            subtitle: "Continue by confirming your email",
            formTitle: "Confirmation link",
            formSubtitle: "Use the confirmation link sent to your email",
            resendButton: "Resend link",
            verified: {
              title: "Success!",
            },
          },
          emailCode: {
            title: "Email confirmation",
            subtitle: "Continue by confirming your email",
            formTitle: "Confirmation code",
            formSubtitle: "Enter the confirmation code sent to your email",
            resendButton: "Resend code",
          },
        },
        signIn: {
          start: {
            title: "Caramell",
            subtitle: "Sign in to your account",
            actionText: "Don't have an account?",
            actionLink: "Sign up",
          },
        },
        formFieldInputPlaceholder__emailAddress: "Email address",
        formFieldInputPlaceholder__password: "Password",
      }}
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
          card: "bg-[#1a1a1a] backdrop-blur-xl shadow-2xl px-4 py-4",

          // Header - Aura 스타일, 간격 조정
          headerTitle:
            "!text-white font-playfair text-[1.75rem] font-semibold tracking-tight",
          headerSubtitle: "!text-white/70 text-[0.75rem] font-normal",

          // Social buttons - 명확한 흰색 배경, 높이 줄이기
          socialButtonsBlockButton:
            "!bg-white/10 !text-white hover:!bg-white/15 !transition-all !duration-200 !h-10 !font-medium",
          socialButtonsBlockButtonText:
            "!text-white !font-medium !text-[0.85rem]",

          // Divider - 더 미묘하게
          dividerLine: "!bg-white/10",
          dividerText:
            "!text-white/50 !text-xs !font-normal !uppercase !tracking-wider",

          // Tabs - Sign In / Sign Up
          alternativeMethodsBlockButton:
            "!bg-transparent hover:!bg-white/5 !text-white/60 hover:!text-white !transition-all !border-b-2 !border-transparent data-[active]:!border-[#D4A574] data-[active]:!text-white !rounded-none !font-semibold",

          // Primary button - Caramel 색상 강조, 높이 줄이기
          formButtonPrimary:
            "!bg-[#D4A574] hover:!bg-black !text-black hover:!text-white !font-semibold !shadow-lg !transition-all !duration-200 !h-10 !text-[0.9375rem]",

          // Form fields - 더 명확한 배경, 간격 줄이기
          formFieldLabel: "!text-white !font-medium !text-[0.85rem]",
          formFieldInput:
            "!bg-white/8 !border-white/20 !text-white placeholder:!text-white/40 focus:!border-[#D4A574] focus:!ring-2 focus:!ring-[#D4A574]/30 !transition-all !h-10 !text-[0.85rem]",
          formFieldInputShowPasswordButton: "!text-white/60 hover:!text-white",
        },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${playfair.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
