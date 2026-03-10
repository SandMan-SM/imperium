"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import AdminDashboard from "../admin/page";

export default function PortalPage() {
    const { user, profile, loading } = useAuth();

    // If still loading auth or profile is not yet fetched, render nothing to avoid flicker
    if (loading || (user && profile === null)) return null;

    // Unauthenticated -> redirect to login
    if (!user) {
        window.location.href = "/login";
        return null;
    }

    // Admins -> render admin dashboard inline (avoid client-side route replace loops)
    if (profile?.is_admin) {
        return <AdminDashboard />;
    }

    const userView = profile?.is_premium || profile?.subscription_status === 'active' ? 'premium' : 'free';

    return <UserPortal userView={userView} />;
}

// UserPortal component moved here since it's not exported from admin page
function UserPortal({ userView }: { userView: "free" | "premium" }) {
    const { profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<"principles" | "newsletter" | "settings">("principles");

    const handleSignOut = async () => {
        await signOut();
    };

    const portalTabs = [
        { id: "principles" as const, label: "28 Principles", icon: BookOpen, href: "/28principles" },
        { id: "newsletter" as const, label: "Newsletter", icon: Mail, href: "/newsletter" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
            {/* Left Sidebar (fixed to left edge) */}
            <aside className="fixed left-0 top-[72px] bottom-0 w-56 border-r border-imperium-gold/20 bg-gradient-to-b from-gray-900 to-gray-800 flex-shrink-0 flex flex-col z-40">
                <div className="p-4 sm:p-6 border-b border-imperium-gold/20">
                    <h1 className="text-lg sm:text-xl font-light text-white tracking-tight">Command Center</h1>
                </div>

                <nav className="flex-1 p-3 sm:p-4 space-y-1">
                    {portalTabs.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 text-[11px] font-medium tracking-wider uppercase rounded-lg text-white/40 hover:text-white hover:bg-white/[0.02] transition-all"
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden text-[10px]">{tab.label.split(' ')[0]}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-3 sm:p-4 border-t border-imperium-gold/20">
                    <button
                        onClick={() => setActiveTab("settings")}
                        className="flex items-center gap-2 w-full px-3 sm:px-4 py-2.5 text-[11px] font-medium tracking-wider uppercase text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/[0.02]"
                        aria-label="Open settings"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto ml-56">
                <div className="p-4 sm:p-6 sm:max-w-lg">
                    {activeTab === "settings" ? (
                        <SettingsView />
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl sm:text-3xl text-white mb-2">Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}</h2>
                                <p className="text-white/40 text-sm">
                                    {userView === "premium"
                                        ? "You have premium access to all content."
                                        : "Upgrade to premium for full access to all content."}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:gap-4">
                                <Link href="/28principles" className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group">
                                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="text-imperium-gold w-5 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">28 Principles</h3>
                                        <p className="text-white/40 text-sm">Access the Imperium doctrine</p>
                                    </div>
                                </Link>

                                <Link href="/newsletter" className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-imperium-gold/20 rounded-xl hover:border-imperium-gold/40 transition-all group">
                                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="text-imperium-gold w-5 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">Newsletter</h3>
                                        <p className="text-white/40 text-sm">View intelligence briefs</p>
                                    </div>
                                </Link>

                                {userView === "free" && (
                                    <a
                                        href="https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 sm:p-5 bg-imperium-gold/10 border border-imperium-gold/20 rounded-xl hover:bg-imperium-gold/20 transition-all group"
                                    >
                                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold flex items-center justify-center flex-shrink-0">
                                            <Crown className="text-imperium-bg w-5 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-imperium-gold font-medium">Upgrade to Premium</h3>
                                            <p className="text-white/40 text-sm">$20/month for full access</p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

// SettingsView component
function SettingsView() {
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div>
            <h2 className="text-lg sm:text-xl font-light text-white mb-6">Settings</h2>

            <div className="pt-6 border-t border-white/[0.06]">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-3 text-[11px] font-medium tracking-wider uppercase rounded-lg text-white/40 hover:text-white hover:bg-white/[0.02] w-full"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

// Import required components
import { useState } from "react";
import { BookOpen, Mail, Settings, LogOut, Crown } from "lucide-react";
import Link from "next/link";
