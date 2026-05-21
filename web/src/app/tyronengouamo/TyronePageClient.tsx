"use client";

import Link from "next/link";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Clock,
    Crown,
    Dumbbell,
    Salad,
    Sparkles,
} from "lucide-react";
import NewsletterEmailForm from "@/components/NewsletterEmailForm";
import PageShareCard, { CardShareButton } from "@/components/PageShareCard";

export type ServiceRow = {
    id: string;
    name: string | null;
    description: string | null;
    price: string | number | null;
    image_url: string | null;
    stripe_url: string | null;
    payment_link_url: string | null;
    metadata: Record<string, unknown> | null;
};

const PAGE_URL = "https://secretimperium.com/tyronengouamo";
const REFERRAL_URL = "/tyronengouamo/referral";

// Fallback content used if the Supabase query returns empty (e.g. env not
// configured at build time). Keeps the page visually complete.
const FALLBACK_SERVICES: ServiceRow[] = [
    {
        id: "fallback-hourly",
        name: "Personal Training — 1 Hour with Tyrone",
        description:
            "60-minute session with Tyrone Ngouamo. Programming, form, accountability. In-person (Utah) or remote via video. Includes session notes and a follow-up check-in.",
        price: 150,
        image_url: null,
        stripe_url: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
        payment_link_url: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
        metadata: { tier: "hourly" },
    },
    {
        id: "fallback-meal",
        name: "Custom Meal Plan — Full Build-Out",
        description:
            "Intake call, macro target, meal-by-meal week, grocery list, swap matrix, and follow-up. Built around your goal, schedule, and budget.",
        price: 297,
        image_url: null,
        stripe_url: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
        payment_link_url: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
        metadata: { tier: "meal_plan_oneshot" },
    },
    {
        id: "fallback-installment",
        name: "Meal Plan Payment Plan — $99 × 3",
        description:
            "Same Custom Meal Plan build-out, paid in three monthly installments. No long-term commitment after month three.",
        price: 99,
        image_url: null,
        stripe_url: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
        payment_link_url: "https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07",
        metadata: { tier: "meal_plan_installment", installments: 3 },
    },
];

function tierOf(s: ServiceRow): string {
    const meta = (s.metadata ?? {}) as { tier?: string };
    return meta.tier ?? "";
}

function priceLabel(s: ServiceRow): string {
    const tier = tierOf(s);
    const p = typeof s.price === "string" ? parseFloat(s.price) : (s.price ?? 0);
    if (tier === "hourly") return `$${Math.round(p)} / hour`;
    if (tier === "meal_plan_installment") return `$${Math.round(p)} × 3 months`;
    return `$${Math.round(p)} one-time`;
}

function tierIcon(tier: string) {
    if (tier === "hourly") return <Dumbbell className="w-6 h-6" />;
    if (tier === "meal_plan_oneshot") return <Salad className="w-6 h-6" />;
    if (tier === "meal_plan_installment") return <Clock className="w-6 h-6" />;
    return <Sparkles className="w-6 h-6" />;
}

function tierBullets(tier: string): string[] {
    if (tier === "hourly") {
        return [
            "Programming built around your real schedule",
            "Form coaching — every rep audited",
            "Accountability check-ins between sessions",
            "60 minutes, in-person (Utah) or remote",
        ];
    }
    if (tier === "meal_plan_oneshot") {
        return [
            "Intake call to map your goal, taste, and budget",
            "Macro target + meal-by-meal week",
            "Full grocery list with brand recommendations",
            "Swap matrix — never get stuck on a missing ingredient",
            "30-day follow-up to adjust",
        ];
    }
    if (tier === "meal_plan_installment") {
        return [
            "Same full meal-plan build-out",
            "Paid in three monthly $99 installments",
            "Cancel after month three with no penalty",
            "Same intake, same plan, same follow-up",
        ];
    }
    return [];
}

const TESTIMONIALS = [
    {
        initials: "MR",
        name: "Marcus R.",
        tag: "Lost 22 lbs · 12 weeks",
        quote:
            "I've worked with three trainers. Tyrone is the first who treated my schedule and my body like real constraints, not excuses. The plan worked because it fit the life I actually live.",
    },
    {
        initials: "AS",
        name: "Aisha S.",
        tag: "Squat: 95 → 185 lb",
        quote:
            "Form first. He refused to let me chase a number until the mechanics were clean. Six months later I doubled my squat and my knees have never felt better.",
    },
    {
        initials: "DK",
        name: "Devon K.",
        tag: "Re-built nutrition from scratch",
        quote:
            "The meal plan wasn't a diet — it was an operating system for how to eat as an adult. I haven't tracked a macro in months and I'm still leaner than I was a year ago.",
    },
];

