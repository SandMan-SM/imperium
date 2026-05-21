"use client";

import { AnimatedCount, Reveal } from "@/components/fx";

// Stats strip rendered between PrinciplesTeaser and Testimonials.
// Animated count-up on viewport enter for each number.
export default function HomeStatsStrip() {
    return (
        <section className="relative py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                <Reveal>
                    <p className="text-center text-imperium-gold/70 text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase mb-10">
                        The Network · Live
                    </p>
                </Reveal>

                <div className="grid grid-cols-3 gap-6 sm:gap-10">
                    <StatTile label="Units" to={28} />
                    <StatTile label="Phases" to={5} />
                    <StatTile label="Operators" to={2400} suffix="+" />
                </div>
            </div>
        </section>
    );
}

function StatTile({ label, to, suffix }: { label: string; to: number; suffix?: string }) {
    return (
        <Reveal>
            <div className="text-center">
                <div
                    className="text-4xl sm:text-5xl md:text-6xl font-light text-imperium-gold leading-none"
                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                    <AnimatedCount to={to} suffix={suffix} />
                </div>
                <p className="mt-3 text-white/45 text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase">
                    {label}
                </p>
            </div>
        </Reveal>
    );
}
