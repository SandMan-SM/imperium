"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ReferralSummary = {
    code: string | null;
    link: string | null;
    referralCount: number;
    commissionPaid: number;
    commissionUnpaid: number;
};

/**
 * The member's referral record.
 *
 * This panel used to show a link built from the first eight characters of the
 * profile's uuid, pointing at a domain the site does not serve and a route
 * that did not exist. Copying it produced something that looked like a
 * referral link and could never earn anybody a commission.
 *
 * Now it shows the real thing: the member's own code, the link built from
 * it, how many referrals they have sent, and what they have earned. The
 * figures come from the server, so the number on the screen is the number
 * that was recorded.
 */

function money(dollars: number): string {
    return `$${dollars.toFixed(2)}`;
}

export default function ReferralPanel() {
    const [summary, setSummary] = useState<ReferralSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) {
                setLoading(false);
                return;
            }

            const headers = { Authorization: `Bearer ${token}` };

            // The claim records the referral the visitor arrived with. It is
            // idempotent, so running it here is harmless if the sign-in
            // already did it.
            await fetch("/api/referrals/claim", {
                method: "POST",
                headers,
                signal: AbortSignal.timeout(6000),
            }).catch(() => null);

            const response = await fetch("/api/referrals/mine", {
                headers,
                cache: "no-store",
                signal: AbortSignal.timeout(6000),
            });

            if (!response.ok) {
                setLoading(false);
                return;
            }

            setSummary((await response.json()) as ReferralSummary);
        } catch (error) {
            console.error("Error loading the referral record:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const copy = async () => {
        if (!summary?.link) return;

        try {
            await navigator.clipboard.writeText(summary.link);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        } catch {
            // Clipboard access is refused on some browsers and over plain
            // HTTP. The link is on screen and selectable, so the member can
            // still copy it by hand.
            setCopied(false);
        }
    };

    if (loading) {
        return (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-imperium-gold animate-spin" aria-hidden="true" />
                <p className="text-white/40 text-sm">Loading your referral record</p>
            </div>
        );
    }

    const earned = (summary?.commissionPaid ?? 0) + (summary?.commissionUnpaid ?? 0);

    return (
        <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-imperium-gold" aria-hidden="true" />
                Your referral link
            </h3>

            {summary?.link ? (
                <>
                    <div className="p-4 bg-black/30 rounded-lg mb-3">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Share this</p>
                        <p className="text-white text-sm font-mono break-all select-all">{summary.link}</p>
                    </div>
                    <button
                        type="button"
                        className="w-full py-3 bg-imperium-gold text-imperium-bg rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                        onClick={copy}
                    >
                        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                        {copied ? "Copied" : "Copy referral link"}
                    </button>
                </>
            ) : (
                <p className="text-white/40 text-sm">
                    Your referral link could not be issued. Try again in a moment, or ask the Imperium team for
                    your code.
                </p>
            )}

            <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/20 rounded-lg">
                    <dt className="text-white/30 text-xs uppercase tracking-wider">Referrals</dt>
                    <dd className="text-white text-lg mt-1">{summary?.referralCount ?? 0}</dd>
                </div>
                <div className="p-3 bg-black/20 rounded-lg">
                    <dt className="text-white/30 text-xs uppercase tracking-wider">Commission earned</dt>
                    <dd className="text-white text-lg mt-1">{money(earned)}</dd>
                </div>
            </dl>

            {earned > 0 && (
                <p className="text-white/40 text-xs mt-3">
                    {money(summary?.commissionUnpaid ?? 0)} waiting to be paid
                    {summary?.commissionPaid ? `, ${money(summary.commissionPaid)} already paid` : ""}.
                </p>
            )}

            <p className="text-white/40 text-sm mt-4">
                Send the link to somebody who would use the membership. When they open it and take the
                membership, the referral is recorded against you and you earn 30% of that membership — 6.00
                on a 20.00 membership. Payouts are made by the Imperium team once the membership payment has
                cleared, so ask for yours when it is due.
            </p>
        </div>
    );
}
