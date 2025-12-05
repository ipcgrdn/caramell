"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

export default function TermsPage() {
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
              Terms of Service
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
              {/* Agreement to Terms */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Welcome to Caramell. These Terms of Service
                  (&quot;Terms&quot;) govern your access to and use of
                  Caramell&apos;s website, products, and services
                  (&quot;Services&quot;). By accessing or using our Services,
                  you agree to be bound by these Terms and our Privacy Policy.
                </p>
                <p className="text-black/70 leading-relaxed">
                  If you do not agree to these Terms, you may not access or use
                  our Services. We reserve the right to update these Terms at
                  any time, and your continued use of the Services constitutes
                  acceptance of any changes.
                </p>
              </section>

              {/* Description of Services */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Description of Services
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Caramell is an AI-powered landing page builder that allows
                  users to generate website landing pages using artificial
                  intelligence. Our Services include:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    AI-generated landing page creation based on text prompts
                  </li>
                  <li>Multiple AI model options (Claude, Gemini, ChatGPT)</li>
                  <li>
                    Code export functionality (HTML, Tailwind CSS, JavaScript)
                  </li>
                  <li>Project management and storage</li>
                  <li>Real-time code preview and editing</li>
                </ul>
              </section>

              {/* Account Registration */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Account Registration
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  To use certain features of our Services, you must create an
                  account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update your information if it changes</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <p className="text-black/70 leading-relaxed mt-4">
                  You must be at least 13 years old to create an account.
                </p>
              </section>

              {/* Credits and Payment */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Credits and Payment
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Caramell operates on a credit-based system:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2 mb-6">
                  <li>Credits are required to generate landing pages</li>
                  <li>
                    Different AI models consume different amounts of credits
                  </li>
                  <li>Purchased credits do not expire</li>
                  <li>Credits are non-transferable between accounts</li>
                </ul>

                <h3 className="text-lg font-semibold text-black mb-3">
                  Payment Processing
                </h3>
                <p className="text-black/70 leading-relaxed mb-4">
                  All payments are processed by Dodo Payments, our Merchant of
                  Record (MOR). By making a purchase, you agree to Dodo
                  Payments&apos; terms of service and authorize them to charge
                  your payment method.
                </p>
                <p className="text-black/70 leading-relaxed">
                  Dodo Payments handles all payment-related matters including
                  billing, refunds, chargebacks, and tax collection. For payment
                  inquiries, please refer to Dodo Payments&apos; support
                  channels.
                </p>
              </section>

              {/* Refund Policy */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Refund Policy
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  Due to the nature of digital services and AI-generated
                  content:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    Purchased credits may be refunded only if there is a clear problem with the service.
                  </li>
                  <li>Credits that have been used are non-refundable</li>
                  <li>For inquiries regarding refunds, please refer to the email below.</li>
                  <li>
                    We reserve the right to refuse refunds in cases of abuse or
                    violation of these Terms
                  </li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Intellectual Property
                </h2>

                <h3 className="text-lg font-semibold text-black mb-3">
                  Your Content
                </h3>
                <p className="text-black/70 leading-relaxed mb-6">
                  You retain full ownership of all content you create using
                  Caramell, including AI-generated landing pages. You may use,
                  modify, and distribute your generated content for any purpose,
                  including commercial use.
                </p>

                <h3 className="text-lg font-semibold text-black mb-3">
                  Our Platform
                </h3>
                <p className="text-black/70 leading-relaxed">
                  Caramell and its original content (excluding user-generated
                  content), features, and functionality are owned by Caramell
                  and are protected by international copyright, trademark, and
                  other intellectual property laws. You may not reproduce,
                  distribute, modify, or create derivative works of our platform
                  without express permission.
                </p>
              </section>

              {/* Acceptable Use */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Acceptable Use
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  You agree not to use our Services to:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    Generate content that is illegal, harmful, threatening,
                    abusive, harassing, defamatory, or otherwise objectionable
                  </li>
                  <li>
                    Create content that infringes on the intellectual property
                    rights of others
                  </li>
                  <li>
                    Distribute malware, spam, or engage in phishing activities
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems or other
                    users&apos; accounts
                  </li>
                  <li>Interfere with or disrupt our Services or servers</li>
                  <li>
                    Violate any applicable local, state, national, or
                    international law
                  </li>
                  <li>
                    Generate content depicting minors in harmful or
                    inappropriate situations
                  </li>
                  <li>
                    Circumvent any technical measures we use to provide our
                    Services
                  </li>
                  <li>
                    Use automated scripts or bots to access our Services without
                    permission
                  </li>
                </ul>
              </section>

              {/* AI-Generated Content */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  AI-Generated Content
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  You acknowledge and agree that:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    Content generated by AI may not always be accurate,
                    complete, or suitable for your specific needs
                  </li>
                  <li>
                    You are responsible for reviewing and testing all generated
                    content before use
                  </li>
                  <li>
                    AI outputs may vary and similar prompts may produce
                    different results
                  </li>
                  <li>
                    We do not guarantee any specific outcome or quality from AI
                    generations
                  </li>
                  <li>
                    You are responsible for ensuring generated content complies
                    with applicable laws and regulations
                  </li>
                </ul>
              </section>

              {/* Disclaimer of Warranties */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Disclaimer of Warranties
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS
                  AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                  OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>Implied warranties of merchantability</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Accuracy or reliability of content</li>
                  <li>Uninterrupted or error-free service</li>
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, CARAMELL AND ITS
                  OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE
                  FOR:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>
                    Any indirect, incidental, special, consequential, or
                    punitive damages
                  </li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>
                    Any damages arising from your use of or inability to use our
                    Services
                  </li>
                  <li>Any damages resulting from AI-generated content</li>
                </ul>
                <p className="text-black/70 leading-relaxed mt-4">
                  Our total liability shall not exceed the amount you paid us in
                  the twelve (12) months preceding the claim.
                </p>
              </section>

              {/* Indemnification */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Indemnification
                </h2>
                <p className="text-black/70 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Caramell and
                  its affiliates, officers, directors, employees, and agents
                  from and against any claims, liabilities, damages, losses, and
                  expenses arising out of or related to your use of our
                  Services, violation of these Terms, or infringement of any
                  third-party rights.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Termination
                </h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to our
                  Services immediately, without prior notice or liability, for
                  any reason, including:
                </p>
                <ul className="list-disc pl-6 text-black/70 space-y-2">
                  <li>Breach of these Terms</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Non-payment or payment disputes</li>
                  <li>Extended periods of inactivity</li>
                </ul>
                <p className="text-black/70 leading-relaxed mt-4">
                  Upon termination, your right to use our Services will
                  immediately cease. You may request export of your data before
                  termination.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Governing Law
                </h2>
                <p className="text-black/70 leading-relaxed">
                  These Terms shall be governed by and construed in accordance
                  with applicable laws, without regard to conflict of law
                  principles. Any disputes arising from these Terms or your use
                  of our Services shall be resolved through binding arbitration
                  in accordance with applicable arbitration rules.
                </p>
              </section>

              {/* Severability */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Severability
                </h2>
                <p className="text-black/70 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable
                  or invalid, that provision shall be limited or eliminated to
                  the minimum extent necessary, and the remaining provisions
                  shall remain in full force and effect.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Changes to Terms
                </h2>
                <p className="text-black/70 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We
                  will provide notice of significant changes by posting the
                  updated Terms on our website and updating the &quot;Last
                  updated&quot; date. Your continued use of our Services after
                  such changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-[#6B4E36] mb-4">
                  Contact Us
                </h2>
                <p className="text-black/70 leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us at:
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
