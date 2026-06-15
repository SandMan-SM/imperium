"use client";

import Link from "next/link";
import { Lock, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const PRINCIPLES = [
    { num: "01", title: "The Law of Deliberate Action", desc: "Every move is calculated. The sovereign does not react — he responds from a position of preparation and clarity." },
    { num: "02", title: "The Law of Leverage", desc: "Maximum output from minimum input. Identify the single point of force that moves the entire system." },
    { num: "03", title: "The Law of Identity Precedence", desc: "Behavior flows downstream from identity. Before you change anything external, you must fix what you believe internally." },
    { num: "04", title: "The Law of Strategic Silence", desc: "Power is accumulated in silence. Speak only when your words increase your position — otherwise, observe." },
    { num: "05", title: "The Law of Compounding Discipline", desc: "One act of discipline is nothing. Ten thousand acts of discipline across years become an unstoppable sovereign force." },
    { num: "06", title: "The Law of Controlled Perception", desc: "Control the narrative. Perception is reality. Shape how others see you before they can define you." },
    { num: "07", title: "The Law of Calculated Risk", desc: "Risk is inevitable. Stupidity is optional. Every gamble must serve a strategic purpose." },
    { num: "08", title: "The Law of Resource Allocation", desc: "Time, energy, attention — these are your currency. Spend them like a sovereign, not a beggar." },
    { num: "09", title: "The Law of Adaptive Strategy", desc: "Plans fail. Principles endure. Adapt your tactics while never compromising your core objectives." },
    { num: "10", title: "The Law of Selective Alliances", desc: "Not all relationships are equal. Build alliances that compound your power, not drain it." },
    { num: "11", title: "The Law of Information Dominance", desc: "Knowledge is power. Control the flow of information and you control the battlefield." },
    { num: "12", title: "The Law of Psychological Warfare", desc: "Break their will before you break their walls. The mind is the first territory to conquer." },
    { num: "13", title: "The Law of Controlled Emotion", desc: "Emotion is a weapon. Master it, or be mastered by it. Never let passion override purpose." },
    { num: "14", title: "The Law of Strategic Patience", desc: "Rome wasn't built in a day, but it was destroyed in one. Timing is everything." },
    { num: "15", title: "The Law of Decisive Action", desc: "Indecision is the enemy of progress. When the moment comes, strike with absolute certainty." },
    { num: "16", title: "The Law of Continuous Learning", desc: "The world evolves. Adapt or become obsolete. Mastery is a journey, not a destination." },
    { num: "17", title: "The Law of Personal Brand", desc: "Your reputation is your most valuable asset. Protect it fiercely, build it strategically." },
    { num: "18", title: "The Law of Financial Sovereignty", desc: "Money is freedom. Control your finances or be controlled by those who do." },
    { num: "19", title: "The Law of Health as Foundation", desc: "A weak body houses a weak mind. Physical strength is the foundation of all power." },
    { num: "20", title: "The Law of Network Effects", desc: "Your network is your net worth. Build connections that multiply your influence." },
    { num: "21", title: "The Law of Legacy Building", desc: "Build for the long game. What you create should outlive you." },
    { num: "22", title: "The Law of Crisis Management", desc: "Chaos is inevitable. Prepare for it, plan for it, use it to your advantage." },
    { num: "23", title: "The Law of Innovation", desc: "Complacency kills empires. Always seek the next evolution, the next breakthrough." },
    { num: "24", title: "The Law of Accountability", desc: "Own your failures as much as your successes. Responsibility builds character and trust." },
    { num: "25", title: "The Law of Strategic Delegation", desc: "You cannot do everything. Delegate wisely, but maintain ultimate control." },
    { num: "26", title: "The Law of Measured Ambition", desc: "Dream big, but act smart. Ambition without strategy is self-destruction." },
    { num: "27", title: "The Law of Cultural Influence", desc: "Shape the culture around you. Culture eats strategy for breakfast." },
    { num: "28", title: "The Law of Ultimate Freedom", desc: "True power is the freedom to choose your path. Everything else is just a means to that end." },
];

export function PrinciplesTeaser() {
    const { profile, loading } = useAuth();

    // Determine access level based on subscription
    const getAccessLevel = () => {
        if (loading) return 'loading';
        if (!profile) return 'public';
        if (profile.is_premium || profile.subscription_status === 'active') {
            return 'premium';
        }
        return 'subscriber';
    };

    const accessLevel = getAccessLevel();

    const getPrincipleAccess = (index: number) => {
        if (accessLevel === 'premium') return 'full';
        if (accessLevel === 'subscriber') {
            if (index < 10) return 'full'; // 0-9 = principles 1-10
            if (index < 20) return 'preview'; // 10-19 = principles 11-20
            return 'locked'; // 20-27 = principles 21-28
        }
        if (accessLevel === 'public') {
            if (index < 5) return 'full'; // 0-4 = principles 1-5
            return 'locked'; // 5-27 = principles 6-28
        }
        return 'locked';
    };

    return (
        <section className="py-24 bg-imperium-bg relative overflow-hidden border-t border-imperium-border">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-imperium-gold/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 border border-imperium-gold/20 rounded-full bg-imperium-gold/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-imperium-gold uppercase">The Complete Doctrine</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl text-white tracking-[0.08em] uppercase mb-4">
                        The <span className="text-imperium-gold font-bold" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>28 Principles</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto font-light">
                        The complete Imperium operating system. Laws forged from the study of history's most formidable minds.
                    </p>
                </div>

                <div className="space-y-4 px-2 sm:px-0">
                    {PRINCIPLES.slice(0, 5).map((p, index) => (
                        <div
                            key={p.num}
                            className="group relative grid grid-cols-12 gap-4 sm:gap-6 items-start rounded-xl border border-imperium-border bg-imperium-surface hover:border-imperium-gold/40 hover:bg-imperium-card transition-all duration-500 hover:scale-[1.02] shadow-imperium"
                            style={{
                                animationDelay: `${index * 0.05}s`,
                                animation: `fadeInUp 0.6s ease-out forwards`,
                                opacity: 0,
                                transform: 'translateY(20px)'
                            }}
                        >
                            {/* Large Number Badge - takes up first part of the bar */}
                            <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 text-imperium-gold group-hover:scale-105">
                                    <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider">{p.num}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="col-span-9 sm:col-span-10 py-4 pr-4">
                                <h2 className="text-base sm:text-lg font-semibold tracking-wide text-white group-hover:text-imperium-gold transition-colors">
                                    {p.title}
                                </h2>
                                <p className="text-sm sm:text-base leading-relaxed text-gray-300 group-hover:text-gray-200 transition-colors">
                                    {p.desc}
                                </p>
                            </div>
                        </div>
                    ))}
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