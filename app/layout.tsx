import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import "./globals.css";

import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA_TRACKING_ID = "G-D0Q1T5F7QG";

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
  metadataBase: new URL("https://caramell.app"),
  title: "Caramell",
  description: "Caramell - Beautiful Landing Page",
  icons: {
    icon: "/caramell.png",
    apple: "/caramell.png",
  },
  openGraph: {
    title: "Caramell",
    description: "Caramell - Beautiful Landing Page",
    images: [
      {
        url: "/caramell.png",
        width: 100,
        height: 100,
        alt: "Caramell Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Caramell",
    description: "Caramell - Beautiful Landing Page",
    images: ["/caramell.png"],
  },
  other: {
    "naver-site-verification": "8f41ec33a381cd639f7e8e6edd91106b76f09f5d",
  },
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
        <head>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');
            `}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${playfair.variable} antialiased`}
        >
          <Toaster position="bottom-right" />
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
