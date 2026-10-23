"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { STRIPE_CHECKOUT_URL } from "@/lib/brand";

const BENEFITS = [
    "Daily strategic intelligence brief delivered to your inbox",
    "Full access to all 28 Principles of the Imperium doctrine",
    "Inner Circle network of sovereign-minded operators",
    "Tactical breakdowns of business, finance, and self-mastery",
    "Cancel anytime — zero risk, maximum return",
];

export function FeaturedProduct() {
    return (
        <section className="py-16 sm:py-20 relative overflow-hidden px-3 sm:px-4 md:px-8">
            <div className="container mx-auto max-w-6xl">
                {/* Large Glass Product Card Container */}
                <div className="glass-card rounded-2xl sm:rounded-[3rem] p-4 sm:p-6 md:p-16 lg:p-20 relative overflow-hidden border border-white/[0.08] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-imperium-gold/[0.05] to-transparent pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        {/* Left: Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="text-left flex flex-col items-start"
                        >
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6 md:mb-8 border border-imperium-gold/25 rounded-full bg-imperium-gold/8">
                                <span className="w-1.5 h-1.5 rounded-full gradient-gold animate-pulse" />
                                <span className="text-[7px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] text-gradient-gold uppercase whitespace-nowrap">The Core Directive</span>
                            </div>

                            <h2 className="text-[clamp(1.7rem,9vw,4rem)] md:text-6xl text-white uppercase tracking-[0.05em] mb-3 sm:mb-4 leading-none font-light">
                                Transform<br />
                                Your <span className="text-gradient-gold font-serif italic">Life.</span>
                            </h2>
                            <div
                                className="text-[clamp(1.15rem,5.4vw,2.5rem)] md:text-4xl mb-4 sm:mb-6 md:mb-8 leading-tight opacity-90 font-light tracking-wide font-serif italic text-gradient-gold"
                            >
                                For $20 a month.
                            </div>

                            <p className="text-white/40 font-light leading-relaxed mb-5 sm:mb-8 md:mb-10 max-w-xl text-[11px] sm:text-sm md:text-base">
                                The Imperium Elite Mastermind is a high-performance architecture for the modern sovereign. Raw strategic intellect, translated into executable daily frameworks.
                            </p>

                            <ul className="space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-10 md:mb-12">
                                {BENEFITS.map((b, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                                        className="flex items-start gap-2 sm:gap-4 text-[10px] sm:text-sm text-white/50"
                                    >
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-imperium-gold" />
                                        </div>
                                        <span className="leading-snug">{b}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="flex flex-col items-center gap-2 sm:gap-4 mx-auto sm:mx-0">
                                <a
                                    href={STRIPE_CHECKOUT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 sm:gap-4 px-5 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-white text-black font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[8px] sm:text-[10px] md:text-xs rounded-full transition-all hover:bg-imperium-gold hover:scale-105 shadow-xl"
                                >
                                    <span>Initiate Uplink</span>
                                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                                </a>

                                <div className="text-[7px] sm:text-[9px] text-white/20 uppercase tracking-[0.24em] sm:tracking-[0.3em] font-bold text-center">
                                    No Contracts<br />Absolute ROI
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
