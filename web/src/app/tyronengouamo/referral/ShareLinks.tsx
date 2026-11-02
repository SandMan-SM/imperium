"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

interface ShareLink {
    label: string;
    detail: string;
    url: string;
}

/**
 * Copyable links for the referral page.
 *
 * The links are plain Stripe and site URLs. Copying one has to work on a
 * phone, where `navigator.clipboard` is only available on a secure origin —
 * the live site is HTTPS, so it is available, but a failure has to leave the
 * link on screen rather than silently doing nothing. The link text is
 * selectable for exactly that case.
 */
export function ShareLinks({ links }: { links: ShareLink[] }) {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = async (entry: ShareLink) => {
        try {
            await navigator.clipboard.writeText(entry.url);
            setCopied(entry.url);
            window.setTimeout(() => setCopied((current) => (current === entry.url ? null : current)), 2200);
        } catch {
            setCopied(null);
        }
    };

    const share = async () => {
        const target = links[0];
        if (!target) return;

        if (typeof navigator !== "undefined" && "share" in navigator) {
            try {
                await navigator.share({
                    title: "Imperium Elite coaching",
                    text: "Strength, nutrition, and the principles behind both.",
                    url: target.url,
                });
                return;
            } catch {
                // The visitor dismissed the share sheet. Nothing to do.
            }
        }

        await copy(target);
    };

    return (
        <div className="coaching-share-links">
            {links.map((entry) => (
                <div key={entry.url} className="coaching-share-link">
                    <span className="min-w-0">
                        {entry.label}
                        <small>{entry.detail}</small>
                    </span>
                    <button
                        type="button"
                        className={`coaching-copy ${copied === entry.url ? "is-copied" : ""}`}
                        onClick={() => copy(entry)}
                        aria-label={`Copy the link to ${entry.label}`}
                    >
                        {copied === entry.url ? (
                            <Check size={14} aria-hidden="true" />
                        ) : (
                            <Copy size={14} aria-hidden="true" />
                        )}
                        {copied === entry.url ? "Copied" : "Copy"}
                    </button>
                </div>
            ))}
            <button type="button" className="editorial-button mt-2" onClick={share}>
                <Share2 size={17} aria-hidden="true" />
                Share the coaching page
            </button>
        </div>
    );
}
