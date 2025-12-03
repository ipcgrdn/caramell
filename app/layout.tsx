import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
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
        theme: dark,
        variables: { colorPrimary: "#D4A574" },
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${playfair.variable} antialiased`}
        >
          <Toaster position="bottom-right" richColors />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
