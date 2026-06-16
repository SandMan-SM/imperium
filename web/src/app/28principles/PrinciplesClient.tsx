"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Lock, Crown, Loader2, CheckCircle2, Target } from "lucide-react";

const ALL_PRINCIPLES = [
    { num: "01", title: "The Law of Deliberate Action", desc: "Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity. Reactivity is the signature of the amateur." },
    { num: "02", title: "The Law of Leverage", desc: "Maximum output from minimum input. Identify the single point of force that moves the entire system. Effort without leverage is just labor." },
    { num: "03", title: "The Law of Identity Precedence", desc: "Behavior flows downstream from identity. Before you change anything external, you must fix what you believe internally about who you are." },
    { num: "04", title: "The Law of Strategic Silence", desc: "Power is accumulated in silence. Speak only when your words increase your position — otherwise, observe, absorb, and move in the dark." },
    { num: "05", title: "The Law of Compounding Discipline", desc: "One act of discipline is nothing. Ten thousand acts of discipline across years become an unstoppable sovereign force. Consistency is the weapon." },
    // Premium only principles
    { num: "06", title: "The Law of Controlled Perception", desc: "Your reality is constructed. The sovereign controls the narrative by mastering how they are perceived. Perception, when carefully engineered, becomes reality." },
    { num: "07", title: "The Law of Asymmetric Risk", desc: "Structure every venture so your downside is capped while your upside is infinite. The amateur seeks safe bets; the sovereign creates asymmetric opportunities." },
    { num: "08", title: "The Law of Network Sovereignty", desc: "Your network is your net worth — but only if you control it. Build systems, not dependencies. Every connection should amplify your sovereignty, not diminish it." },
    { num: "09", title: "The Law of Studied Patience", desc: "Speed is a weapon when directed. Stillness is a weapon when sustained. The sovereign knows when to strike and when to wait. Time is the ultimate leverage." },
    { num: "10", title: "The Law of Financial Sovereignty", desc: "Money is a tool of freedom, not a measure of worth. Accumulate assets, eliminate liabilities, and never let currency dictate your strategic decisions." },
    { num: "11", title: "The Law of Territorial Expansion", desc: "Expand your domain methodically. Conquer one territory completely before moving to the next. Fragmented effort yields fragmented results." },
    { num: "12", title: "The Law of Intentional Scarcity", desc: "Abundance attracts the masses. Scarcity attracts the elite. Control access. Make your presence a privilege, not a commodity." },
    { num: "13", title: "The Law of the Long Game", desc: "Short-term wins create dopamine. Long-term systems create empires. The sovereign builds what outlasts them." },
    { num: "14", title: "The Law of Proximity & Power", desc: "You become who you surround yourself with. Distance yourself from the mediocre. Immerse yourself in environments that elevate your capacity." },
    { num: "15", title: "The Law of Emotional Armor", desc: "Emotions are data, not directives. The sovereign feels everything but is ruled by nothing. Build emotional architecture that protects your strategic mind." },
    { num: "16", title: "The Law of Calculated Ruthlessness", desc: "Kindness without boundaries is weakness. The sovereign is generous with those who serve the mission, and ruthless with those who threaten it." },
    { num: "17", title: "The Law of Sustained Momentum", desc: "Start fast. Stay consistent. Momentum is easier to maintain than to create. Never let a good start become an excuse to slow down." },
    { num: "18", title: "The Law of Architectural Thinking", desc: "Build systems that work while you sleep. Create processes that compound over time. The sovereign builds architecture, not just outcomes." },
    { num: "19", title: "The Law of Radical Ownership", desc: "No excuses. No blame. The sovereign owns everything — their success, their failure, their circumstances. Radical ownership is the foundation of all power." },
    { num: "20", title: "The Law of Calibrated Communication", desc: "Speak with precision. Every word should serve a purpose. The sovereign communicates with the economy of language — nothing wasted, everything weighted." },
    { num: "21", title: "The Law of Environmental Dominance", desc: "Control your environment or it will control you. Design your physical, digital, and social spaces to reinforce your strategic objectives." },
    { num: "22", title: "The Law of Purposeful Restriction", desc: "Freedom is found in discipline, not in excess. Restrict what weakens you. The sovereign embraces constraints as tools of power." },
    { num: "23", title: "The Law of Strategic Alliances", desc: "Choose allies with the same ruthlessness you choose enemies. Alliances should multiply your capability, not divide your focus." },
    { num: "24", title: "The Law of Information Asymmetry", desc: "Knowledge is power when others don't have it. Collect intelligence. Guard your sources. The sovereign operates with information others cannot access." },
    { num: "25", title: "The Law of Inevitable Victory", desc: "Prepare so thoroughly that victory becomes inevitable. The sovereign doesn't hope to win — they engineer the conditions that make losing impossible." },
    { num: "26", title: "The Law of Internal War", desc: "The greatest battles are fought within. Conquer your impulses before you conquer your enemies. Self-mastery is the prerequisite for world conquest." },
    { num: "27", title: "The Law of Succession", desc: "Build something that outlasts you. The sovereign doesn't just create results — they create systems, leaders, and legacies that continue after they're gone." },
    { num: "28", title: "The Law of The Imperium Mind", desc: "The final principle: there is no final principle. The sovereign never stops learning, evolving, and transcending. The Imperium mind is a forever expanding frontier." },
];