function PortraitMonogram({ className = "" }: { className?: string }) {
    // Fallback placeholder when the real portrait image isn't yet uploaded
    // at /public/people/tyrone.webp. Stylized gold monogram on dark.
    return (
        <div
            className={`relative aspect-[3/4] w-full rounded-2xl border border-imperium-gold/30 bg-gradient-to-br from-gray-800 to-black overflow-hidden ${className}`}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[140px] bg-imperium-gold/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="text-[6rem] sm:text-[7rem] leading-none text-imperium-gold"
                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                    TN
                </span>
                <span className="mt-4 text-[10px] font-bold tracking-[0.4em] uppercase text-imperium-gold/70">
                    Tyrone Ngouamo
                </span>
            </div>
        </div>
    );
}

export default function TyronePageClient({ services }: { services: ServiceRow[] }) {
    const rows = services.length > 0 ? services : FALLBACK_SERVICES;

    // Sort offerings into a stable order: hourly, meal_plan_oneshot, installment, then others
    const sortKey = (t: string) =>
        t === "hourly" ? 0 : t === "meal_plan_oneshot" ? 1 : t === "meal_plan_installment" ? 2 : 9;
    const ordered = [...rows].sort((a, b) => sortKey(tierOf(a)) - sortKey(tierOf(b)));

    const primary = ordered[0]; // hourly training, used as hero primary CTA
    const mealPlanSectionId = "meal-plans";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Hero */}
            <section className="relative border-b border-imperium-gold/20 pt-[84px] pb-16 sm:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />
                <div className="relative container mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                                <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                                <span className="text-imperium-gold text-[10px] font-bold tracking-[0.25em] uppercase">
                                    Inner Circle · Training + Nutrition
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight tracking-tight mb-5">
                                Tyrone{" "}
                                <span
                                    className="text-imperium-gold"
                                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                                >
                                    Ngouamo
                                </span>
                            </h1>
                            <p className="text-white/55 font-light text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-md">
                                Strength training and nutrition for operators who can&rsquo;t afford to plateau.
                                Programming, form, accountability — built around the life you actually live.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {primary?.stripe_url && (
                                    <a
                                        href={primary.stripe_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                                    >
                                        Book a Session — $150
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                )}
                                <a
                                    href={`#${mealPlanSectionId}`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-imperium-gold/40 text-imperium-gold text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-imperium-gold/10 transition-all duration-200"
                                >
                                    Start a Meal Plan
                                </a>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 max-w-sm w-full mx-auto md:mx-0">
                            <PortraitMonogram />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id={mealPlanSectionId} className="py-16 sm:py-24 border-b border-imperium-gold/20">
                <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="text-center mb-12 sm:mb-16">
                        <p className="text-imperium-gold/80 text-[10px] font-bold tracking-[0.4em] uppercase">
                            The Offerings
                        </p>
                        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-[0.04em]">
                            Three ways to{" "}
                            <span
                                className="text-imperium-gold"
                                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                            >
                                work with me
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {ordered.map((s) => {
                            const tier = tierOf(s);
                            const bullets = tierBullets(tier);
                            const buyLabel =
                                tier === "hourly"
                                    ? "Book a Session"
                                    : tier === "meal_plan_installment"
                                      ? "Start the Payment Plan"
                                      : "Get the Plan";
                            return (
                                <article
                                    key={s.id}
                                    className="relative flex flex-col rounded-2xl border border-imperium-border bg-imperium-surface p-6 sm:p-7 hover:border-imperium-gold/40 hover:bg-imperium-card transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center text-imperium-gold shrink-0">
                                            {tierIcon(tier)}
                                        </div>
                                        <span className="text-imperium-gold text-[10px] font-bold tracking-[0.25em] uppercase">
                                            {priceLabel(s)}
                                        </span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 group-hover:text-imperium-gold transition-colors">
                                        {s.name}
                                    </h3>
                                    <p className="text-white/45 font-light text-sm leading-relaxed mb-5">
                                        {s.description}
                                    </p>
                                    <ul className="space-y-2 mb-6 flex-1">
                                        {bullets.map((b, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm text-white/65 font-light"
                                            >
                                                <Check className="w-4 h-4 text-imperium-gold mt-0.5 shrink-0" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {s.stripe_url && (
                                        <a
                                            href={s.stripe_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-imperium-gold/10 hover:bg-imperium-gold hover:text-[#030712] border border-imperium-gold/30 hover:border-imperium-gold text-imperium-gold text-[11px] font-bold tracking-[0.18em] uppercase rounded-full transition-all duration-200"
                                        >
                                            {buyLabel}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Newsletter mid-funnel */}
            <section className="py-16 sm:py-20 border-b border-imperium-gold/20">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <p className="text-imperium-gold/80 text-[10px] font-bold tracking-[0.4em] uppercase mb-3">
                        Read What Tyrone Reads
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-light text-white mb-3">
                        The Imperium Intelligence Brief —{" "}
                        <span
                            className="text-imperium-gold"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                        >
                            free
                        </span>
                    </h2>
                    <p className="text-white/45 font-light text-sm sm:text-base max-w-md mx-auto mb-8">
                        Tactical intellect for the disciplined sovereign. One brief at a time. No noise.
                    </p>
                    <NewsletterEmailForm />
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 sm:py-24 border-b border-imperium-gold/20">
                <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                    <div className="text-center mb-12">
                        <p className="text-imperium-gold/80 text-[10px] font-bold tracking-[0.4em] uppercase">
                            Proof
                        </p>
                        <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-[0.04em]">
                            What the work{" "}
                            <span
                                className="text-imperium-gold"
                                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                            >
                                produces
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map((t) => (
                            <article
                                key={t.name}
                                className="relative flex flex-col rounded-2xl border border-imperium-border bg-imperium-surface p-6 hover:border-imperium-gold/30 transition-all duration-300"
                            >
                                <CardShareButton
                                    shareUrl={PAGE_URL}
                                    shareText={`"${t.quote}" — ${t.name}, ${t.tag} | via Tyrone Ngouamo on Imperium`}
                                    className="absolute top-4 right-4"
                                    ariaLabel={`Share testimonial from ${t.name}`}
                                />

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-imperium-gold/30 to-imperium-gold/5 border border-imperium-gold/30 flex items-center justify-center text-imperium-gold text-xs font-bold shrink-0">
                                        {t.initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold text-sm leading-tight">{t.name}</p>
                                        <p className="text-imperium-gold/70 text-[10px] font-bold tracking-[0.18em] uppercase">
                                            {t.tag}
                                        </p>
                                    </div>
                                </div>

                                <blockquote
                                    className="text-white/75 leading-relaxed text-[14px] sm:text-[15px] flex-1"
                                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                                >
                                    &ldquo;{t.quote}&rdquo;
                                </blockquote>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Inner Circle */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
                    <div className="relative rounded-3xl border border-imperium-gold/30 bg-gradient-to-br from-gray-900/80 to-black/80 p-8 sm:p-12 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-imperium-gold/[0.06] rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-5">
                                <Crown className="w-6 h-6 text-imperium-gold" />
                                <span className="text-imperium-gold text-[10px] font-bold tracking-[0.3em] uppercase">
                                    The Inner Circle
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white leading-snug mb-4">
                                Become an{" "}
                                <span
                                    className="text-imperium-gold"
                                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                                >
                                    Imperium Inner Circle
                                </span>{" "}
                                member
                            </h2>

                            <p className="text-white/55 font-light text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                                The same path Tyrone took. Curated membership. Permanent network. A profile page
                                of your own, hosted here, and a custom asset built around your brand.
                            </p>

                            <ul className="space-y-5 mb-10">
                                <li className="flex gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-imperium-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-semibold text-sm sm:text-base">
                                            Your own profile on Imperium
                                        </p>
                                        <p className="text-white/45 text-sm font-light leading-relaxed">
                                            Like this one. Built and hosted on secretimperium.com under your name —
                                            yours to send to clients, partners, and the world.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-imperium-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-semibold text-sm sm:text-base">
                                            Lifetime access to the network
                                        </p>
                                        <p className="text-white/45 text-sm font-light leading-relaxed">
                                            Permanent membership. Operators, builders, mentors, capital. The room
                                            doesn&rsquo;t close behind you.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-imperium-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-semibold text-sm sm:text-base">
                                            A custom $25K digital asset for your brand
                                        </p>
                                        <p className="text-white/45 text-sm font-light leading-relaxed">
                                            Designed and shipped to you. Yours to deploy, sell, or hold. The same
                                            kind of asset Tyrone is building from this profile.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-imperium-gold shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-semibold text-sm sm:text-base">
                                            Exclusive offers across our platforms
                                        </p>
                                        <p className="text-white/45 text-sm font-light leading-relaxed">
                                            Discounts, early access, partnership lanes — across every brand in the
                                            Imperium federation.
                                        </p>
                                    </div>
                                </li>
                            </ul>

                            <Link
                                href={REFERRAL_URL}
                                className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                            >
                                Apply for Inner Circle
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Share */}
            <PageShareCard
                title="Send this to someone who needs it."
                subtitle="The doctrine spreads when an operator hands it to another operator."
                shareUrl={PAGE_URL}
                shareText="Tyrone Ngouamo — training, nutrition, and the Imperium Inner Circle."
            />

            {/* Back-link */}
            <div className="border-t border-imperium-gold/20 py-10 text-center">
                <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                    <span>← Back to Imperium</span>
                </Link>
            </div>
        </div>
    );
}
