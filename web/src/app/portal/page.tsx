"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    ChevronRight,
    Crown,
    Gift,
    Link as LinkIcon,
    Loader2,
    LogOut,
    Mail,
    ShoppingBag,
    Sparkles,
    Users,
    Video,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AdminDashboard from "../admin/page";
import { CURRICULUM, TOTAL_UNITS } from "@/lib/curriculum";
import { lastUnit, overallProgress, useProgress } from "@/lib/progress";

export default function PortalPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading || (user && profile === null)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-imperium-gold animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">
                        Loading the portal…
                    </p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (profile?.is_admin) {
        return <AdminDashboard />;
    }

    const userView = profile?.is_premium || profile?.subscription_status === "active" ? "premium" : "free";

    return <UserPortal userView={userView} />;
}

function UserPortal({ userView }: { userView: "free" | "premium" }) {
    const { profile, signOut } = useAuth();
    const { state, hydrated } = useProgress();
    const [showAffiliate, setShowAffiliate] = useState(false);

    const overall = useMemo(() => overallProgress(state), [state]);
    const resume = useMemo(() => lastUnit(state), [state]);

    const handleSignOut = async () => {
        await signOut();
    };

    const greeting = profile?.first_name ? `, ${profile.first_name}` : "";
    const totalPhases = CURRICULUM.length;

    return (
        <div className="min-h-screen pb-20">
            {/* Status banner */}
            <div
                className={`px-4 py-3 border-b ${
                    userView === "premium"
                        ? "bg-imperium-gold/10 border-imperium-gold/30"
                        : "bg-white/[0.02] border-white/[0.05]"
                }`}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
                    {userView === "premium" ? (
                        <>
                            <Crown className="w-4 h-4 text-imperium-gold" />
                            <span className="text-imperium-gold text-sm font-medium tracking-wide">
                                Premium Access · The Inner Circle
                            </span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400 text-sm font-medium tracking-wide">
                                Free Tier · Phase I unlocked
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-12">
                {/* Welcome header */}
                <header className="mb-10">
                    <p className="text-[10px] font-bold tracking-[0.4em] text-imperium-gold/80 uppercase mb-2">
                        The Portal
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-light text-white tracking-[0.04em]">
                        Welcome back<span className="text-imperium-gold">{greeting}</span>
                    </h1>
                    <p className="mt-3 text-sm text-white/40 font-light">
                        {userView === "premium"
                            ? "Your full operating system. Pick up where you left off."
                            : "Phase I is yours. Upgrade when you are ready for the rest of the doctrine."}
                    </p>
                </header>

                {/* Progress card */}
                {hydrated && (
                    <Link
                        href={resume ? `/28principles/${resume.unit.slug}` : "/28principles"}
                        className="group block mb-10 rounded-2xl border border-imperium-gold/20 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 sm:p-8 hover:border-imperium-gold/40 hover:bg-gray-800/80 transition-all"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold tracking-[0.3em] text-imperium-gold/80 uppercase mb-2">
                                    {resume ? "Resume the Doctrine" : "Begin the Doctrine"}
                                </p>
                                <h2 className="text-xl sm:text-2xl font-light text-white group-hover:text-imperium-gold transition-colors">
                                    {resume ? `Unit ${resume.unit.id} · ${resume.unit.title}` : "The Power of Purpose"}
                                </h2>
                                <p
                                    className="mt-2 text-sm sm:text-base text-imperium-gold/80 italic leading-snug"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    “{resume ? resume.unit.quote : "A man without a why is dust in motion."}”
                                </p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-imperium-gold/60 shrink-0 transition-transform group-hover:translate-x-1" />
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/[0.06]">
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-imperium-gold to-imperium-gold/70 transition-all duration-700"
                                    style={{ width: `${overall.percent}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-gray-500">
                                <span>
                                    {overall.completed} / {TOTAL_UNITS} units · {totalPhases} phases
                                </span>
                                <span className="text-imperium-gold/80">{overall.percent}%</span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Action grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <PortalLink
                        href="/28principles"
                        icon={<BookOpen className="w-5 h-5" />}
                        title="28 Principles"
                        subtitle="Walk the doctrine, unit by unit"
                    />
                    <PortalLink
                        href="/newsletter"
                        icon={<Mail className="w-5 h-5" />}
                        title={userView === "premium" ? "Premium Newsletter" : "Newsletter"}
                        subtitle={
                            userView === "premium"
                                ? "Daily intelligence briefs"
                                : "Read the public briefs"
                        }
                    />
                    <PortalLink
                        href="/shop"
                        icon={<ShoppingBag className="w-5 h-5" />}
                        title="The Arsenal"
                        subtitle="Apparel and gear"
                    />
                    {userView === "premium" ? (
                        <>
                            <PortalLink
                                href="https://discord.gg/imperium"
                                external
                                icon={<Users className="w-5 h-5" />}
                                title="Inner Circle"
                                subtitle="Private operator community"
                            />
                            <PortalLink
                                href="mailto:concierge@secretimperium.com?subject=1-on-1%20Call%20Request"
                                external
                                icon={<Video className="w-5 h-5" />}
                                title="1-on-1 Call"
                                subtitle="Schedule a strategic consultation"
                            />
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowAffiliate((s) => !s)}
                            className="group relative flex items-center gap-4 p-5 sm:p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/30 hover:bg-white/[0.04] transition-all text-left"
                        >
                            <div className="w-11 h-11 rounded-xl bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center text-imperium-gold shrink-0">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">
                                    Affiliate Program
                                </h3>
                                <p className="text-white/40 text-sm">Earn by referring others</p>
                            </div>
                            <ChevronRight
                                className={`w-5 h-5 text-imperium-gold/50 transition-transform ${
                                    showAffiliate ? "rotate-90" : ""
                                }`}
                            />
                        </button>
                    )}
                </div>

                {/* Affiliate panel (free users only) */}
                {userView === "free" && showAffiliate && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-2xl">
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-imperium-gold" />
                            Affiliate Program
                        </h3>
                        <p className="text-white/50 text-sm mb-4 leading-relaxed">
                            Share Imperium with your network and earn 30% commission on every referral.
                        </p>
                        <div className="space-y-3">
                            <div className="p-4 bg-black/30 rounded-lg border border-white/[0.04]">
                                <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-1.5">
                                    Your Referral Link
                                </p>
                                <p className="text-white text-sm font-mono break-all">
                                    secretimperium.com/ref/{profile?.id?.slice(0, 8) || "user"}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="w-full py-3 bg-imperium-gold text-imperium-bg rounded-lg text-sm font-medium hover:bg-white transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `https://secretimperium.com/ref/${profile?.id?.slice(0, 8) || "user"}`,
                                    );
                                }}
                            >
                                Copy Referral Link
                            </button>
                        </div>
                    </div>
                )}

                {/* Free tier upgrade nudge */}
                {userView === "free" && (
                    <a
                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-imperium-gold/10 border border-imperium-gold/30 hover:bg-imperium-gold/20 transition-all group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-imperium-gold flex items-center justify-center shrink-0">
                            <Crown className="text-imperium-bg w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-imperium-gold font-semibold tracking-wide">
                                Upgrade to Premium
                            </h3>
                            <p className="text-white/50 text-sm">
                                $20/month · all 28 units, daily briefs, inner circle
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-imperium-gold shrink-0 transition-transform group-hover:translate-x-1" />
                    </a>
                )}

                {/* Sign out */}
                <div className="mt-12 pt-6 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold tracking-[0.25em] uppercase rounded-lg text-white/40 hover:text-white hover:bg-white/[0.03] transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

function PortalLink({
    href,
    icon,
    title,
    subtitle,
    external,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    external?: boolean;
}) {
    const baseClasses =
        "group relative flex items-center gap-4 p-5 sm:p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/30 hover:bg-white/[0.04] transition-all";
    const inner = (
        <>
            <div className="w-11 h-11 rounded-xl bg-imperium-gold/10 border border-imperium-gold/20 flex items-center justify-center text-imperium-gold shrink-0">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">
                    {title}
                </h3>
                <p className="text-white/40 text-sm">{subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-imperium-gold/50 shrink-0 transition-transform group-hover:translate-x-1" />
        </>
    );

    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
                {inner}
            </a>
        );
    }

    return (
        <Link href={href} className={baseClasses}>
            {inner}
        </Link>
    );
}
