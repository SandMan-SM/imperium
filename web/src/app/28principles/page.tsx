"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Lock, Crown, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { CURRICULUM, FREE_PHASE_ID, TOTAL_UNITS, type SubPoint } from "@/lib/curriculum";

function SubPointList({ items, depth = 0 }: { items: SubPoint[]; depth?: number }) {
    return (
        <ul className={`space-y-2 ${depth === 0 ? "mt-3" : "mt-2 ml-4"}`}>
            {items.map((sp, i) => (
                <li key={i} className="text-sm sm:text-[15px] text-gray-300 leading-relaxed flex gap-3">
                    <span className="text-imperium-gold/60 select-none mt-[7px]">
                        {depth === 0 ? "—" : "·"}
                    </span>
                    <div className="flex-1">
                        <span>{sp.text}</span>
                        {sp.children && sp.children.length > 0 && (
                            <SubPointList items={sp.children} depth={depth + 1} />
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default function PrinciplesPage() {
    const { user, profile, checkPremiumStatus, loading } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [openUnits, setOpenUnits] = useState<Record<number, boolean>>({});

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

    const toggleUnit = (id: number) => {
        setOpenUnits((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Hero */}
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
                    <h1
                        className="text-2xl sm:text-3xl md:text-6xl font-light text-white uppercase tracking-[0.15em] mb-4 sm:mb-4 px-2 sm:px-0"
                        style={{ paddingTop: "6px" }}
                    >
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
                            ? `${TOTAL_UNITS} units across 5 phases. The complete Imperium operating system, fully unlocked.`
                            : `${TOTAL_UNITS} units across 5 phases — designed to guide individuals into an advanced state of human development.`}
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

            {/* Phases */}
            <div className="container mx-auto px-3 sm:px-4 max-w-4xl py-12 sm:py-16">
                {CURRICULUM.map((phase, phaseIdx) => {
                    const phaseLocked = !isPremium && phase.id !== FREE_PHASE_ID;
                    return (
                        <section
                            key={phase.id}
                            className="mb-16"
                            aria-labelledby={`phase-${phase.id}-heading`}
                            style={{
                                animationDelay: `${phaseIdx * 0.1}s`,
                                animation: "fadeInUp 0.6s ease-out forwards",
                                opacity: 0,
                                transform: "translateY(20px)",
                            }}
                        >
                            {/* Phase header */}
                            <header className="mb-6 text-center">
                                <div className="inline-flex items-center gap-3 px-4 py-1 border border-imperium-gold/30 rounded-full bg-imperium-gold/[0.03]">
                                    <span className="text-[10px] font-bold tracking-[0.25em] text-imperium-gold uppercase">
                                        Phase {phase.roman}
                                    </span>
                                    {phaseLocked && <Lock className="w-3 h-3 text-imperium-gold/70" />}
                                </div>
                                <h2
                                    id={`phase-${phase.id}-heading`}
                                    className="mt-4 text-xl sm:text-2xl md:text-3xl font-light text-white uppercase tracking-[0.2em]"
                                >
                                    {phase.name}
                                </h2>
                                <p className="mt-2 text-sm text-gray-500 italic font-light max-w-md mx-auto">
                                    {phase.tagline}
                                </p>
                            </header>

                            {/* Units */}
                            <div className="space-y-3">
                                {phase.units.map((unit) => {
                                    const isOpen = !!openUnits[unit.id];
                                    const unitLocked = phaseLocked;
                                    const num = unit.id.toString().padStart(2, "0");
                                    return (
                                        <div
                                            key={unit.id}
                                            className={`group relative rounded-xl border transition-all duration-300 ${
                                                unitLocked
                                                    ? "border-white/[0.04] bg-white/[0.01]"
                                                    : "border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/25"
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => !unitLocked && toggleUnit(unit.id)}
                                                disabled={unitLocked}
                                                aria-expanded={isOpen}
                                                aria-controls={`unit-${unit.id}-body`}
                                                aria-label={`Unit ${unit.id}: ${unit.title}${unitLocked ? " (locked)" : ""}`}
                                                className={`w-full grid grid-cols-12 gap-4 sm:gap-6 items-center text-left rounded-xl ${
                                                    unitLocked ? "cursor-not-allowed" : "cursor-pointer"
                                                }`}
                                            >
                                                {/* Number */}
                                                <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                                    <div
                                                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                                            unitLocked
                                                                ? "text-gray-600"
                                                                : "text-imperium-gold group-hover:scale-105"
                                                        }`}
                                                    >
                                                        <span className="text-xl sm:text-2xl font-bold font-mono tracking-wider">
                                                            {num}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Title + chevron */}
                                                <div className="col-span-9 sm:col-span-10 py-4 pr-4 flex items-center justify-between gap-3">
                                                    <h3
                                                        className={`text-base sm:text-lg font-semibold tracking-wide transition-colors ${
                                                            unitLocked
                                                                ? "text-gray-600"
                                                                : "text-white group-hover:text-imperium-gold"
                                                        }`}
                                                    >
                                                        {unit.title}
                                                    </h3>
                                                    {unitLocked ? (
                                                        <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                                                    ) : (
                                                        <ChevronDown
                                                            className={`w-5 h-5 text-imperium-gold/60 shrink-0 transition-transform duration-300 ${
                                                                isOpen ? "rotate-180" : ""
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Sub-points */}
                                            {!unitLocked && isOpen && (
                                                <div
                                                    id={`unit-${unit.id}-body`}
                                                    className="px-6 sm:px-10 pb-5 -mt-2"
                                                >
                                                    <SubPointList items={unit.subPoints} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Phase-level lock CTA */}
                                {phaseLocked && (
                                    <div className="mt-6 rounded-xl border border-imperium-gold/20 bg-gradient-to-br from-gray-900/60 to-black/60 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <Lock className="w-4 h-4 text-imperium-gold/70" />
                                            <span className="text-xs uppercase tracking-[0.2em] font-bold">
                                                Phase {phase.roman} locked — subscribe to unlock
                                            </span>
                                        </div>
                                        <a
                                            href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-2 bg-imperium-gold text-[#030712] text-[10px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                                        >
                                            Unlock — $20/mo
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })}

                {/* Subscriber CTA */}
                {!isPremium && (
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-imperium-gold to-transparent" />
                            <h3 className="text-2xl sm:text-3xl font-light text-white uppercase tracking-widest mb-4">
                                Unlock the Full Doctrine
                            </h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto font-light text-base leading-relaxed">
                                All 28 units across all 5 phases. Daily intelligence briefs. Inner Circle access.
                                Less than a single coffee per week.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm text-gray-400">
                                <div className="flex items-center gap-2 justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-imperium-gold" />
                                    <span>Complete 28 Principles</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-imperium-gold" />
                                    <span>Daily Intelligence Briefs</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
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
                            </a>
                            <p className="mt-4 text-xs text-gray-600 uppercase tracking-widest">
                                Cancel anytime. No questions asked.
                            </p>
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
                            <h3 className="text-xl font-light text-white uppercase tracking-widest mb-2">
                                Full Access Granted
                            </h3>
                            <p className="text-gray-400 text-base">
                                You have access to all {TOTAL_UNITS} units across all 5 phases.
                            </p>
                            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                                <span>✓ Complete Doctrine</span>
                                <span>✓ Daily Briefs</span>
                                <span>✓ Inner Circle</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="text-sm text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2"
                    >
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
