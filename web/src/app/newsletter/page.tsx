import type { Metadata } from "next";
import { NewsletterOptin } from "@/components/NewsletterOptin";

export const metadata: Metadata = {
    title: "Intelligence Newsletter — Imperium Elite",
    description: "Subscribe to the Imperium daily intelligence brief. Precision frameworks for discipline, strategy, and self-mastery delivered to your inbox.",
};

const WHAT_YOU_GET = [
    { label: "Daily Brief", desc: "A curated strategic intelligence drop sent each morning — actionable, precise, zero filler." },
    { label: "28 Principles", desc: "Full access to the Imperium doctrine. The complete operating system for the sovereign mind." },
    { label: "Inner Circle", desc: "A private network of elite subscribers operating across business, finance, and self-mastery." },
    { label: "Archived Library", desc: "Every past brief, organized by theme. A permanent reference of tactical intelligence." },
];

export default function NewsletterPage() {
    return (
        <div className="min-h-screen bg-imperium-bg">
            {/* Hero */}
            <div className="relative border-b border-imperium-border pt-[72px] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />

                <div className="relative container mx-auto px-4 sm:px-6 max-w-3xl py-12 sm:py-16 md:py-24 text-center">
                    <div className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-imperium-gold text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">Intelligence Network</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-6xl text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
                        The{" "}
                        <span className="font-display italic text-gold-gradient">Imperium</span>{" "}
                        Intelligence Brief
                    </h1>

                    <p className="text-white/45 font-light text-xs sm:text-sm md:text-lg leading-relaxed mb-3 sm:mb-4 px-2 sm:px-0">
                        A daily dose of raw tactical intellect for the disciplined sovereign. No noise, no motivation platitudes — just precision frameworks from the world's most formidable strategic minds.
                    </p>

                    <p className="text-imperium-gold/60 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-widest uppercase">
                        2,400+ subscribers · $20 / month · Cancel anytime
                    </p>
                </div>
            </div>

            {/* What you get */}
            <div className="border-b border-imperium-border py-16 md:py-20">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-12 md:mb-14">
                        <h2 className="text-2xl md:text-3xl text-white mb-3">What's included</h2>
                        <p className="text-white/35 font-light text-sm">Everything you need to operate at an elite level.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {WHAT_YOU_GET.map((item, i) => (
                            <div
                                key={i}
                                className="glass-card rounded-2xl p-6 md:p-7 relative overflow-hidden group hover:border-imperium-gold/20 transition-all duration-300"
                            >
                                <div className="text-imperium-gold text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-3">{item.label}</div>
                                <p className="text-white/50 font-light text-xs md:text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subscription optin */}
            <div className="py-20">
                <div className="container mx-auto px-6 max-w-2xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl text-white mb-3">Subscribe Now</h2>
                        <p className="text-white/40 font-light text-sm">Enter your email below or go straight to checkout.</p>
                    </div>

                    <NewsletterOptin />

                    <div className="mt-12 text-center">
                        <p className="text-white/25 text-sm font-light mb-4">Or subscribe directly via Stripe:</p>
                        <a
                            href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gold !text-[11px] md:!text-[12px] w-full sm:w-auto"
                        >
                            Join Imperium Elite — $20/month
                        </a>
                        <p className="mt-4 text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">No contracts. Cancel anytime.</p>
                    </div>
                </div>
            </div>

            {/* Sample brief preview */}
            <div className="border-t border-imperium-border py-20">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <h2 className="text-2xl text-white mb-3">Sample Intelligence Brief</h2>
                    <p className="text-white/35 font-light text-sm mb-10">Every brief looks like this. Dense. Formatted. Executable.</p>

                    <div className="glass-card rounded-2xl p-6 md:p-10 text-left relative overflow-hidden">

                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-imperium-border">
                            <div>
                                <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-imperium-gold mb-1">Imperium Intelligence Brief</p>
                                <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">Issue 147 · Tactical Series</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center">
                                <span className="text-imperium-gold text-xs font-bold">I</span>
                            </div>
                        </div>

                        <h3 className="text-base md:text-lg font-semibold text-white mb-4">The Law of Deliberate Action</h3>
                        <p className="text-white/50 font-light text-[13px] md:text-sm leading-relaxed mb-6">
                            Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity. Reactivity is the signature of the amateur. This brief breaks down three tactical frameworks used by the most effective operators in history to eliminate reactive decision-making from their behavioral stack.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 pt-6 md:pt-4 border-t border-imperium-border">
                            {["Framework 01", "Framework 02", "Framework 03"].map((f, i) => (
                                <div key={i} className="text-center md:text-left">
                                    <div className="text-[10px] font-bold tracking-widest uppercase text-white/20 mb-2 md:mb-1">{f}</div>
                                    <div className="w-full h-2 rounded-full bg-imperium-gold/10 relative overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-imperium-gold/40 rounded-full"
                                            style={{ width: ["80%", "60%", "45%"][i] }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Blurred bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-imperium-bg via-imperium-bg/95 to-transparent flex items-end justify-center pb-6">
                            <a
                                href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold hover:text-imperium-gold-bright transition-colors"
                            >
                                Subscribe to read all briefs →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
