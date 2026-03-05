"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";

const PRINCIPLES_PREVIEW = [
    { num: "01", title: "The Law of Deliberate Action", desc: "Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity." },
    { num: "02", title: "The Law of Leverage", desc: "Maximum output from minimum input. Identify the single point of force that moves the entire system." },
    { num: "03", title: "The Law of Identity Precedence", desc: "Behavior flows downstream from identity. Before you change anything external, you must fix what you believe internally." },
    { num: "04", title: "The Law of Strategic Silence", desc: "Power is accumulated in silence. Speak only when your words increase your position — otherwise, observe." },
    { num: "05", title: "The Law of Compounding Discipline", desc: "One act of discipline is nothing. Ten thousand acts of discipline across years become an unstoppable sovereign force." },
];

export function PrinciplesTeaser() {
    return (
        <section className="py-24 bg-imperium-bg relative overflow-hidden border-t border-imperium-border">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-imperium-gold/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-imperium-gold uppercase">The Doctrine</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl text-white tracking-[0.08em] uppercase mb-4">
                        The <span className="text-imperium-gold font-bold" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>28 Principles</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto font-light">
                        The complete Imperium operating system. Laws forged from the study of history's most formidable minds.
                    </p>
                </motion.div>

                <div className="space-y-3">
                    {PRINCIPLES_PREVIEW.map((p, i) => (
                        <motion.div
                            key={p.num}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group flex gap-6 items-start bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 hover:border-imperium-gold/25 hover:bg-white/[0.04] transition-all duration-500"
                        >
                            <span className="text-3xl font-bold text-imperium-gold/30 group-hover:text-imperium-gold/60 transition-colors font-mono leading-none pt-1 flex-shrink-0 w-12">{p.num}</span>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-2 tracking-wide group-hover:text-imperium-gold transition-colors duration-300">{p.title}</h3>
                                <p className="text-sm text-gray-500 font-light leading-relaxed">{p.desc}</p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Locked teaser items */}
                    {[...Array(3)].map((_, i) => (
                        <div key={`locked-${i}`} className="relative flex gap-6 items-start bg-white/[0.01] border border-white/[0.04] rounded-xl p-6 overflow-hidden">
                            <div className="absolute inset-0 backdrop-blur-[2px] bg-imperium-bg/60 flex items-center justify-center z-10">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Subscribe to Unlock</span>
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-gray-800 font-mono leading-none pt-1 flex-shrink-0 w-12">0{i + 6}</span>
                            <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-2">Classified Principle</h3>
                                <p className="text-sm text-gray-700 leading-relaxed">This principle is locked behind the Imperium Elite subscription.</p>
                            </div>
                        </div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a
                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative px-10 py-4 bg-gradient-to-br from-imperium-gold to-[#b38f2d] text-black font-bold uppercase tracking-[0.2em] text-sm rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative">Unlock All 28 — $20/month</span>
                    </a>
                    <Link
                        href="/28principles"
                        className="text-sm text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-wider underline underline-offset-4"
                    >
                        View Full List →
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
