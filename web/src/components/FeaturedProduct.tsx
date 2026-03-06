"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center relative z-10">
                        {/* Left: Copy */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="order-1"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 md:mb-8 border border-imperium-gold/25 rounded-full bg-imperium-gold/8">
                                <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.25em] text-imperium-gold uppercase">The Core Directive</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl text-white uppercase tracking-[0.05em] mb-4 leading-none font-light">
                                Transform<br />
                                Your <span className="text-gold-gradient font-display italic">Life.</span>
                            </h2>
                            <div
                                className="text-2xl md:text-4xl mb-6 md:mb-8 leading-tight opacity-90 font-light tracking-wide"
                                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#d4af37" }}
                            >
                                For $20 a month.
                            </div>

                            <p className="text-white/40 font-light leading-relaxed mb-8 md:mb-10 max-w-md text-sm md:text-base">
                                The Imperium Elite Mastermind is a high-performance architecture for the modern sovereign. Raw strategic intellect, translated into executable daily frameworks.
                            </p>

                            <ul className="space-y-3 md:space-y-4 mb-10 md:mb-12">
                                {BENEFITS.map((b, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                                        className="flex items-start gap-4 text-sm text-white/50"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-imperium-gold" />
                                        </div>
                                        <span className="leading-snug">{b}</span>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <a
                                    href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-4 px-10 md:px-12 py-4 md:py-5 bg-white text-black font-bold uppercase tracking-[0.25em] text-[10px] md:text-xs rounded-full transition-all hover:bg-imperium-gold hover:scale-105 shadow-xl"
                                >
                                    <span>Initiate Uplink</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </a>
                                <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold text-center sm:text-left">
                                    No Contracts<br />Absolute ROI
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Visual card (CLEAN, NO GLASS) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative lg:pl-10 order-2 lg:order-2 mt-8 lg:mt-0"
                        >
                            <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden bg-black border border-white/5 p-6 sm:p-8 md:p-14 shadow-2xl">
                                <div className="text-center mb-6 sm:mb-8 md:mb-12">
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white uppercase tracking-[0.35em] mb-2 sm:mb-3">Imperium Elite</h3>
                                    <p className="text-[9px] sm:text-[9px] md:text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">Credential Protocol</p>
                                </div>

                                <div className="text-center mb-6 sm:mb-8 md:mb-12">
                                    <div className="text-5xl sm:text-6xl md:text-8xl font-light text-white leading-none tracking-tighter">$20</div>
                                    <div className="text-white/10 text-[7px] sm:text-[8px] md:text-[9px] mt-2 sm:mt-4 uppercase tracking-[0.35em] font-bold">Standard Monthly Tribute</div>
                                </div>

                                <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-8 md:mb-10">
                                    {BENEFITS.slice(0, 4).map((b, i) => (
                                        <div key={i} className="flex items-center gap-4 text-xs text-white/40 py-4 border-b border-white/5 last:border-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                            <span className="tracking-wide">{b}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Global Access Active</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
