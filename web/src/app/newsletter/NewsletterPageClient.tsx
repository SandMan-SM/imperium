"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import NewsletterEmailForm from "@/components/NewsletterEmailForm";

export type NewsletterRow = {
    id: string;
    title: string | null;
    content: string | null;
    image_url: string | null;
    published: boolean | null;
    is_public: boolean | null;
    created_at: string | null;
};

export default function NewsletterPageClient({ newsletters }: { newsletters: NewsletterRow[] }) {
    const { user, profile, checkPremiumStatus } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    useEffect(() => {
        async function checkPremium() {
            if (user && profile) {
                const premium = profile.is_premium || profile.subscription_status === "active";
                setIsPremium(premium);
                setCheckingPremium(false);
            } else if (user && !profile) {
                const { isPremium: premium } = await checkPremiumStatus(user.email || "");
                setIsPremium(premium);
                setCheckingPremium(false);
            } else {
                setIsPremium(false);
                setCheckingPremium(false);
            }
        }
        checkPremium();
    }, [user, profile, checkPremiumStatus]);

    const isLoggedIn = !!user;
    const showPremiumHero = isPremium && isLoggedIn;

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <div className="relative border-b border-imperium-gold/20 pt-[84px] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-imperium-gold/[0.05] rounded-full blur-[100px] pointer-events-none" />

                <div className="relative container mx-auto px-4 sm:px-6 max-w-3xl py-12 sm:py-16 md:py-24 text-center">
                    {showPremiumHero ? (
                        <div className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/10">
                            <Crown className="w-4 h-4 text-imperium-gold" />
                            <span className="text-imperium-gold text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                                Premium Intelligence
                            </span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-imperium-gold animate-pulse" />
                            <span className="text-imperium-gold text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                                Intelligence Network
                            </span>
                        </div>
                    )}

                    <h1
                        className="text-2xl sm:text-3xl md:text-6xl text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0"
                        style={{ paddingTop: "6px" }}
                    >
                        The <span className="font-display italic text-gold-gradient">Imperium</span>{" "}
                        {showPremiumHero ? "Premium Brief" : "Intelligence Brief"}
                    </h1>

                    <p className="text-white/45 font-light text-xs sm:text-sm md:text-lg leading-relaxed mb-4 sm:mb-4 px-2 sm:px-0">
                        {showPremiumHero
                            ? "Exclusive premium intelligence. No marketing, no noise — just pure strategic value delivered to your inbox."
                            : "Tactical intellect for the disciplined sovereign. No noise, no motivation platitudes — just precision frameworks from history's most formidable minds. Free to read. Free to subscribe."}
                    </p>

                    <p className="text-imperium-gold/60 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-widest uppercase">
                        {showPremiumHero
                            ? "Premium Access Active"
                            : "Free · 2,400+ subscribers · Read everything below"}
                    </p>
                </div>
            </div>

            {/* Free email signup — optional, for future briefs */}
            {!isPremium && !isLoggedIn && (
                <div className="border-b border-imperium-gold/20 py-12 md:py-16">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-8 md:mb-10">
                            <h2 className="text-xl md:text-2xl text-white mb-3 font-light">
                                Get future briefs delivered
                            </h2>
                            <p className="text-white/35 font-light text-sm">
                                Free. One field. We send each brief to your inbox when it drops.
                            </p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <NewsletterEmailForm />
                        </div>
                    </div>
                </div>
            )}

            {/* Posts */}
            <div className="py-20">
                <div className="container mx-auto px-6 max-w-3xl">
                    <NewsletterContent
                        newsletters={newsletters}
                        isPremium={showPremiumHero}
                        isLoggedIn={isLoggedIn}
                        checkingPremium={checkingPremium}
                    />
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="border-t border-imperium-gold/20 py-20">
                <div className="container mx-auto px-6 max-w-2xl text-center">
                    {showPremiumHero ? (
                        <div className="space-y-6">
                            <div className="bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-8">
                                <Crown className="w-12 h-12 text-imperium-gold mx-auto mb-4" />
                                <h3 className="text-xl text-white mb-4">Premium Access Active</h3>
                                <p className="text-white/40 font-light mb-6">
                                    You have full access to premium intelligence briefs and the 28 Principles.
                                </p>
                                <Link
                                    href="/28principles"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200 btn-primary"
                                >
                                    <Lock className="w-4 h-4" /> Access 28 Principles
                                </Link>
                            </div>
                        </div>
                    ) : isLoggedIn ? (
                        <div className="space-y-6">
                            <div className="bg-imperium-gold/5 border border-imperium-gold/20 rounded-2xl p-8">
                                <h3 className="text-xl text-white mb-4">Upgrade to Premium</h3>
                                <p className="text-white/40 font-light mb-6">
                                    Get exclusive briefs without marketing and full access to 28 Principles.
                                </p>
                                <a
                                    href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-imperium-gold text-imperium-bg px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
                                >
                                    Upgrade to Premium — $20/month
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-2xl md:text-3xl text-white mb-2 font-light">
                                Want the next one in your inbox?
                            </h2>
                            <p className="text-white/40 font-light text-sm">
                                Free. No contracts. Unsubscribe anytime.
                            </p>

                            <NewsletterEmailForm />

                            <p className="mt-6 text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-white/25">
                                The Imperium Elite tier · $20/month · adds private community, 1-on-1 access, and the full 28 Principles
                            </p>
                            <a
                                href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold/70 hover:text-imperium-gold underline underline-offset-4 transition-colors"
                            >
                                Upgrade if you want it →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NewsletterContent({
    newsletters,
    isPremium,
    isLoggedIn,
    checkingPremium,
}: {
    newsletters: NewsletterRow[];
    isPremium: boolean;
    isLoggedIn: boolean;
    checkingPremium: boolean;
}) {
    if (newsletters.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-2xl text-white mb-4">
                    {isPremium ? "Latest Premium Brief" : "Sample Intelligence Brief"}
                </h2>
                <p className="text-white/35 font-light text-sm mb-10">
                    {isPremium
                        ? "Your exclusive premium intelligence content."
                        : "Every brief looks like this. Dense. Formatted. Executable."}
                </p>
                <div className="glass-card rounded-2xl p-6 md:p-10 text-left">
                    <p className="text-white/40 font-light text-sm">No newsletters published yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl text-white mb-4">Latest Intelligence Brief</h2>
                <p className="text-white/35 font-light text-sm">
                    {isPremium
                        ? "Your exclusive premium intelligence content."
                        : "Public briefs from the Imperium archive."}
                </p>
            </div>

            {newsletters.map((nl) => (
                <article
                    key={nl.id}
                    className="glass-card rounded-2xl p-6 md:p-10 text-left relative overflow-hidden mb-6"
                >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-imperium-border">
                        <div>
                            <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-imperium-gold mb-1">
                                Imperium Intelligence Brief
                            </p>
                            <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-white/20">
                                {nl.created_at ? new Date(nl.created_at).toLocaleDateString() : "New"}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center">
                            <span className="text-imperium-gold text-xs font-bold">I</span>
                        </div>
                    </div>

                    <h3 className="text-base md:text-lg font-semibold text-white mb-4">{nl.title}</h3>

                    <div className="space-y-6">
                        {nl.content ? (
                            <NewsletterBody content={nl.content} />
                        ) : (
                            <div className="text-white/40 font-light text-sm">No content available.</div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-imperium-border">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-4">
                                {nl.is_public ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Public Brief
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-imperium-gold/10 border border-imperium-gold/20 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-imperium-gold">
                                        <span className="w-2 h-2 bg-imperium-gold rounded-full animate-pulse"></span>
                                        Premium Only
                                    </span>
                                )}
                                <span className="text-white/20 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                                    {nl.is_public ? "Available to all" : "Premium subscribers"}
                                </span>
                            </div>

                            {!nl.is_public && !isPremium && isLoggedIn && !checkingPremium && (
                                <a
                                    href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-imperium-gold text-imperium-bg px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white transition-all"
                                >
                                    Upgrade to Premium
                                </a>
                            )}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

// Lightweight markdown renderer for newsletter content.
// Supports: ## Section heading, > Pull quote, **bold**, *italic*, paragraphs.
function NewsletterBody({ content }: { content: string }) {
    const blocks = content
        .split(/\n\s*\n+/)
        .map((b) => b.trim())
        .filter(Boolean);

    function renderInline(text: string, keyPrefix: string): React.ReactNode {
        const parts: React.ReactNode[] = [];
        const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let lastIdx = 0;
        let match: RegExpExecArray | null;
        let i = 0;
        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
            const token = match[0];
            if (token.startsWith("**")) {
                parts.push(
                    <strong key={`${keyPrefix}-b-${i++}`} className="text-white font-semibold">
                        {token.slice(2, -2)}
                    </strong>,
                );
            } else {
                parts.push(
                    <em key={`${keyPrefix}-i-${i++}`} className="italic text-white/70">
                        {token.slice(1, -1)}
                    </em>,
                );
            }
            lastIdx = match.index + token.length;
        }
        if (lastIdx < text.length) parts.push(text.slice(lastIdx));
        return parts;
    }

    return (
        <div className="space-y-6">
            {blocks.map((block, idx) => {
                if (block.startsWith("## ")) {
                    return (
                        <h4
                            key={idx}
                            className="text-base sm:text-lg font-semibold text-imperium-gold tracking-[0.05em] uppercase pt-4"
                        >
                            {block.slice(3).trim()}
                        </h4>
                    );
                }
                if (block.startsWith("> ")) {
                    return (
                        <blockquote
                            key={idx}
                            className="border-l-2 border-imperium-gold/60 pl-5 sm:pl-6 my-4 text-imperium-gold/90 text-lg sm:text-xl md:text-2xl leading-snug"
                            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                        >
                            {block.slice(2).trim()}
                        </blockquote>
                    );
                }
                if (/^[—-]{3,}$/.test(block)) {
                    return <hr key={idx} className="my-6 border-t border-imperium-border" />;
                }
                if (block.startsWith("— ") && block.endsWith(" —")) {
                    return (
                        <p
                            key={idx}
                            className="text-center text-white/30 italic text-xs sm:text-sm tracking-wider pt-6"
                        >
                            {block}
                        </p>
                    );
                }
                return (
                    <p
                        key={idx}
                        className="text-white/65 font-light text-[14px] md:text-[15px] leading-[1.85]"
                    >
                        {renderInline(block, `p-${idx}`)}
                    </p>
                );
            })}
        </div>
    );
}

