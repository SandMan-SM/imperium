"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CURRICULUM, FREE_PHASE_ID, TIME_WORKS_BACKWARDS, TOTAL_UNITS } from "@/lib/curriculum";

export function PrinciplesTeaser() {
    const { profile } = useAuth();
    const isPremium = !!(profile?.is_premium || profile?.subscription_status === "active");

    // Show the first 5 real units across Phase I and the start of Phase II as the teaser.
    const flat = CURRICULUM.flatMap((p) => p.units.map((u) => ({ phaseId: p.id, unit: u })));
    const teaser = flat.slice(0, 5);

    return (
        <section className="py-24 bg-imperium-bg relative overflow-hidden border-t border-imperium-border">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-imperium-gold/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-imperium-gold uppercase">
                            The Complete Doctrine
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl text-white tracking-[0.08em] uppercase mb-4">
                        The{" "}
                        <span
                            className="text-imperium-gold font-bold"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                        >
                            28 Principles
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto font-light">
                        {TOTAL_UNITS} immersive units across 5 phases. Click any unit to enter.
                    </p>
                </div>

                {/* Time Works Backwards — meta-principle teaser */}
                <div className="mb-12 max-w-3xl mx-auto text-center px-2">
                    <p className="text-[10px] font-bold tracking-[0.4em] text-imperium-gold/80 uppercase">
                        The Foundation
                    </p>
                    <h3 className="mt-2 text-base sm:text-lg font-light text-white uppercase tracking-[0.18em]">
                        {TIME_WORKS_BACKWARDS.name}
                    </h3>
                    <blockquote
                        className="mt-4 text-imperium-gold leading-tight text-2xl sm:text-3xl md:text-4xl"
                        style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                    >
                        “{TIME_WORKS_BACKWARDS.quote}”
                    </blockquote>
                </div>

                {/* Real unit teasers — first 5 units, all click into the immersive routes */}
                <div className="space-y-4 px-2 sm:px-0">
                    {teaser.map(({ phaseId, unit }, index) => {
                        const locked = !isPremium && phaseId !== FREE_PHASE_ID;
                        const num = unit.id.toString().padStart(2, "0");

                        const inner = (
                            <>
                                <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                    <div
                                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                            locked
                                                ? "text-gray-600"
                                                : "text-imperium-gold group-hover:scale-105"
                                        }`}
                                    >
                                        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider">
                                            {num}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-9 sm:col-span-10 py-4 pr-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3
                                            className={`text-base sm:text-lg font-semibold tracking-wide transition-colors ${
                                                locked
                                                    ? "text-gray-600"
                                                    : "text-white group-hover:text-imperium-gold"
                                            }`}
                                        >
                                            {unit.title}
                                        </h3>
                                        <p
                                            className={`mt-1 text-xs sm:text-sm italic leading-snug ${
                                                locked ? "text-gray-700" : "text-gray-400"
                                            }`}
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        >
                                            “{unit.quote}”
                                        </p>
                                    </div>
                                    {locked ? (
                                        <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                                    ) : (
                                        <ArrowRight className="w-5 h-5 text-imperium-gold/60 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                                    )}
                                </div>
                            </>
                        );

                        const cardClasses = `group relative grid grid-cols-12 gap-4 sm:gap-6 items-center rounded-xl border transition-all duration-500 shadow-imperium ${
                            locked
                                ? "border-imperium-border bg-imperium-surface/60 cursor-not-allowed"
                                : "border-imperium-border bg-imperium-surface hover:border-imperium-gold/40 hover:bg-imperium-card hover:scale-[1.02] cursor-pointer"
                        }`;

                        const cardStyle: React.CSSProperties = {
                            animationDelay: `${index * 0.05}s`,
                            animation: "fadeInUp 0.6s ease-out forwards",
                            opacity: 0,
                            transform: "translateY(20px)",
                        };

                        return locked ? (
                            <div
                                key={unit.id}
                                className={cardClasses}
                                style={cardStyle}
                                aria-label={`Unit ${unit.id}: ${unit.title} (locked)`}
                                aria-disabled="true"
                            >
                                {inner}
                            </div>
                        ) : (
                            <Link
                                key={unit.id}
                                href={`/28principles/${unit.slug}`}
                                className={cardClasses}
                                style={cardStyle}
                                aria-label={`Unit ${unit.id}: ${unit.title}`}
                            >
                                {inner}
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200 btn-primary"
                    >
                        Join Now — $20/month
                    </a>
                    <Link
                        href="/28principles"
                        className="text-sm text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-wider underline underline-offset-4"
                    >
                        View Full List →
                    </Link>
                </div>
            </div>
        </section>
    );
}
