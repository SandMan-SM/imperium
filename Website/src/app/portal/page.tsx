"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminDashboard from "../admin/page";
import ReferralPanel from "./ReferralPanel";
import { BookOpen, Mail, Crown, Users, Video, Link as LinkIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { STRIPE_CHECKOUT_URL } from "@/lib/brand";

export default function PortalPage() {
    const { user, profile, loading } = useAuth();

    if (loading || (user && profile === null)) return null;

    if (!user) {
        // Internal navigation: use Next's redirect() instead of assigning
        // window.location.href during render.
        redirect("/login");
    }

    if (profile?.is_admin) {
        return <AdminDashboard />;
    }

    const userView = profile?.is_premium || profile?.subscription_status === 'active' ? 'premium' : 'free';

    return <UserPortal userView={userView} />;
}

function UserPortal({ userView }: { userView: "free" | "premium" }) {
    const { profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<"home" | "principles" | "newsletter" | "community" | "call" | "affiliate" | "settings">("home");

    const handleSignOut = async () => {
        await signOut();
    };

    if (userView === "premium") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                {/* Premium Banner */}
                <div className="bg-imperium-gold/10 border-b border-imperium-gold/30 px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
                        <Crown className="w-4 h-4 text-imperium-gold" />
                        <span className="text-imperium-gold text-sm font-medium">Premium Access Granted</span>
                    </div>
                </div>

                {/* Premium User Content - Full Width */}
                <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl text-white mb-2">Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}</h1>
                        <p className="text-white/40 text-sm">You have premium access to all content.</p>
                    </div>

                    <div className="grid gap-4 sm:gap-4">
                        <button
                            onClick={() => setActiveTab("principles")}
                            className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group text-left w-full"
                        >
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="text-imperium-gold w-5 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">28 Principles</h3>
                                <p className="text-white/40 text-sm">Access the Imperium doctrine</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("newsletter")}
                            className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group text-left w-full"
                        >
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                <Mail className="text-imperium-gold w-5 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">Premium Newsletter</h3>
                                <p className="text-white/40 text-sm">Exclusive intelligence briefs</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("community")}
                            className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group text-left w-full"
                        >
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                <Users className="text-imperium-gold w-5 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">Private Community</h3>
                                <p className="text-white/40 text-sm">Connect with premium members</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("call")}
                            className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group text-left w-full"
                        >
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                <Video className="text-imperium-gold w-5 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">1 on 1 Call</h3>
                                <p className="text-white/40 text-sm">Schedule your consultation</p>
                            </div>
                        </button>

                        {/* A member is the one who refers. The referral link
                            was only ever offered to free accounts, so a
                            paying member — the only person who can earn a
                            commission — could not get one. */}
                        <button
                            onClick={() => setActiveTab("affiliate")}
                            className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group text-left w-full"
                        >
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                <LinkIcon className="text-imperium-gold w-5 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">Referral Link</h3>
                                <p className="text-white/40 text-sm">Earn 30% commission on a referral</p>
                            </div>
                        </button>
                    </div>

                    {/* The premium buttons set a tab, so the tab has to
                        answer. Four of them used to set a tab that rendered
                        nothing at all — a button that does nothing is worse
                        than no button. */}
                    {activeTab === "principles" && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl">
                            <h3 className="text-white font-medium mb-2">28 Principles</h3>
                            <p className="text-white/40 text-sm mb-4">
                                The full sequence — five phases, twenty-eight units — is open to you.
                            </p>
                            <Link
                                href="/principles/"
                                className="inline-block bg-imperium-gold text-imperium-bg px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                            >
                                Continue the Doctrine
                            </Link>
                        </div>
                    )}

                    {activeTab === "newsletter" && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl">
                            <h3 className="text-white font-medium mb-2">Premium Newsletter</h3>
                            <p className="text-white/40 text-sm mb-4">
                                The Intelligence Brief, every week. Every published issue is on the archive.
                            </p>
                            <Link
                                href="/newsletter/"
                                className="inline-block bg-imperium-gold text-imperium-bg px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                            >
                                Read the brief
                            </Link>
                        </div>
                    )}

                    {activeTab === "community" && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl">
                            <h3 className="text-white font-medium mb-2">Private Community</h3>
                            <p className="text-white/40 text-sm">
                                The private room opens to members as the cohort fills. There is no door to
                                walk through yet — ask the Imperium team and you will be added.
                            </p>
                        </div>
                    )}

                    {activeTab === "call" && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl">
                            <h3 className="text-white font-medium mb-2">1 on 1 Call</h3>
                            <p className="text-white/40 text-sm">
                                The accountability call is booked directly with the Imperium team. Ask in
                                your reply to the weekly brief and it will be arranged.
                            </p>
                        </div>
                    )}

                    {activeTab === "affiliate" && <ReferralPanel />}

                    <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-3 text-[11px] font-medium tracking-wider uppercase rounded-lg text-white/40 hover:text-white hover:bg-white/[0.02] w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Free User Content - Full Width */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl text-white mb-2">Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}</h1>
                    <p className="text-white/40 text-sm">Upgrade to premium for full access to all content.</p>
                </div>

                <div className="grid gap-4 sm:gap-4">
                    <Link href="/28principles" className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="text-imperium-gold w-5 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">28 Principles</h3>
                            <p className="text-white/40 text-sm">Access the Imperium doctrine</p>
                        </div>
                    </Link>

                    <Link href="/newsletter" className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="text-imperium-gold w-5 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">Newsletter</h3>
                            <p className="text-white/40 text-sm">View intelligence briefs</p>
                        </div>
                    </Link>

                    <button
                        onClick={() => setActiveTab("affiliate")}
                        className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group text-left w-full"
                    >
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="text-imperium-gold w-5 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">Affiliate Program</h3>
                            <p className="text-white/40 text-sm">Earn commissions by referring others</p>
                        </div>
                    </button>

                    <a
                        href={STRIPE_CHECKOUT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 sm:p-6 bg-imperium-gold/10 border border-imperium-gold/20 rounded-xl hover:bg-imperium-gold/20 transition-all group"
                    >
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold flex items-center justify-center flex-shrink-0">
                            <Crown className="text-imperium-bg w-5 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-imperium-gold font-medium">Upgrade to Premium</h3>
                            <p className="text-white/40 text-sm">$20/month for full access</p>
                        </div>
                    </a>
                </div>

                {activeTab === "affiliate" && <ReferralPanel />}

                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-3 text-[11px] font-medium tracking-wider uppercase rounded-lg text-white/40 hover:text-white hover:bg-white/[0.02] w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
