"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative w-full min-h-screen flex items-start md:items-center justify-center overflow-hidden">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/banner.jpg')" }}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-black/65" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/40 to-[#030712]" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-[84px] sm:pt-[84px] md:pt-0 flex flex-col items-center text-center max-w-4xl">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-1.5 border border-[#d4af37]/25 rounded-full"
                    style={{ background: "rgba(212,175,55,0.05)" }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#d4af37]">Daily Intelligence · Inner Circle</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-white leading-tight tracking-tight mb-4 md:mb-6"
                >
                    Build the Mind.{" "}
                    <em
                        className="not-italic"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontStyle: "italic",
                            background: "linear-gradient(135deg, #e8c84a, #d4af37, #b38f2d)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Command
                    </em>{" "}
                    the Future.
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xs sm:text-sm md:text-lg text-white/50 font-light max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0"
                >
                    Daily precision frameworks for discipline, strategy, and self-mastery — curated for those who operate at the highest level.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full px-4 sm:px-0"
                >
                    <a
                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-[#030712] text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-200 text-center"
                    >
                        Join for $20 / month
                    </a>
                    <Link
                        href="/shop"
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 border border-white/20 text-white/60 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase rounded-full hover:border-white/40 hover:text-white transition-all duration-200 text-center"
                    >
                        View the Arsenal
                    </Link>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/20"
                >
                    Cancel anytime · No contracts
                </motion.p>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">Scroll</span>
            </div>
        </section>
    );
}
