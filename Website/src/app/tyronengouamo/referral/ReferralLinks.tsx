"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { ShareLinks } from "./ShareLinks";

interface ShareLink {
    label: string;
    detail: string;
    url: string;
    /** The one link that records a referral. */
    referral?: boolean;
}

type ReferralSummary = {
    code: string | null;
    link: string | null;
};

/**
 * The links a member actually shares.
 *
 * The page used to hand every visitor the same four links, one of them the
 * membership checkout with no referral on it at all. Nothing a visitor did
 * could be recorded against anybody, so the commission the page promised was
 * a promise the site had no way to keep.
 *
 * A member's own link carries their code, so opening it records the
 * referral. A visitor who is not signed in has no code yet, so the page
 * tells them where to get one instead of handing them a link that earns
 * nothing.
 */
export function ReferralLinks({ staticLinks }: { staticLinks: ShareLink[] }) {
    const { user, loading } = useAuth();
    const [summary, setSummary] = useState<ReferralSummary | null>(null);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        const load = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const token = data.session?.access_token;
                if (!token || cancelled) return;

                const response = await fetch("/api/referrals/mine", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                    signal: AbortSignal.timeout(6000),
                });

                if (!response.ok || cancelled) return;
                setSummary((await response.json()) as ReferralSummary);
            } catch (error) {
                console.error("Error loading the referral link:", error);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [user]);

    if (loading) return null;

    if (!user) {
        return (
            <div className="coaching-share-links">
                <p className="text-[14.5px] leading-[1.85] text-[#6c6f63]">
                    Your referral link is in the member portal, and it is the only link that records a
                    referral — it carries your code. Sign in to get it.
                </p>
                <Link className="editorial-button mt-3" href="/login/?redirect=%2Fportal%2F">
                    Sign in to get your link
                </Link>
            </div>
        );
    }

    if (!summary?.link) {
        return (
            <div className="coaching-share-links">
                <p className="text-[14.5px] leading-[1.85] text-[#6c6f63]">
                    Your referral link could not be issued just now. Open the member portal and it will be
                    there.
                </p>
                <Link className="editorial-button mt-3" href="/portal/">
                    Open the member portal
                </Link>
            </div>
        );
    }

    // The membership link is the one that carries the referral. The coaching
    // links are for the buyer, and they carry no commission.
    const links: ShareLink[] = staticLinks.map((entry) =>
        entry.referral
            ? {
                  ...entry,
                  detail: "$20 a month — the referral pays 30% commission.",
                  url: summary.link as string,
              }
            : entry,
    );

    return (
        <div className="coaching-share-links">
            <p className="text-[14.5px] leading-[1.85] text-[#6c6f63]">
                This is your link. It carries your code, so a referral is recorded against you when
                somebody takes the membership through it.
            </p>
            <ShareLinks links={links} />
        </div>
    );
}
