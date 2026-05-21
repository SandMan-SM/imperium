"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Crown } from "lucide-react";
import PageShareCard from "@/components/PageShareCard";

const REFERRAL_URL = "https://secretimperium.com/tyronengouamo/referral";
const PROFILE_URL = "/tyronengouamo";

const APPLY_MAILTO =
    "mailto:concierge@secretimperium.com?subject=" +
    encodeURIComponent("Inner Circle Application — referred by Tyrone Ngouamo") +
    "&body=" +
    encodeURIComponent(
        [
            "Name:",
            "City / Region:",
            "What you do:",
            "What you want from the Inner Circle:",
            "",
            "Referrer: Tyrone Ngouamo",
        ].join("\n"),
    );

export default function ReferralPageClient() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Hero */}
            <section className="relative border-b border-imperium-gold/20 pt-[84px] pb-16 sm:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />
                <div className="relative container mx-auto px-4 sm:px-6 max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                        <Crown className="w-3.5 h-3.5 text-imperium-gold" />
                        <span className="text-imperium-gold text-[10px] font-bold tracking-[0.3em] uppercase">
                            The Inner Circle · By Referral
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-light text-white leading-tight tracking-tight mb-4">
                        Tyrone{" "}
                        <span
                            className="text-imperium-gold"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                        >
                            sent you.
                        </span>
                    </h1>
                    <p className="text-white/55 font-light text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                        Step into the Imperium Inner Circle. A curated room of operators, builders, mentors,
                        and capital — with a profile of your own and a $25K asset built around your brand.
                    </p>

                    <a
                        href={APPLY_MAILTO}
                        className="inline-flex items-center gap-3 px-7 sm:px-9 py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                    >
                        Apply for Inner Circle
                        <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="mt-4 text-[10px] font-bold tracking-[0.2em] uppercase text-white/25">
                        By referral · Curated tier
                    </p>
                </div>
            </section>

            {/* Four pillars */}
            <section className="py-16 sm:py-24 border-b border-imperium-gold/20">
                <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                    <div className="text-center mb-12">
                        <p className="text-imperium-gold/80 text-[10px] font-bold tracking-[0.4em] uppercase">
                            What You Receive
                        </p>
                        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-[0.04em]">
                            The four{" "}
                            <span
                                className="text-imperium-gold"
                                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                            >
                                pillars
                            </span>
                        </h2>
                    </div>

                    <ul className="space-y-6">
                        <li className="flex gap-4 sm:gap-5 rounded-2xl border border-imperium-gold/20 bg-imperium-surface p-5 sm:p-6">
                            <CheckCircle2 className="w-6 h-6 text-imperium-gold shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-semibold text-base sm:text-lg">
                                    Your own profile on Imperium
                                </p>
                                <p className="mt-1 text-white/50 text-sm sm:text-base font-light leading-relaxed">
                                    Hosted on secretimperium.com, under your name. A landing page that does the
                                    selling for you — for your training, your consulting, your craft. Same
                                    template Tyrone uses.
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4 sm:gap-5 rounded-2xl border border-imperium-gold/20 bg-imperium-surface p-5 sm:p-6">
                            <CheckCircle2 className="w-6 h-6 text-imperium-gold shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-semibold text-base sm:text-lg">
                                    Lifetime access to the network
                                </p>
                                <p className="mt-1 text-white/50 text-sm sm:text-base font-light leading-relaxed">
                                    Permanent membership. Operators, builders, mentors, capital. The door stays
                                    open once you walk through it.
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4 sm:gap-5 rounded-2xl border border-imperium-gold/20 bg-imperium-surface p-5 sm:p-6">
                            <CheckCircle2 className="w-6 h-6 text-imperium-gold shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-semibold text-base sm:text-lg">
                                    A custom $25K digital asset for your brand
                                </p>
                                <p className="mt-1 text-white/50 text-sm sm:text-base font-light leading-relaxed">
                                    Designed and shipped to you. Yours to deploy, sell, or hold. Built around
                                    your business, your personal brand, your edge.
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4 sm:gap-5 rounded-2xl border border-imperium-gold/20 bg-imperium-surface p-5 sm:p-6">
                            <CheckCircle2 className="w-6 h-6 text-imperium-gold shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-semibold text-base sm:text-lg">
                                    Exclusive offers across every Imperium platform
                                </p>
                                <p className="mt-1 text-white/50 text-sm sm:text-base font-light leading-relaxed">
                                    Discounts, early access, partnership lanes — across every brand in the
                                    federation.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Why Imperium */}
            <section className="py-16 sm:py-20 border-b border-imperium-gold/20">
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    <p className="text-imperium-gold/80 text-[10px] font-bold tracking-[0.4em] uppercase mb-4">
                        Why Imperium
                    </p>
                    <p className="text-white/65 font-light text-base sm:text-lg leading-[1.85]">
                        Imperium is an operating system, not a club. The 28 Principles. The Inner Circle. The
                        federation of platforms. Members don&rsquo;t join to network — they join to be permanently
                        equipped with the assets, audience, and discipline that compound for decades.
                    </p>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    <div className="relative rounded-3xl border border-imperium-gold/30 bg-gradient-to-br from-gray-900/80 to-black/80 p-8 sm:p-12 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-imperium-gold/[0.06] rounded-full blur-[80px] pointer-events-none" />
                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl font-light text-white leading-snug mb-3">
                                One application.{" "}
                                <span
                                    className="text-imperium-gold"
                                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                                >
                                    One decision.
                                </span>
                            </h2>
                            <p className="text-white/45 font-light text-sm sm:text-base mb-8 max-w-md mx-auto">
                                Reach out. We review every application within 48 hours.
                            </p>
                            <a
                                href={APPLY_MAILTO}
                                className="inline-flex items-center gap-3 px-7 sm:px-9 py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                            >
                                Apply for Inner Circle
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <p className="mt-4 text-[10px] font-bold tracking-[0.2em] uppercase text-white/25">
                                Referred by Tyrone Ngouamo
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Share */}
            <PageShareCard
                title="Know someone who belongs here?"
                subtitle="Hand them the door. Members are referred — that's the whole point."
                shareUrl={REFERRAL_URL}
                shareText="Apply for the Imperium Inner Circle — by referral."
            />

            {/* Back-link */}
            <div className="border-t border-imperium-gold/20 py-10 text-center">
                <Link
                    href={PROFILE_URL}
                    className="text-sm text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                    <span>← Learn more about Tyrone</span>
                </Link>
            </div>
        </div>
    );
}
