import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy — Imperium Elite",
    description: "How Imperium Elite collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Header */}
            <header className="border-b border-imperium-gold/20 py-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-2xl sm:text-3xl font-light text-white tracking-wide uppercase mb-2">Privacy Policy</h1>
                    <p className="text-white/40 text-sm">Last updated: March 2026</p>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-light text-white mb-4">1. Information We Collect</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We collect several types of information to provide and improve our services:
                        </p>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Personal Information</h3>
                                <ul className="text-white/60 space-y-2 pl-6">
                                    <li>• Name and email address</li>
                                    <li>• Payment information (processed securely through Stripe)</li>
                                    <li>• Subscription preferences</li>
                                    <li>• Communication preferences</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Usage Data</h3>
                                <ul className="text-white/60 space-y-2 pl-6">
                                    <li>• IP address and browser type</li>
                                    <li>• Pages visited and time spent</li>
                                    <li>• Referring websites</li>
                                    <li>• Device information</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">2. How We Use Your Information</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We use the collected information to:
                        </p>
                        <ul className="text-white/60 space-y-2 pl-6">
                            <li>• Provide and maintain our services</li>
                            <li>• Create and manage your account</li>
                            <li>• Process payments and subscriptions</li>
                            <li>• Send newsletters and updates</li>
                            <li>• Improve our content and user experience</li>
                            <li>• Respond to your requests and inquiries</li>
                            <li>• Prevent fraudulent activity</li>
                            <li>• Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">3. Legal Basis for Processing</h2>
                        <p className="text-white/60 leading-relaxed">
                            We process your personal information based on the following legal grounds:
                        </p>
                        <ul className="text-white/60 space-y-2 pl-6 mt-4">
                            <li>• <strong>Contractual necessity:</strong> To fulfill our subscription agreement with you</li>
                            <li>• <strong>Legitimate interests:</strong> To improve our services and prevent fraud</li>
                            <li>• <strong>Consent:</strong> For marketing communications and newsletters</li>
                            <li>• <strong>Legal obligation:</strong> To comply with applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">4. Information Sharing</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                        </p>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Service Providers</h3>
                                <p className="text-white/60 leading-relaxed">
                                    We may share information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
                                </p>
                                <ul className="text-white/60 space-y-2 pl-6 mt-2">
                                    <li>• Payment processors (Stripe)</li>
                                    <li>• Email service providers (Gmail API)</li>
                                    <li>• Cloud hosting providers (Supabase)</li>
                                    <li>• Analytics providers</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Legal Requirements</h3>
                                <p className="text-white/60 leading-relaxed">
                                    We may disclose your information when required by law or to protect our rights, safety, or property.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">5. Data Security</h2>
                        <p className="text-white/60 leading-relaxed">
                            We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of information. These include:
                        </p>
                        <ul className="text-white/60 space-y-2 pl-6 mt-4">
                            <li>• SSL encryption for data transmission</li>
                            <li>• Secure payment processing through Stripe</li>
                            <li>• Regular security assessments</li>
                            <li>• Access controls and authentication</li>
                            <li>• Data backup and recovery procedures</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">6. Your Rights</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            You have the following rights regarding your personal information:
                        </p>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Access and Portability</h3>
                                <p className="text-white/60 leading-relaxed">
                                    You can request access to your personal information and receive a copy of the data we hold about you.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Correction</h3>
                                <p className="text-white/60 leading-relaxed">
                                    You can request correction of inaccurate or incomplete personal information.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Deletion</h3>
                                <p className="text-white/60 leading-relaxed">
                                    You can request deletion of your personal information, subject to legal obligations.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-light text-white mb-2">Opt-out</h3>
                                <p className="text-white/60 leading-relaxed">
                                    You can unsubscribe from marketing communications at any time using the links provided in our emails.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">7. Cookies and Tracking</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            We use cookies and similar tracking technologies to:
                        </p>
                        <ul className="text-white/60 space-y-2 pl-6">
                            <li>• Remember your preferences</li>
                            <li>• Analyze website usage</li>
                            <li>• Improve user experience</li>
                            <li>• Deliver personalized content</li>
                        </ul>
                        <p className="text-white/60 leading-relaxed mt-4">
                            You can control cookie preferences through your browser settings or our cookie consent mechanism.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">8. International Transfers</h2>
                        <p className="text-white/60 leading-relaxed">
                            Your information may be transferred to and processed in countries other than your own, where data protection laws may differ. We ensure appropriate safeguards are in place for such transfers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">9. Children's Privacy</h2>
                        <p className="text-white/60 leading-relaxed">
                            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">10. Data Retention</h2>
                        <p className="text-white/60 leading-relaxed">
                            We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">11. Third-Party Links</h2>
                        <p className="text-white/60 leading-relaxed">
                            Our website may contain links to third-party websites or services that are not owned or controlled by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">12. Changes to This Privacy Policy</h2>
                        <p className="text-white/60 leading-relaxed">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-light text-white mb-4">13. Contact Us</h2>
                        <p className="text-white/60 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="bg-black/20 border border-white/10 p-4 rounded-lg">
                            <p className="text-white/60">Imperium Strategic Intelligence</p>
                            <p className="text-white/40 text-sm">For privacy inquiries and data requests</p>
                            <p className="text-white/40 text-sm mt-2">Email: privacy@imperium.ai</p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-imperium-gold/20 py-8">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <p className="text-white/40 text-sm uppercase tracking-widest">
                        Imperium Strategic Intelligence • Your privacy matters
                    </p>
                </div>
            </footer>
        </div>
    );
}