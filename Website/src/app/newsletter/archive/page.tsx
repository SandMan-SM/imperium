"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NewsletterPosts } from "@/components/NewsletterPosts";

export default function NewsletterArchivePage() {
    const { user, profile, checkPremiumStatus } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    useEffect(() => {
        async function checkPremium() {
            if (user && profile) {
                setIsPremium(profile.is_premium || profile.subscription_status === "active");
            } else if (user && !profile) {
                const { isPremium: premium } = await checkPremiumStatus(user.email || "");
                setIsPremium(premium);
            } else {
                setIsPremium(false);
            }
            setCheckingPremium(false);
        }

        checkPremium();
    }, [user, profile, checkPremiumStatus]);

    if (checkingPremium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <section className="relative border-b border-imperium-gold/20 pt-[84px] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-imperium-gold/[0.05] rounded-full blur-[110px] pointer-events-none" />
                <div className="relative container mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                    <Link href="/newsletter" className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Newsletter
                    </Link>
                    <div className="max-w-3xl">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gradient-gold">Daily Intelligence Brief</p>
                        <h1 className="mb-5 text-4xl sm:text-5xl md:text-6xl font-light leading-tight text-white">
                            Archive
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-white/45">
                            The 10 most recent dispatches from the Imperium intelligence archive.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-16">
                <NewsletterPosts isPremium={isPremium} isLoggedIn={!!user} limit={10} archive />
            </section>
        </main>
    );
}
