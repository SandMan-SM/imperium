"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Lock, Crown, Loader2, CheckCircle2 } from "lucide-react";

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
            <div className="min-h-screen bg-imperium-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    const displayedPrinciples = isPremium ? ALL_PRINCIPLES : ALL_PRINCIPLES.slice(0, 5);

    return (
        <div className="min-h-screen bg-imperium-bg">
            {/* Page hero */}
            <div className="relative border-b border-imperium-border pt-[84px] pb-12 sm:pb-16 md:pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />
                <div className="relative container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 sm:mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        {isPremium ? (
                            <>
                                <Crown className="w-3 h-3 text-imperium-gold" />
                                <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">Premium Access</span>
                            </>
                        ) : (
                            <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">The Doctrine</span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-light text-white uppercase tracking-[0.15em] mb-3 sm:mb-4 px-2 sm:px-0" style={{ paddingTop: '6px' }}>
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
                        <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-imperium-gold">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-wider">Premium Member</span>
                        </div>
                    ) : (
                        <a
                            href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-5 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-imperium-gold transition-all duration-200"
                        >
                            Join Now — $20/month
                        </a>
                    )}
                </div>
            </div>

            {/* Principles list */}
            <div className="container mx-auto px-3 sm:px-4 max-w-3xl py-12 sm:py-16">
                <div className="space-y-3">
                    {displayedPrinciples.map((p) => {
                        const isLocked = !isPremium && ALL_PRINCIPLES.indexOf(p) >= 5;
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
                                        {isLocked ? "This principle is locked behind the Imperium Elite subscription. Subscribe to unlock all 28 laws." : p.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                {!isPremium && (
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
                )}

                {isPremium && (
                    <div className="mt-12 sm:mt-16 text-center">
                        <div className="inline-block bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-6 sm:p-8">
                            <Crown className="w-8 h-8 text-imperium-gold mx-auto mb-3" />
                            <h3 className="text-lg font-light text-white uppercase tracking-widest mb-2">Full Access Granted</h3>
                            <p className="text-gray-400 text-sm">You have access to all 28 Principles and premium intelligence.</p>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
