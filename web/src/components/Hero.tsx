"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Hero() {
    return (
        <section className="relative w-full min-h-screen flex items-start md:items-center justify-center overflow-hidden texture-grain">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/banner.jpg')" }}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-black/65" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-imperium-bg/40 to-imperium-bg" />
            {/* Gold atmosphere glow behind the headline */}
            <div
                aria-hidden
                className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[140vw] sm:w-[60rem] h-[24rem] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at center, rgba(240,200,90,0.12), transparent 65%)" }}
            />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-[84px] sm:pt-[84px] md:pt-0 flex flex-col items-center text-center max-w-4xl">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 bg-imperium-gold/5 rounded-full"
                >
                    <span className="w-1.5 h-1.5 rounded-full gradient-gold animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-gradient-gold">Daily Intelligence · Inner Circle</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="font-light text-white leading-[1.08] tracking-tight mb-6 md:mb-8 text-[clamp(2rem,8.25vw,7.5rem)]"
                >
                    <span className="block whitespace-nowrap">
                        Build the Mind. <em className="font-serif italic text-gradient-gold">Command</em>
                    </span>
                    <span className="block mx-auto whitespace-nowrap min-w-[14.5rem] sm:min-w-[22rem]">the Future.</span>
                </motion.h1>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="flex items-center justify-center mx-auto"
                >
                    <Link
                        href="/mission-statement"
                        className="px-5 sm:px-6 py-3.5 sm:py-4 border border-imperium-gold/35 bg-imperium-gold/[0.06] text-gradient-gold text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase rounded-full hover:border-imperium-gold/70 hover:bg-imperium-gold/[0.12] hover:scale-105 transition-all duration-200 text-center whitespace-nowrap inline-block shadow-[0_10px_34px_rgba(240,200,90,0.12)]"
                    >
                        Mission Statement
                    </Link>
                </motion.div>

                {/* Stat strip (mirrors the Testimonials stat strip) */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="container mx-auto px-4 max-w-4xl mt-6 z-10"
                >
                    <div className="relative grid grid-cols-3 overflow-hidden">
                        {[
                            { value: "∞", label: "ROI" },
                            { value: BRAND.subscriberCount, label: "Subscribers" },
                            { value: "98%", label: "Efficiency" },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="relative px-2 sm:px-6 py-5 sm:py-8 text-center group"
                            >
                                {i > 0 && <div className="absolute left-0 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />}
                                <div className="flex items-center justify-center h-10 sm:h-14 md:h-16 mb-1 sm:mb-2">
                                    {stat.value === '∞' ? (
                                        <div className="text-4xl sm:text-5xl md:text-6xl font-normal text-gradient-gold transition-transform duration-300 group-hover:scale-105 leading-none">∞</div>
                                    ) : (
                                        <div className="text-xl sm:text-3xl md:text-5xl font-bold text-gradient-gold leading-none">
                                            {stat.value}
                                        </div>
                                    )}
                                </div>
                                <div className="text-[8px] sm:text-[10px] text-white/35 uppercase tracking-[0.16em] sm:tracking-[0.22em] font-bold">
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
