"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon, Share2 } from "lucide-react";

// Reusable share widget for landing pages and profiles.
// - Native share sheet on devices that support it
// - X (twitter) intent URL
// - Threads intent URL
// - Copy link with toast
//
// Usage:
//   <PageShareCard
//     title="Send this to someone who needs it."
//     subtitle="The doctrine spreads when an operator hands it to another operator."
//     shareUrl="https://secretimperium.com/tyronengouamo"
//     shareText="Strength training, nutrition, and the Imperium Inner Circle."
//   />
export default function PageShareCard({
    title = "Send this to someone who needs it.",
    subtitle,
    shareUrl,
    shareText = "",
}: {
    title?: string;
    subtitle?: string;
    shareUrl: string;
    shareText?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleNativeShare() {
        try {
            if (typeof navigator !== "undefined" && "share" in navigator) {
                await navigator.share({
                    title: shareText || title,
                    text: shareText || title,
                    url: shareUrl,
                });
                return;
            }
        } catch {
            // user cancelled or share unsupported — fall through to copy
        }
        await handleCopy();
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    }

    const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText,
    )}&url=${encodeURIComponent(shareUrl)}`;

    const threadsIntent = `https://www.threads.net/intent/post?text=${encodeURIComponent(
        `${shareText}\n\n${shareUrl}`,
    )}`;

    return (
        <section className="border-t border-imperium-gold/20 py-16 sm:py-20">
            <div className="container mx-auto px-6 max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border border-imperium-gold/25 rounded-full bg-imperium-gold/5">
                    <Share2 className="w-3 h-3 text-imperium-gold" />
                    <span className="text-imperium-gold text-[10px] font-bold tracking-[0.25em] uppercase">
                        Spread the Signal
                    </span>
                </div>
                <h2 className="text-2xl sm:text-3xl text-white font-light leading-snug">{title}</h2>
                {subtitle && (
                    <p className="mt-3 text-white/45 font-light text-sm sm:text-base max-w-lg mx-auto">
                        {subtitle}
                    </p>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={handleNativeShare}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>
                    <a
                        href={xIntent}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 border border-imperium-gold/30 text-imperium-gold text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-imperium-gold/10 transition-all duration-200"
                    >
                        Post on X
                    </a>
                    <a
                        href={threadsIntent}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 border border-imperium-gold/30 text-imperium-gold text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-imperium-gold/10 transition-all duration-200"
                    >
                        Post on Threads
                    </a>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-2 px-5 py-3 border border-white/15 text-white/70 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:border-white/30 hover:text-white transition-all duration-200"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Copied
                            </>
                        ) : (
                            <>
                                <LinkIcon className="w-3.5 h-3.5" />
                                Copy Link
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}

// Smaller inline share button intended for individual cards (e.g. each
// testimonial card on the Tyrone profile). Same behavior as the big card:
// native share if available, copy-link fallback with brief toast state.
export function CardShareButton({
    shareUrl,
    shareText,
    className = "",
    ariaLabel = "Share this",
}: {
    shareUrl: string;
    shareText: string;
    className?: string;
    ariaLabel?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (typeof navigator !== "undefined" && "share" in navigator) {
                await navigator.share({ text: shareText, url: shareUrl, title: shareText });
                return;
            }
        } catch {
            // fall through to copy
        }
        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // ignore
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={ariaLabel}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/[0.07] bg-white/[0.02] text-white/40 hover:text-imperium-gold hover:border-imperium-gold/40 transition-colors ${className}`}
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
    );
}