export default function PrinciplesPage() {
    const { user, profile, checkPremiumStatus, loading } = useAuth();
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        async function checkPremium() {
            if (user && profile) {
                const premium = profile.is_premium || profile.subscription_status === "active";
                setIsPremium(premium);
            } else if (user && !profile) {
                const { isPremium: premium } = await checkPremiumStatus(user.email || "");
                setIsPremium(premium);
            } else {
                setIsPremium(false);
            }
        }
        checkPremium();
    }, [user, profile, checkPremiumStatus]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-imperium-gold animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Initializing Imperium Protocol...</p>
                </div>
            </div>
        );
    }

    const displayedPrinciples = isPremium ? ALL_PRINCIPLES : ALL_PRINCIPLES.slice(0, 10);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Page hero */}
            <div className="relative border-b border-imperium-gold/20 pt-[84px] pb-12 sm:pb-16 md:pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />
                <div className="relative container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 sm:mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        {isPremium ? (
                            <>
                                <Crown className="w-3 h-3 text-imperium-gold" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">Elite Member</span>
                            </>
                        ) : (
                            <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">The Doctrine</span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-light text-white uppercase tracking-[0.15em] mb-4 sm:mb-4 px-2 sm:px-0" style={{ paddingTop: '6px' }}>
                        The{" "}
                        <span
                            className="text-imperium-gold"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                        >
                            28 Principles
                        </span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto font-light leading-relaxed text-sm sm:text-base px-2 sm:px-0">
                        {isPremium
                            ? "Your complete access to the Imperium operating system. All 28 laws derived from history's most formidable sovereigns, fully unlocked."
                            : "The complete Imperium operating system. Laws derived from history's most formidable sovereigns, condensed into an executable framework."
                        }
                    </p>

                    {isPremium ? (
                        <div className="mt-6 flex items-center justify-center gap-2 text-imperium-gold">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-wider">Premium Member</span>
                        </div>
                    ) : (
                        <a
                            href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-block px-6 sm:px-8 py-3 sm:py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200 btn-primary"
                        >
                            Join Now — $20/month
                        </a>
                    )}
                </div>
            </div>

            {/* Principles list */}
            <div className="container mx-auto px-3 sm:px-4 max-w-4xl py-12 sm:py-16">
                <div className="space-y-4">
                    {displayedPrinciples.map((p, index) => {
                        const isLocked = !isPremium && ALL_PRINCIPLES.indexOf(p) >= 5;

                        return (
                            <div
                                key={p.num}
                                className={`group relative grid grid-cols-12 gap-4 sm:gap-6 items-start rounded-xl border transition-all duration-500 hover:scale-[1.02] ${isLocked
                                    ? "border-white/[0.04] bg-white/[0.01] hover:border-gray-600/30"
                                    : "border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/25 hover:bg-white/[0.04]"
                                    }`}
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    animation: `fadeInUp 0.6s ease-out forwards`,
                                    opacity: 0,
                                    transform: 'translateY(20px)'
                                }}
                            >
                                {isLocked && (
                                    <div className="absolute inset-0 rounded-xl backdrop-blur-[1px] bg-gradient-to-br from-gray-900/80 to-black/80 flex items-center justify-center z-10">
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <Lock className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-[0.2em] font-bold">Subscribe to Unlock</span>
                                        </div>
                                    </div>
                                )}

                                {/* Large Number Badge - takes up first part of the bar */}
                                <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${isLocked
                                        ? "text-gray-500"
                                        : "text-imperium-gold group-hover:scale-105"
                                        }`}>
                                        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider">{p.num}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="col-span-9 sm:col-span-10 py-4 pr-4">
                                    <h2 className={`text-base sm:text-lg font-semibold tracking-wide transition-colors ${isLocked ? "text-gray-600" : "text-white group-hover:text-imperium-gold"
                                        }`}>
                                        {p.title}
                                    </h2>
                                    <p className={`text-sm sm:text-base leading-relaxed transition-colors ${isLocked ? "text-gray-600" : "text-gray-300 group-hover:text-gray-200"
                                        }`}>
                                        {isLocked
                                            ? "This principle is locked behind the Imperium Elite subscription. Subscribe to unlock all 28 laws."
                                            : p.desc
                                        }
                                    </p>
                                </div>

                                {/* Lock Overlay */}
                                {isLocked && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-black/50 border border-gray-600/30 rounded-lg p-2">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* CTA Section */}
                {!isPremium && (
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-imperium-gold to-transparent" />
                            <h3 className="text-2xl sm:text-3xl font-light text-white uppercase tracking-widest mb-4">Unlock the Full Doctrine</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto font-light text-base leading-relaxed">
                                All 28 Principles. Daily intelligence briefs. Inner Circle access. All for less than a single coffee per week.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-imperium-gold" />
                                    <span>Complete 28 Principles</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-imperium-gold" />
                                    <span>Daily Intelligence Briefs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-imperium-gold" />
                                    <span>Inner Circle Access</span>
                                </div>
                            </div>
                            <a
                                href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-4 px-8 sm:px-10 py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                            >
                                <span>Subscribe — $20/month</span>
                                <div className="w-2 h-2 bg-black rounded-full group-hover:bg-transparent transition-all" />
                            </a>
                            <p className="mt-4 text-xs text-gray-600 uppercase tracking-widest">Cancel anytime. No questions asked.</p>
                        </div>
                    </div>
                )}

                {isPremium && (
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-br from-imperium-gold/10 to-transparent border border-imperium-gold/20 rounded-3xl p-8">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Crown className="w-8 h-8 text-imperium-gold" />
                                <CheckCircle2 className="w-6 h-6 text-imperium-gold" />
                            </div>
                            <h3 className="text-xl font-light text-white uppercase tracking-widest mb-2">Full Access Granted</h3>
                            <p className="text-gray-400 text-base">You have access to all 28 Principles and premium intelligence.</p>
                            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                                <span>✓ Complete Doctrine</span>
                                <span>✓ Daily Briefs</span>
                                <span>✓ Inner Circle</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2">
                        <span>← Back to Home</span>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}