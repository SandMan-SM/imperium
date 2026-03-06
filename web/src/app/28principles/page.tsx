import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
    title: "The 28 Principles — Imperium Elite",
    description: "The complete Imperium operating system. 28 laws forged for the disciplined sovereign.",
};

const ALL_PRINCIPLES = [
    { num: "01", title: "The Law of Deliberate Action", desc: "Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity. Reactivity is the signature of the amateur." },
    { num: "02", title: "The Law of Leverage", desc: "Maximum output from minimum input. Identify the single point of force that moves the entire system. Effort without leverage is just labor." },
    { num: "03", title: "The Law of Identity Precedence", desc: "Behavior flows downstream from identity. Before you change anything external, you must fix what you believe internally about who you are." },
    { num: "04", title: "The Law of Strategic Silence", desc: "Power is accumulated in silence. Speak only when your words increase your position — otherwise, observe, absorb, and move in the dark." },
    { num: "05", title: "The Law of Compounding Discipline", desc: "One act of discipline is nothing. Ten thousand acts of discipline across years become an unstoppable sovereign force. Consistency is the weapon." },
    // Locked principles below
    { num: "06", title: "The Law of Controlled Perception", desc: null },
    { num: "07", title: "The Law of Asymmetric Risk", desc: null },
    { num: "08", title: "The Law of Network Sovereignty", desc: null },
    { num: "09", title: "The Law of Studied Patience", desc: null },
    { num: "10", title: "The Law of Financial Sovereignty", desc: null },
    { num: "11", title: "The Law of Territorial Expansion", desc: null },
    { num: "12", title: "The Law of Intentional Scarcity", desc: null },
    { num: "13", title: "The Law of the Long Game", desc: null },
    { num: "14", title: "The Law of Proximity & Power", desc: null },
    { num: "15", title: "The Law of Emotional Armor", desc: null },
    { num: "16", title: "The Law of Calculated Ruthlessness", desc: null },
    { num: "17", title: "The Law of Sustained Momentum", desc: null },
    { num: "18", title: "The Law of Architectural Thinking", desc: null },
    { num: "19", title: "The Law of Radical Ownership", desc: null },
    { num: "20", title: "The Law of Calibrated Communication", desc: null },
    { num: "21", title: "The Law of Environmental Dominance", desc: null },
    { num: "22", title: "The Law of Purposeful Restriction", desc: null },
    { num: "23", title: "The Law of Strategic Alliances", desc: null },
    { num: "24", title: "The Law of Information Asymmetry", desc: null },
    { num: "25", title: "The Law of Inevitable Victory", desc: null },
    { num: "26", title: "The Law of Internal War", desc: null },
    { num: "27", title: "The Law of Succession", desc: null },
    { num: "28", title: "The Law of The Imperium Mind", desc: null },
];

export default function PrinciplesPage() {
    return (
        <div className="min-h-screen bg-imperium-bg">
            {/* Page hero */}
            <div className="relative border-b border-imperium-border pt-[72px] pb-12 sm:pb-16 md:pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />
                <div className="relative container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 sm:mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">The Doctrine</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-light text-white uppercase tracking-[0.15em] mb-3 sm:mb-4 px-2 sm:px-0">
                        The{" "}
                        <span
                            className="text-imperium-gold"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                        >
                            28 Principles
                        </span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto font-light leading-relaxed text-sm sm:text-base px-2 sm:px-0">
                        The complete Imperium operating system. Laws derived from history's most formidable sovereigns, condensed into an executable framework.
                    </p>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-imperium-gold/70 font-bold uppercase tracking-widest">
                        5 Free · Remaining 23 Unlocked with Subscription
                    </p>
                </div>
            </div>

            {/* Principles list */}
            <div className="container mx-auto px-3 sm:px-4 max-w-3xl py-12 sm:py-16">
                <div className="space-y-3">
                    {ALL_PRINCIPLES.map((p, i) => {
                        const isLocked = p.desc === null;
                        return (
                            <div
                                key={p.num}
                                className={`group relative flex gap-3 sm:gap-6 items-start rounded-lg sm:rounded-xl border p-4 sm:p-6 transition-all duration-500 ${isLocked
                                    ? "border-white/[0.04] bg-white/[0.01]"
                                    : "border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/25 hover:bg-white/[0.04]"
                                    }`}
                            >
                                {isLocked && (
                                    <div className="absolute inset-0 rounded-lg sm:rounded-xl backdrop-blur-[1px] bg-imperium-bg/50 flex items-center justify-center z-10">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold">Subscribe to Unlock</span>
                                        </div>
                                    </div>
                                )}
                                <span
                                    className={`text-2xl sm:text-3xl font-bold font-mono leading-none pt-0.5 sm:pt-1 flex-shrink-0 w-8 sm:w-12 transition-colors duration-300 ${isLocked ? "text-gray-800" : "text-imperium-gold/30 group-hover:text-imperium-gold/70"
                                        }`}
                                >
                                    {p.num}
                                </span>
                                <div>
                                    <h2
                                        className={`text-sm sm:text-base font-semibold mb-1 sm:mb-2 tracking-wide transition-colors duration-300 ${isLocked ? "text-gray-700" : "text-white group-hover:text-imperium-gold"
                                            }`}
                                    >
                                        {p.title}
                                    </h2>
                                    <p className={`text-xs sm:text-sm font-light leading-relaxed ${isLocked ? "text-gray-700" : "text-gray-500"}`}>
                                        {p.desc ?? "This principle is locked behind the Imperium Elite subscription. Subscribe to unlock all 28 laws."}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Unlock CTA */}
                <div className="mt-12 sm:mt-16 text-center">
                    <div className="inline-block bg-white/[0.02] border border-imperium-gold/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 relative overflow-hidden">
                        <h3 className="text-xl sm:text-2xl font-light text-white uppercase tracking-widest mb-3">Unlock the Full Doctrine</h3>
                        <p className="text-gray-400 mb-6 sm:mb-8 max-w-sm mx-auto font-light text-sm leading-relaxed px-2 sm:px-0">
                            All 28 Principles. Daily intelligence briefs. Inner Circle access. All for less than a single coffee per week.
                        </p>
                        <a
                            href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-br from-imperium-gold to-[#b38f2d] text-black font-bold uppercase tracking-[0.2em] text-xs sm:text-sm rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                        >
                            Subscribe — $20/month
                        </a>
                        <p className="mt-3 sm:mt-4 text-xs text-gray-600 uppercase tracking-widest">Cancel anytime.</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
