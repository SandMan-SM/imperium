"use client";

import { motion, useReducedMotion } from "framer-motion";

// Text-only horizontal marquee. Repeating words separated by a divider
// (default: middle dot). Lives between page sections for momentum.
// Honors prefers-reduced-motion → static row, no scroll.
export default function MarqueeStrip({
    words,
    divider = "·",
    duration = 40,
    reverse = false,
    className = "",
}: {
    words: string[];
    divider?: string;
    duration?: number;
    reverse?: boolean;
    className?: string;
}) {
    const reduce = useReducedMotion();

    // Triple the array so the loop is seamless at any viewport width
    const tripled = [...words, ...words, ...words];

    return (
        <div
            className={`relative overflow-hidden border-y border-imperium-gold/15 bg-black/40 backdrop-blur-sm ${className}`}
            aria-hidden="true"
        >
            <div className="absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#030712] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#030712] to-transparent pointer-events-none" />

            <motion.div
                className="flex gap-6 py-3 whitespace-nowrap"
                animate={reduce ? undefined : { x: reverse ? ["0%", "-33.33%"] : ["0%", "-33.33%"] }}
                transition={reduce ? undefined : { duration, ease: "linear", repeat: Infinity }}
                style={reverse ? { transform: "scaleX(-1)" } : undefined}
            >
                {tripled.map((w, i) => (
                    <span
                        key={i}
                        className="flex items-center gap-6 text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase text-imperium-gold/60"
                    >
                        <span style={reverse ? { transform: "scaleX(-1)" } : undefined}>{w}</span>
                        <span className="text-imperium-gold/30">{divider}</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
