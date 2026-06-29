import type { Metadata } from "next";
import Link from "next/link";
import { STRIPE_CHECKOUT_URL } from "@/lib/brand";

export const metadata: Metadata = {
    title: "Mission Statement — Imperium Elite",
    description: "The operating doctrine behind Imperium: sovereignty, discipline, strategic intelligence, and execution.",
};

const PRINCIPLES = [
    {
        title: "Sovereignty Before Status",
        body: "Imperium exists for people who refuse to be arranged by noise, trend, or pressure. The first victory is internal command: attention, appetite, fear, impulse, and time brought under deliberate authority.",
    },
    {
        title: "Clarity Over Comfort",
        body: "Comfort asks for reassurance. Clarity asks for truth. We build frameworks that make reality easier to face, decisions easier to make, and excuses harder to defend.",
    },
    {
        title: "Discipline As Freedom",
        body: "Discipline is not restriction. It is the architecture that gives ambition a place to stand. A mind with standards becomes harder to manipulate and easier to trust.",
    },
    {
        title: "Intelligence Into Action",
        body: "Information has no value until it changes behavior. Every brief, principle, and exercise is designed to move from insight to execution without ceremony.",
    },
];

export default function MissionStatementPage() {
    return (
        <main className="min-h-screen bg-imperium-bg text-white overflow-hidden">
            <section className="relative pt-32 pb-20 border-b border-imperium-gold/20 texture-grain">
                <div className="absolute inset-0 bg-[url('/banner.jpg')] bg-cover bg-center opacity-25" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-imperium-bg/85 to-imperium-bg" />
                <div className="absolute left-1/2 top-1/2 h-[26rem] w-[80rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-imperium-gold/[0.08] blur-[120px]" />

                <div className="relative container mx-auto max-w-5xl px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-imperium-gold/25 bg-imperium-gold/5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full gradient-gold" />
                        <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-gradient-gold">Imperium Doctrine</span>
                    </div>

                    <h1 className="whitespace-nowrap text-[clamp(2.05rem,9vw,4.5rem)] font-light tracking-[0.045em] sm:tracking-[0.06em] uppercase leading-tight mb-6">
                        Mission <span className="text-gradient-gold font-serif italic normal-case">Statement</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-white/55 text-base sm:text-lg md:text-xl font-light leading-relaxed">
                        Imperium is a strategic intelligence system for the sovereign operator: the person building a mind that can perceive clearly, choose deliberately, and execute without needing permission from the crowd.
                    </p>
                </div>
            </section>

            <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
                <div className="grid gap-5 md:grid-cols-2">
                    {PRINCIPLES.map((principle) => (
                        <article key={principle.title} className="glass-card card-lift rounded-2xl p-7 border border-white/[0.08]">
                            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gradient-gold mb-4">
                                {principle.title}
                            </h2>
                            <p className="text-white/55 leading-relaxed font-light">
                                {principle.body}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="mt-14 border-y border-imperium-gold/20 py-10">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-light leading-snug text-center">
                        We are not here to decorate ambition. We are here to sharpen it into a system.
                    </p>
                </div>

                <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-light tracking-[0.12em] uppercase mb-4">What We Build</h2>
                        <p className="text-white/50 leading-relaxed font-light">
                            Daily intelligence, mental models, and operational principles for people who want their internal life and external results to obey the same standard: precision. Imperium turns scattered ambition into repeatable judgment.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3">
                        <a
                            href={STRIPE_CHECKOUT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary px-7 py-4 rounded-full text-center text-[11px]"
                        >
                            Sign Up
                        </a>
                        <Link
                            href="/"
                            className="px-7 py-4 rounded-full border border-white/15 text-center text-[11px] font-bold tracking-[0.18em] uppercase text-white/50 hover:text-white hover:border-white/30 transition-colors"
                        >
                            Return Home
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
