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
                    className="flex flex-col sm:flex-row gap-4 sm:gap-4 items-center justify-center mx-auto"
                >
                    <a
                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 sm:px-6 py-4 sm:py-4 bg-white text-[#030712] text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-200 text-center whitespace-nowrap inline-block"
                    >
                        Join for $20 / month
                    </a>
                    <Link
                        href="/shop"
                        className="px-3 sm:px-5 py-3 sm:py-4 border border-white/20 text-white/60 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase rounded-full hover:border-white/40 hover:text-white transition-all duration-200 text-center whitespace-nowrap inline-block"
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

                {/* Stat strip (mirrors the Testimonials stat strip) */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="container mx-auto px-4 max-w-4xl mt-6 z-10"
                >
                    <div className="grid grid-cols-3 gap-1 sm:gap-px bg-imperium-border rounded-xl sm:rounded-2xl overflow-hidden">
                        {[
                            { value: "∞", label: "ROI" },
                            { value: "2,800+", label: "Subscribers" },
                            { value: "98%", label: "Efficiency" },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white/5 backdrop-blur-sm border border-white/[0.04] px-1 sm:px-6 py-4 sm:py-8 text-center group hover:bg-white/10 transition-colors duration-300"
                            >
                                <div className="flex items-center justify-center h-10 sm:h-16 md:h-20 mb-0 sm:mb-1">
                                    {stat.value === '∞' ? (
                                        <div className="text-3xl sm:text-5xl md:text-7xl font-normal text-white group-hover:text-imperium-gold transition-colors duration-300 leading-none">∞</div>
                                    ) : (
                                        <div className="text-lg sm:text-2xl md:text-4xl font-bold text-white group-hover:text-imperium-gold transition-colors duration-300 leading-none">
                                            {stat.value}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.15em] font-bold mt-0 sm:mt-1">
                                    {stat.label === 'ROI' ? 'LIFETIME ROI' : stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">Scroll</span>
                {/* down arrow (animated) */}
                {/* three chevrons (like ">") stacked and animated sequentially like jets taking off */}
                <motion.svg
                    className="w-5 h-[30px] text-white/40 overflow-visible"
                    viewBox="0 0 24 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* three chevrons placed vertically and animated downward smoothly */}
                    <motion.path
                        d="M6 4 L12 10 L18 4"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: 18, opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4, delay: 0 }}
                    />

                    <motion.path
                        d="M6 9 L12 15 L18 9"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: 18, opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4, delay: 0.22 }}
                    />

                    <motion.path
                        d="M6 14 L12 20 L18 14"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ y: 18, opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.4, delay: 0.44 }}
                    />
                </motion.svg>
            </div>
        </section>
    );
}
