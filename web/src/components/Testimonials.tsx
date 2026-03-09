"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Testimonial = {
    id: number;
    name: string;
    handle: string;
    quote: string;
    rating: number;
};

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Marcus T.",
        handle: "@marcus_builds",
        quote: "The $20 subscription is the single best financial decision I've made this year. The daily intelligence briefs completely rewired how I think about strategic decision-making.",
        rating: 5,
    },
    {
        id: 2,
        name: "Jordan K.",
        handle: "@jkings_way",
        quote: "I've read every self-improvement book ever written. Imperium cuts through all the noise. This is what actual discipline looks like — precision, not motivation.",
        rating: 5,
    },
    {
        id: 3,
        name: "Devon W.",
        handle: "@devonwrites",
        quote: "Three months in. Revenue is up 40%. My focus is sharper than it's ever been. Imperium gave me a framework that actually sticks because it treats you like an adult.",
        rating: 5,
    },
    {
        id: 4,
        name: "Chris M.",
        handle: "@realmaven",
        quote: "Every single newsletter lands like a tactical drop. Actionable. No fluff. I've shared it with my entire executive team. Non-negotiable for anyone serious about performance.",
        rating: 5,
    },
    {
        id: 5,
        name: "Alexis R.",
        handle: "@alx_ascends",
        quote: "The principles here aren't 'new.' They're timeless truths executed with surgical precision. I've read each brief at least three times. That's how dense the value is.",
        rating: 5,
    },
    {
        id: 6,
        name: "Nathan S.",
        handle: "@nathanstrides",
        quote: "I cancelled three other subscriptions after joining Imperium. This is the only one that actually moves the needle. Compounding intellect is a real thing — I now have proof.",
        rating: 5,
    },
    {
        id: 7,
        name: "Omar B.",
        handle: "@omarbeyond",
        quote: "Joined skeptical. Stayed because the ROI is undeniable. The strategic frameworks apply to fitness, finance, relationships — this is a complete operating system for serious people.",
        rating: 5,
    },
    {
        id: 8,
        name: "Tyler F.",
        handle: "@tylerf_zero",
        quote: "Most 'content' on the internet is noise disguised as signal. Imperium is pure signal. I wake up to read the brief before anything else. It's become a non-negotiable ritual.",
        rating: 5,
    },
];

// Duplicate for seamless infinite loop
const ROW_1 = [...TESTIMONIALS.slice(0, 4), ...TESTIMONIALS.slice(0, 4)];
const ROW_2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(4)];

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-1 mb-4">
            {Array.from({ length: count }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-imperium-gold fill-imperium-gold" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function TestimonialCard({ t }: { t: Testimonial }) {
    return (
        <div className="relative flex-shrink-0 w-80 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 backdrop-blur-md hover:border-imperium-gold/20 hover:bg-white/[0.05] transition-all duration-500 group">
            {/* Gold gradient top accent */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-imperium-gold/40 to-transparent" />

            {/* Quote mark */}
            <div className="absolute top-4 right-5 text-imperium-gold/[0.12] text-6xl font-serif leading-none select-none">"</div>

            <StarRating count={t.rating} />

            <p className="text-sm text-gray-300 font-light leading-relaxed mb-6 line-clamp-4 group-hover:text-white transition-colors duration-300">
                "{t.quote}"
            </p>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/[0.06]">
                {/* Avatar placeholder with initials */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-imperium-gold/30 to-imperium-gold/5 border border-imperium-gold/20 flex items-center justify-center text-xs font-bold text-imperium-gold flex-shrink-0">
                    {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                    <p className="text-sm font-semibold text-white leading-tight">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.handle}</p>
                </div>
            </div>
        </div>
    );
}

function MarqueeRow({ cards, reverse = false }: { cards: Testimonial[]; reverse?: boolean }) {
    return (
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
                className="flex gap-5 pr-5"
                animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
                transition={{
                    duration: 35,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {cards.map((t, i) => (
                    <TestimonialCard key={`${t.id}-${i}`} t={t} />
                ))}
            </motion.div>
        </div>
    );
}

export function Testimonials() {
    return (
        <section className="relative py-16 sm:py-24 overflow-hidden border-t border-imperium-border">
            {/* Radial background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-imperium-gold/[0.04] rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl mb-12 sm:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-1 mb-4 sm:mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-imperium-gold uppercase">Live Intelligence Network</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[0.08em] text-white uppercase mb-3 sm:mb-4 px-2 sm:px-0">
                        Proof of <span className="text-imperium-gold font-bold">Concept</span>
                    </h2>
                    <p className="text-gray-400 font-light max-w-lg mx-auto text-sm sm:text-base px-4 sm:px-0">
                        Results don't lie. These are the people who made the decision.
                    </p>
                </motion.div>
            </div>

            {/* Dual marquee rows */}
            <div className="space-y-5">
                <MarqueeRow cards={ROW_1} />
                <MarqueeRow cards={ROW_2} reverse />
            </div>

            {/* Stat strip removed (moved to Hero) */}
        </section>
    );
}
