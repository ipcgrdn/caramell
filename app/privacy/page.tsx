"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#6B4E36]">
      <Navbar />

      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-playfair text-[#F5EDE3] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[#F5EDE3]/50 text-sm md:text-lg">
              Last updated: December 5, 2025
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#F5EDE3] rounded-4xl p-8 md:p-12"
          >
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Introduction
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Welcome to Caramell (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
                <p className="text-black/70 leading-relaxed">
                  By using Caramell, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Information We Collect
                </h2>

                <h3 className="text-lg font-semibold text-black mb-3">
                  Personal Information
                </h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  When you create an account or use our services, we may collect:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2 mb-6">
                  <li>Name and email address</li>
                  <li>Profile information (provided through authentication services)</li>
                  <li>Account credentials managed by Clerk (our authentication provider)</li>
                </ul>

                <h3 className="text-lg font-semibold text-black mb-3">
                  Usage Data
                </h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  We automatically collect certain information when you use our service:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2 mb-6">
                  <li>Projects you create and associated content</li>
                  <li>AI prompts and generated outputs</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                </ul>

                <h3 className="text-lg font-semibold text-black mb-3">
                  Payment Information
                </h3>
                <p className="text-black/70 leading-relaxed">
                  Payment processing is handled by Dodo Payments, our Merchant of Record (MOR). We do not directly collect or store your payment card information. Dodo Payments processes your payments securely and may collect information necessary to complete transactions. Please refer to Dodo Payments&apos; privacy policy for details on their data handling practices.
                </p>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>To provide, maintain, and improve our services</li>
                  <li>To process your transactions and manage your account</li>
                  <li>To generate AI-powered landing pages based on your prompts</li>
                  <li>To communicate with you about updates, support, and promotional offers</li>
                  <li>To detect, prevent, and address technical issues and security threats</li>
                  <li>To analyze usage patterns and improve user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              {/* Third-Party Services */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Third-Party Services
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  We use the following third-party services to operate Caramell:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    <strong>Clerk</strong> - For user authentication and account management
                  </li>
                  <li>
                    <strong>Dodo Payments</strong> - Our Merchant of Record for secure payment processing
                  </li>
                  <li>
                    <strong>AI Providers (Anthropic, Google, OpenAI)</strong> - For AI-powered content generation
                  </li>
                  <li>
                    <strong>Neon</strong> - For secure database hosting
                  </li>
                  <li>
                    <strong>Vercel</strong> - For hosting and deployment
                  </li>
                </ul>
                <p className="text-black/70 leading-relaxed mt-4">
                  Each third-party service has its own privacy policy governing their use of your information.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Data Retention
                </h2>
                <p className="text-black/70 leading-relaxed">
                  We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time. We may retain certain information as required by law or for legitimate business purposes.
                </p>
              </section>

              {/* Data Security */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Data Security
                </h2>
                <p className="text-black/70 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Your Rights
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate or incomplete data</li>
                  <li>Deletion of your personal information</li>
                  <li>Data portability</li>
                  <li>Objection to processing of your data</li>
                  <li>Withdrawal of consent</li>
                </ul>
                <p className="text-black/70 leading-relaxed mt-4">
                  To exercise any of these rights, please contact us at the email address provided below.
                </p>
              </section>

              {/* Cookies */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Cookies and Tracking
                </h2>
                <p className="text-black/70 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, analyze site traffic, and for security purposes. You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of our service.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Children&apos;s Privacy
                </h2>
                <p className="text-black/70 leading-relaxed">
                  Caramell is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.
                </p>
              </section>

              {/* Changes to Policy */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Changes to This Policy
                </h2>
                <p className="text-black/70 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Contact Us
                </h2>
                <p className="text-black/70 leading-relaxed">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <p className="text-black/70 mt-4">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:cejewe2002@gmail.com"
                    className="text-[#6B4E36] hover:underline"
                  >
                    cejewe2002@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
