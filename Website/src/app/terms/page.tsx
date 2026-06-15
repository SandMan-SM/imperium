import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service — Imperium Elite",
    description: "Terms and conditions for using Imperium Elite services and subscriptions.",
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Header */}
            <header className="border-b border-imperium-gold/20 py-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase mb-2">Terms of Service</h1>
                    <p className="text-white/40 text-sm">Last updated: March 2026</p>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-light text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="text-white/60 leading-relaxed">
                            By accessing and using Imperium Strategic Intelligence ("we", "our", "us"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using our services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this site will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">2. Description of Service</h2>
                        <p className="text-white/60 leading-relaxed">
                            Imperium provides strategic intelligence briefs, educational content, and premium subscription services designed to enhance personal development and strategic thinking. We reserve the right to modify or discontinue, temporarily or permanently, our service (or any part thereof) with or without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">3. User Conduct</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:
                        </p>
                        <ul className="text-white/60 space-y-2 pl-6">
                            <li>• Use the service in any way that violates any applicable federal, state, local, or international law or regulation</li>
                            <li>• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
                            <li>• Use the service for any commercial purpose without our prior written consent</li>
                            <li>• Attempt to gain unauthorized access to the service or its related systems or networks</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">4. Intellectual Property</h2>
                        <p className="text-white/60 leading-relaxed">
                            All content, trademarks, data, information, graphics, icons, text, photographs, images, audio clips, video clips, data compilations, page layout, the selection and arrangement thereof, and all software compilations, underlying source code, software (including applets and scripts), and other material on this site (collectively "Content") are protected by copyright and other intellectual property rights. All Content is our property or the property of third-party licensors and is protected by U.S. and international copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">5. Subscription Services</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            Premium subscription services are provided on a monthly basis for $20/month. You agree to pay all charges incurred by you or any users of your account and agree to pay all applicable taxes. We reserve the right to change our subscription fees upon reasonable notice.
                        </p>
                        <p className="text-white/60 leading-relaxed">
                            You may cancel your subscription at any time through your account settings. Refunds will not be provided for any unused portion of the current billing period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">6. Disclaimer of Warranties</h2>
                        <p className="text-white/60 leading-relaxed">
                            Your use of our services is at your sole risk. The service is provided on an "as is" and "as available" basis. We expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">7. Limitation of Liability</h2>
                        <p className="text-white/60 leading-relaxed">
                            In no event shall Imperium, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">8. Indemnification</h2>
                        <p className="text-white/60 leading-relaxed">
                            You agree to indemnify and hold harmless Imperium and its parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, from any claim or demand, including reasonable attorneys' fees, made by any third party due to or arising out of your breach of these Terms of Service or your violation of any law or the rights of a third party.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">9. Governing Law</h2>
                        <p className="text-white/60 leading-relaxed">
                            These Terms shall be governed and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">10. Changes to Terms</h2>
                        <p className="text-white/60 leading-relaxed">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">11. Contact Us</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="bg-black/20 border border-white/10 p-4 rounded-lg">
                            <p className="text-white/60">Imperium Strategic Intelligence</p>
                            <p className="text-white/40 text-sm">For all legal inquiries and concerns</p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-imperium-gold/20 py-8">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <p className="text-white/40 text-sm uppercase tracking-widest">
                        Imperium Strategic Intelligence • Building sovereign minds, one brief at a time
                    </p>
                </div>
            </footer>
        </div>
    );
}