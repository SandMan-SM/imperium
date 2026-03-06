"use client";

import { motion } from "framer-motion";
import { Zap, BookOpen, Users } from "lucide-react";

const PILLARS = [
    {
        icon: Zap,
        label: "Core Offering",
        title: "Daily Intelligence",
        description: "A precision briefing delivered every morning. Strategic insights, tactical breakdowns, and actionable principles — curated exclusively for those who operate at the highest level.",
    },
    {
        icon: BookOpen,
        label: "The Framework",
        title: "The 28 Principles",
        description: "The complete Imperium doctrine. A structured operating system for the mind — covering discipline, leverage, strategy, and self-mastery distilled into 28 executable laws.",
    },
    {
        icon: Users,
        label: "Exclusive Network",
        title: "Inner Circle",
        description: "Join a network of elite subscribers operating across business, finance, and personal development. The intelligence you receive is shaped by those already at the highest tier.",
    },
];

export function WhyImperium() {
    return (
        <section className="py-16 sm:py-20 bg-imperium-bg relative overflow-hidden px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-4 sm:mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-imperium-gold uppercase">System Architecture</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl text-white tracking-[0.08em] uppercase mb-3 sm:mb-4">
                        Why <span className="text-imperium-gold font-bold" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>Imperium?</span>
                    </h2>
                    <p className="text-white/40 max-w-xl mx-auto font-light text-sm sm:text-base px-2 sm:px-0">
                        A uncompromising approach to personal sovereignty and strategic intelligence.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    {PILLARS.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: i * 0.12 }}
                                className="glass-card rounded-2xl p-8 flex flex-col relative overflow-hidden group hover:border-imperium-gold/20 transition-all duration-400"
                            >

                                <div className="w-10 h-10 rounded-xl bg-imperium-gold/8 border border-imperium-gold/15 flex items-center justify-center mb-6 group-hover:bg-imperium-gold/15 transition-colors">
                                    <Icon className="w-4.5 h-4.5 text-imperium-gold" size={18} />
                                </div>

                                <span className="text-[10px] font-bold tracking-widest uppercase text-imperium-gold/60 mb-2">{p.label}</span>
                                <h3 className="text-base font-semibold text-white mb-3">{p.title}</h3>
                                <p className="text-sm text-white/40 font-light leading-relaxed">{p.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
