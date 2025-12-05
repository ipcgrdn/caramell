"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

interface PricingTier {
  name: string;
  price: string;
  credits: number;
  bonus?: string;
  description: string;
  highlight?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    credits: 3,
    description: "Try it out",
  },
  {
    name: "Starter",
    price: "$10",
    credits: 50,
    description: "For side projects",
  },
  {
    name: "Pro",
    price: "$20",
    credits: 100,
    description: "For vibe coders",
    highlight: true,
  },
  {
    name: "Business",
    price: "$50",
    credits: 250,
    bonus: "+10%",
    description: "Best value",
  },
];

const features = [
  "Export to code (Next.js project included)",
  "Commercial use",
  "Access to all templates",
  "Custom subdomain publishing",
  "Latest AI models",
  "Credits never expire",
  "Unlimited projects",
];

const faqs = [
  {
    question: "What is a credit?",
    answer:
      "Credits are used when generating landing pages. Each generation costs credits based on the AI model you choose. Claude uses the most, while ChatGPT is the most affordable.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No. Unlike subscriptions, your credits never expire. Use them whenever you need, at your own pace.",
  },
  {
    question: "Why credits instead of subscriptions?",
    answer:
      "We believe you shouldn't pay for what you don't use. With credits, you only pay for actual generations—no recurring fees eating into unused months.",
  },
  {
    question: "Can I export my designs?",
    answer:
      "Everything you create is real code—pure HTML, Tailwind CSS, and vanilla JavaScript. Export as a complete file or use anywhere. No vendor lock-in.",
  },
  {
    question: "Who owns the code I generate?",
    answer:
      "You do. 100% ownership. Use it for personal projects, client work, or commercial products. It's yours.",
  },
  {
    question: "What's different from Lovable?",
    answer:
      "Caramell is a design tool that generates real, exportable code—not proprietary formats. While Lovable focuses on full-stack app development, Caramell specializes in creating beautiful, interactive landing pages with AI. Export everything as standard HTML/Tailwind CSS. Think of Caramell as a design tool that outputs real code you can use anywhere.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-[#F5EDE3] rounded-2xl overflow-hidden cursor-pointer transition-all hover:bg-[#EEE6DD]"
      onClick={onClick}
    >
      <div className="flex items-center justify-between p-6">
        <h3 className="text-black font-medium">{question}</h3>
        <svg
          className={`w-5 h-5 text-black/40 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p className="px-6 pb-6 text-black/60 text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#6B4E36]">
      <Navbar />

      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-playfair text-[#F5EDE3] mb-4">
              Pay once, create forever
            </h1>
            <p className="text-[#F5EDE3]/50 text-sm md:text-lg max-w-xl mx-auto">
              Buy credits when you need them. No subscriptions.
            </p>
          </motion.div>

          {/* Pricing Tiers - 2x2 Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4 mb-20"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                className={`relative rounded-3xl p-6 md:p-8 transition-all duration-300 ${
                  tier.highlight
                    ? "bg-[#D4A574] text-black"
                    : "bg-[#F5EDE3] text-black hover:bg-[#EEE6DD]"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}

                {/* Name */}
                <h3 className="text-lg font-semibold mb-4">{tier.name}</h3>

                <div className="flex items-center justify-between mb-4">
                  {/* Price */}
                  <span className="text-4xl md:text-5xl font-bold">
                    {tier.price}
                  </span>

                  {/* Credits */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold">
                      {tier.credits}
                    </span>
                    {tier.bonus && (
                      <span className="text-sm font-bold italic text-[#6B4E36]">
                        {tier.bonus}
                      </span>
                    )}
                    <span className="text-black/80">credits</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/signup"
                  className={`block w-full py-3 rounded-2xl text-center font-medium transition-all ${
                    tier.highlight
                      ? "bg-black text-white hover:bg-black/90"
                      : "bg-[#6B4E36] text-white hover:bg-[#5a4230]"
                  }`}
                >
                  {tier.name === "Free" ? "Start Free" : "Buy Credits"}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-4xl font-playfair text-[#F5EDE3] mb-3">
                Everything included
              </h2>
              <p className="text-[#F5EDE3]/50 text-sm md:text-lg">
                With every purchase, you get access to all features.
              </p>
            </div>

            <div className="bg-[#F5EDE3] rounded-4xl p-8 md:p-12 mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-[#D4A574] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-black/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-4xl font-playfair text-[#F5EDE3] mb-3">
                Questions? Answered.
              </h2>
              <p className="text-[#F5EDE3]/50 text-sm md:text-lg">
                Everything you need to know about credits and pricing.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-24 mb-20 md:mt-32"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#F5EDE3] mb-4 leading-tight">
              Still not sure?{" "}
              <span className="text-[#F5EDE3]">Try it free!</span>
            </h2>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#D4A574] hover:bg-[#c49564] text-black text-lg font-medium rounded-full transition-all"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
