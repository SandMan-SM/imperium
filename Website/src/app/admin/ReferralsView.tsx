"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReferralRow {
    id: string;
    reward_amount: number | null;
    reward_currency: string | null;
    reward_type: string | null;
    reward_claimed: boolean | null;
    claimed_at: string | null;
    created_at: string;
    referrer_name: string | null;
    referrer_email: string | null;
    referred_name: string | null;
    referred_email: string | null;
}

interface ReferralPayload {
    referrals: ReferralRow[];
    count: number;
    owed: number;
}

/**
 * The operator's referral ledger.
 *
 * The referral table carries the commission a referral has earned and
 * whether it has been paid. Nothing wrote those fields and nothing read
 * them, so the commission the site promised could not be tracked or paid.
 *
 * This panel is where the payout is recorded: the money is sent by the
 * team, and the button records that it was — so the member's own portal
 * stops showing it as waiting.
 */
export default function ReferralsView() {
    const [payload, setPayload] = useState<ReferralPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);

        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch("/api/admin/referrals", {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
                signal: AbortSignal.timeout(8000),
            });

            if (!response.ok) {
                setError("The referral ledger could not be read.");
                setLoading(false);
                return;
            }

            setPayload((await response.json()) as ReferralPayload);
        } catch (err) {
            console.error("Failed to load referrals:", err);
            setError("The referral ledger could not be read.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const markPaid = async (id: string) => {
        setBusyId(id);

        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;

            const response = await fetch("/api/admin/referrals", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, claimed: true }),
                signal: AbortSignal.timeout(8000),
            });

            if (!response.ok) {
                setError("The referral could not be updated.");
                return;
            }

            await load();
        } catch (err) {
            console.error("Failed to update the referral:", err);
            setError("The referral could not be updated.");
        } finally {
            setBusyId(null);
        }
    };

    // The ledger records the commission in dollars, the same unit as the
    // `reward_currency` column beside it.
    const money = (dollars: number) => `$${dollars.toFixed(2)}`;

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-light text-white tracking-tight">Referrals</h2>
                    <p className="text-white/40 text-sm mt-1">
                        Every referral sent, and the commission each one has earned.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={load}
                    className="flex items-center gap-2 px-3 py-2 text-[11px] tracking-wider uppercase rounded-lg text-white/40 hover:text-white hover:bg-white/[0.02]"
                >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Refresh
                </button>
            </div>

            {error && (
                <p className="text-red-400/80 text-sm mb-4" role="alert">
                    {error}
                </p>
            )}

            {loading ? (
                <div className="flex items-center gap-3 py-10 text-white/40">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span className="text-sm">Loading the referral ledger</span>
                </div>
            ) : !payload || payload.referrals.length === 0 ? (
                <div className="p-8 border border-imperium-gold/20 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 text-center">
                    <p className="text-white/60 text-sm">
                        No referrals yet. A member&apos;s referral link records one here the moment the
                        referral takes the membership.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3 mb-6 max-w-md">
                        <div className="p-4 border border-imperium-gold/20 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                            <p className="text-white/30 text-xs uppercase tracking-wider">Referrals</p>
                            <p className="text-white text-2xl mt-1">{payload.count}</p>
                        </div>
                        <div className="p-4 border border-imperium-gold/20 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                            <p className="text-white/30 text-xs uppercase tracking-wider">Waiting to be paid</p>
                            <p className="text-white text-2xl mt-1">{money(payload.owed)}</p>
                        </div>
                    </div>

                    <div className="border border-white/[0.07] rounded-xl overflow-x-auto">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="text-left text-white/30 text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 font-normal">Member</th>
                                    <th className="px-4 py-3 font-normal">Referred</th>
                                    <th className="px-4 py-3 font-normal">Commission</th>
                                    <th className="px-4 py-3 font-normal">Status</th>
                                    <th className="px-4 py-3 font-normal" />
                                </tr>
                            </thead>
                            <tbody>
                                {payload.referrals.map((row) => (
                                    <tr key={row.id} className="border-t border-white/[0.04] text-white/70">
                                        <td className="px-4 py-3">
                                            <span className="text-white">{row.referrer_name || row.referrer_email || "Unknown"}</span>
                                            {row.referrer_email && row.referrer_name && (
                                                <span className="block text-white/30 text-xs">{row.referrer_email}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.referred_name || row.referred_email || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.reward_amount ? money(Number(row.reward_amount)) : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.reward_claimed ? (
                                                <span className="text-emerald-400/80">Paid</span>
                                            ) : row.reward_amount ? (
                                                <span className="text-imperium-gold">Waiting</span>
                                            ) : (
                                                <span className="text-white/30">No membership yet</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {row.reward_amount && !row.reward_claimed && (
                                                <button
                                                    type="button"
                                                    onClick={() => markPaid(row.id)}
                                                    disabled={busyId === row.id}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wider uppercase rounded-lg bg-imperium-gold/10 border border-imperium-gold/30 text-imperium-gold hover:bg-imperium-gold/20 disabled:opacity-50"
                                                >
                                                    {busyId === row.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                                    )}
                                                    Mark paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
