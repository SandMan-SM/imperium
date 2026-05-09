"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Crown,
    Loader2,
    Lock,
    Square,
    SquareCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
    FREE_PHASE_ID,
    TOTAL_UNITS,
    type Phase,
    type SubPoint,
    type Unit,
} from "@/lib/curriculum";
import { isSubPointChecked, isUnitComplete, useProgress } from "@/lib/progress";

function ChapterChecklist({
    items,
    unitId,
    parentPath = "",
    state,
    onToggle,
    depth = 0,
}: {
    items: SubPoint[];
    unitId: number;
    parentPath?: string;
    state: ReturnType<typeof useProgress>["state"];
    onToggle: (path: string) => void;
    depth?: number;
}) {
    return (
        <ol
            className={
                depth === 0
                    ? "space-y-5"
                    : "mt-3 ml-6 space-y-2 border-l border-imperium-gold/15 pl-4"
            }
        >
            {items.map((sp, i) => {
                const path = parentPath === "" ? `${i}` : `${parentPath}.${i}`;
                const checked = isSubPointChecked(state, unitId, path);
                return (
                    <li
                        key={path}
                        className="group"
                        style={{
                            animation: `chapterIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                            animationDelay: `${depth === 0 ? i * 90 : 0}ms`,
                            opacity: 0,
                            transform: "translateY(12px)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => onToggle(path)}
                            aria-pressed={checked}
                            className={`flex gap-4 w-full text-left rounded-lg py-2 pr-3 transition-colors hover:bg-imperium-gold/[0.04]`}
                        >
                            {depth === 0 ? (
                                <span
                                    className={`mt-0.5 shrink-0 w-9 h-9 rounded-full border flex items-center justify-center text-[11px] font-mono tracking-wider transition-colors ${
                                        checked
                                            ? "border-imperium-gold bg-imperium-gold text-[#030712]"
                                            : "border-imperium-gold/30 text-imperium-gold/70"
                                    }`}
                                >
                                    {checked ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        (i + 1).toString().padStart(2, "0")
                                    )}
                                </span>
                            ) : (
                                <span className="mt-1.5 shrink-0">
                                    {checked ? (
                                        <SquareCheck className="w-4 h-4 text-imperium-gold" />
                                    ) : (
                                        <Square className="w-4 h-4 text-gray-500 group-hover:text-imperium-gold/70" />
                                    )}
                                </span>
                            )}
                            <span
                                className={`flex-1 leading-relaxed ${
                                    depth === 0
                                        ? "text-lg sm:text-xl font-light text-white"
                                        : "text-sm sm:text-[15px] text-gray-300"
                                } ${checked ? "text-gray-500 line-through decoration-imperium-gold/40" : ""}`}
                            >
                                {sp.text}
                            </span>
                        </button>
                        {sp.children && sp.children.length > 0 && (
                            <ChapterChecklist
                                items={sp.children}
                                unitId={unitId}
                                parentPath={path}
                                state={state}
                                onToggle={onToggle}
                                depth={depth + 1}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export function UnitImmersive({
    phase,
    unit,
    prev,
    next,
}: {
    phase: Phase;
    unit: Unit;
    prev: Unit | null;
    next: Unit | null;
}) {
    const router = useRouter();
    const { user, profile, checkPremiumStatus, loading } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const { state, hydrated, markUnit, toggleSubPoint } = useProgress();
    const [entered, setEntered] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        async function checkPremium() {
            if (user && profile) {
                setIsPremium(profile.is_premium || profile.subscription_status === "active");
            } else if (user && !profile) {
                const { isPremium: premium } = await checkPremiumStatus(user.email || "");
                setIsPremium(premium);
            } else {
                setIsPremium(false);
            }
        }
        checkPremium();
    }, [user, profile, checkPremiumStatus]);

    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement;
            const max = el.scrollHeight - el.clientHeight;
            setReadingProgress(max <= 0 ? 0 : Math.min(100, Math.max(0, (el.scrollTop / max) * 100)));
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const completed = useMemo(() => isUnitComplete(state, unit.id), [state, unit.id]);
    const phaseLocked = !isPremium && phase.id !== FREE_PHASE_ID;

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

    if (phaseLocked) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 pt-[84px]">
                <div className="max-w-md w-full text-center border border-imperium-gold/20 rounded-3xl bg-black/40 px-8 py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-imperium-gold/30 rounded-full">
                        <Lock className="w-3 h-3 text-imperium-gold" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">
                            Phase {phase.roman} Locked
                        </span>
                    </div>
                    <h2 className="mt-2 text-2xl font-light text-white uppercase tracking-[0.18em]">
                        {phase.name}
                    </h2>
                    <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                        Unit {unit.id}: <em className="text-imperium-gold/80">{unit.title}</em> lives
                        beyond Phase I. Subscribe to enter the immersive walkthrough.
                    </p>
                    <a
                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.2em] uppercase rounded-full hover:bg-white transition-all"
                    >
                        Subscribe — $20/month
                    </a>
                    <div className="mt-6">
                        <Link
                            href="/28principles"
                            className="text-xs text-gray-500 hover:text-imperium-gold transition-colors"
                        >
                            ← Back to the doctrine
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const goNext = () => {
        if (!completed) markUnit(unit.id, true);
        if (next) router.push(`/28principles/${next.slug}`);
        else router.push(`/28principles`);
    };

    return (
        <div className="relative min-h-screen bg-[#050507] text-white overflow-x-hidden">
            {/* Reading progress bar — top of viewport */}
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.04] z-50">
                <div
                    className="h-full bg-gradient-to-r from-imperium-gold to-imperium-gold/60 transition-all duration-150"
                    style={{ width: `${readingProgress}%` }}
                />
            </div>

            {/* Ambient backdrop */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] bg-imperium-gold/[0.07] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-imperium-gold/[0.04] rounded-full blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            </div>

            {/* Quote hero — full viewport */}
            <section
                className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-6 text-center"
                aria-labelledby="unit-quote"
            >
                <div className="mb-6 inline-flex items-center gap-3 px-4 py-1 border border-imperium-gold/30 rounded-full bg-imperium-gold/5">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-imperium-gold uppercase">
                        Phase {phase.roman} · {phase.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-imperium-gold/50" />
                    <span className="text-[10px] font-bold tracking-[0.25em] text-imperium-gold uppercase">
                        Unit {unit.id} of {TOTAL_UNITS}
                    </span>
                </div>

                <p className="text-[10px] sm:text-xs font-bold tracking-[0.4em] text-gray-500 uppercase mb-4">
                    Memorize · Repeat · Embody
                </p>

                <h1
                    id="unit-quote"
                    className="max-w-4xl mx-auto text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] text-imperium-gold"
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic",
                        animation: "quoteIn 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
                        opacity: 0,
                    }}
                >
                    “{unit.quote}”
                </h1>

                {unit.invocation && (
                    <p
                        className="mt-8 max-w-xl text-sm sm:text-base text-gray-400 font-light leading-relaxed"
                        style={{
                            animation: "fadeUp 1.4s ease-out 0.5s forwards",
                            opacity: 0,
                        }}
                    >
                        {unit.invocation}
                    </p>
                )}

                <h2 className="mt-12 text-base sm:text-lg font-light text-white/70 uppercase tracking-[0.4em]">
                    {unit.title}
                </h2>

                <button
                    type="button"
                    onClick={() => {
                        setEntered(true);
                        setTimeout(() => {
                            const el = document.getElementById("chapters");
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 30);
                    }}
                    className="mt-12 inline-flex items-center gap-3 px-8 py-4 border border-imperium-gold/40 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase text-imperium-gold hover:bg-imperium-gold hover:text-[#030712] transition-all duration-500 group"
                >
                    <span>Enter the Unit</span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                </button>

                {/* Subtle scroll cue */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600">
                    <div className="w-[1px] h-12 bg-gradient-to-b from-imperium-gold/40 to-transparent mx-auto animate-pulse" />
                </div>
            </section>

            {/* Chapters / sub-points */}
            <section
                id="chapters"
                className="relative z-10 max-w-3xl mx-auto px-6 py-24 sm:py-32"
                aria-label="Unit chapters"
            >
                <div className="mb-12 text-center">
                    <span className="text-[10px] font-bold tracking-[0.4em] text-imperium-gold/80 uppercase">
                        The Chapters
                    </span>
                    <p className="mt-3 text-sm text-gray-500 italic font-light max-w-md mx-auto">
                        Move through each one. Mark what you have absorbed. Return when you have lived it.
                    </p>
                </div>

                <ChapterChecklist
                    items={unit.subPoints}
                    unitId={unit.id}
                    state={state}
                    onToggle={(path) => toggleSubPoint(unit.id, path)}
                />

                {/* Mark-complete ritual gate */}
                <div className="mt-20 pt-10 border-t border-imperium-gold/15 text-center">
                    <p className="text-[10px] font-bold tracking-[0.4em] text-gray-500 uppercase mb-5">
                        The Threshold
                    </p>
                    <button
                        type="button"
                        onClick={() => markUnit(unit.id, !completed)}
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase transition-all duration-500 ${
                            completed
                                ? "bg-imperium-gold text-[#030712] hover:bg-white"
                                : "border border-imperium-gold/40 text-imperium-gold hover:bg-imperium-gold/10"
                        }`}
                    >
                        {completed ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Sealed — Walk Through Again
                            </>
                        ) : (
                            <>
                                <Crown className="w-4 h-4" />
                                Mark this Unit Complete
                            </>
                        )}
                    </button>
                    {hydrated && completed && (
                        <p className="mt-4 text-xs text-gray-500 italic">
                            “{unit.quote}” — carry it.
                        </p>
                    )}
                </div>
            </section>

            {/* Prev / Next navigation */}
            <nav
                className="relative z-10 max-w-3xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-4"
                aria-label="Unit navigation"
            >
                {prev ? (
                    <Link
                        href={`/28principles/${prev.slug}`}
                        className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-imperium-gold/70 group-hover:-translate-x-1 transition-transform" />
                        <div className="text-left">
                            <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
                                Previous · Unit {prev.id}
                            </p>
                            <p className="text-sm text-white group-hover:text-imperium-gold transition-colors">
                                {prev.title}
                            </p>
                        </div>
                    </Link>
                ) : (
                    <Link
                        href="/28principles"
                        className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-imperium-gold/70 group-hover:-translate-x-1 transition-transform" />
                        <div className="text-left">
                            <p className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase">
                                Index
                            </p>
                            <p className="text-sm text-white group-hover:text-imperium-gold transition-colors">
                                The Doctrine
                            </p>
                        </div>
                    </Link>
                )}

                <button
                    type="button"
                    onClick={goNext}
                    className="group flex items-center justify-end gap-4 p-5 rounded-2xl border border-imperium-gold/30 bg-imperium-gold/[0.05] hover:bg-imperium-gold/[0.12] transition-colors"
                >
                    <div className="text-right">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-imperium-gold/80 uppercase">
                            {next ? `Continue · Unit ${next.id}` : "Return to Doctrine"}
                        </p>
                        <p className="text-sm text-white group-hover:text-imperium-gold transition-colors">
                            {next ? next.title : "Index"}
                        </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-imperium-gold group-hover:translate-x-1 transition-transform" />
                </button>
            </nav>

            <div className="relative z-10 pb-12 text-center">
                <Link
                    href="/28principles"
                    className="text-xs text-gray-500 hover:text-imperium-gold transition-colors uppercase tracking-[0.3em]"
                >
                    ← Back to the 28
                </Link>
            </div>

            <style jsx global>{`
                @keyframes quoteIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.98);
                        letter-spacing: -0.02em;
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                        letter-spacing: 0;
                    }
                }
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes chapterIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            {/* swallow lint warning for `entered` — used to pace future audio cues */}
            <span aria-hidden="true" className="hidden">
                {entered ? "1" : "0"}
            </span>
        </div>
    );
}
