"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Users, Package, Mail, Search, PlusCircle, Loader2, Crown, TrendingUp, BookOpen, LogOut, ShoppingBag, X, ChevronLeft, ChevronRight, Settings, Send, RefreshCw, Check, AlertCircle, Eye, MousePointer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Metrics {
    total_users: number;
    premium_subscribers: number;
    free_newsletter_opens: number;
    premium_newsletter_opens: number;
    active_30d_users: number;
    total_network_revenue: number;
    avg_purchases_per_user: number;
}

type AdminTab = "crm" | "inventory" | "comms" | "principles" | "settings" | "analytics";
type UserView = "free" | "premium" | "admin";

/** Row shape used by the CRM profile list. */
interface ProfileRow {
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    is_premium?: boolean | null;
    is_subscribed?: boolean | null;
    subscription_status?: string | null;
    purchase_count?: number | null;
    total_spent?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    last_purchase_at?: string | null;
}

/** Row shape used by the client health table. */
interface ClientHealthRow {
    id: string;
    profile_id: string;
    health_score?: number | null;
    engagement_trend?: string | null;
    purchases?: number | null;
    lifetime_spend?: number | null;
    last_activity_at?: string | null;
    last_purchase_at?: string | null;
    at_risk_score?: number | null;
}

/** Row shape used by the inventory table. */
interface ProductRow {
    id: string;
    name?: string | null;
    category?: string | null;
    description?: string | null;
    price?: number | null;
    image_url?: string | null;
    stripe_url?: string | null;
    payment_link_url?: string | null;
    in_stock?: boolean | null;
    sold_count?: number | null;
    available_stock?: number | null;
    created_at?: string | null;
}

/** Payload returned by /api/check-payment-links for a single product. */
interface LinkStatus {
    active: boolean;
    found: boolean;
    url: string | null;
}

type LinkStatusMap = Record<string, LinkStatus>;

/** The datasets the console renders, read through the admin API. */
interface ConsolePayload {
    profiles: ProfileRow[];
    products: ProductRow[];
    newsletters: NewsletterRow[];
    newsletterSendEvents: NewsletterSendEvent[];
    metrics: Metrics | null;
    stats: { profiles: number; products: number; subs: number };
}

/**
 * Calls an admin API with the operator's access token.
 *
 * The operator-only routes check the caller's session server side, so every
 * request the dashboard makes has to carry the token. This returns the raw
 * response for the callers that read the status code themselves.
 */
async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return fetch(input, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers || {}),
        },
    });
}

/**
 * Calls the admin console API with the operator's access token.
 *
 * The console used to read and write `profiles`, `products` and `newsletters`
 * from the browser with the anon key. Those reads come back empty under the
 * fleet's RLS policies, so the console showed blank tables and its save
 * buttons failed silently. The server reads them with the service-role key
 * and checks the caller's session.
 */
async function consoleFetch<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await adminFetch(input, init);

    if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Admin request failed (${response.status}) ${detail}`.trim());
    }

    return (await response.json()) as T;
}

/** Row shape used by the newsletter archive. */
interface NewsletterRow {
    id: string;
    title: string;
    content?: string | null;
    image_url?: string | null;
    is_public?: boolean | null;
    published?: boolean | null;
    created_at?: string | null;
    sent_at?: string | null;
    recipient_count?: number | null;
}

/** Minimal newsletter subscriber projection used for the stats counters. */
interface SubscriberRow {
    is_premium?: boolean | null;
    newsletter_subscribed?: boolean | null;
}

/** Payload stored on a `newsletter_sent` event. */
interface SendEventPayload {
    sentAt?: string;
    recipientCount?: number;
}

/** Row shape returned by the `inbound_imperium_events` newsletter_sent query. */
interface NewsletterSendEvent {
    target_id?: string | null;
    payload?: SendEventPayload | null;
    created_at?: string | null;
}

/** Body returned by /api/newsletter/send. */
interface NewsletterSendResponse {
    success?: boolean;
    recipientCount?: number;
    error?: string;
}

/** Result payload from the product sync endpoint. */
interface SyncResult {
    message?: string;
    results?: unknown;
    [key: string]: unknown;
}

/**
 * Narrow an unknown thrown value to a displayable message, keeping the
 * previous `error.message || fallback` semantics.
 */
function toErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message) return message;
    }
    return fallback;
}

/*
 * Sidebar collapse state lives in localStorage. It is read through
 * useSyncExternalStore so the initial value is derived from the store
 * (server snapshot is always false) instead of being copied into state
 * from an effect. The in-memory mirror keeps the "close the mobile drawer
 * without persisting the preference" behaviour intact.
 */
const COLLAPSED_KEY = "cc_collapsed";
const COLLAPSED_EVENT = "cc_collapsed_change";

let collapsedSnapshot = false;
let collapsedLoaded = false;

function readCollapsed(): boolean {
    if (collapsedLoaded) return collapsedSnapshot;
    collapsedLoaded = true;
    try {
        collapsedSnapshot = localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {
        collapsedSnapshot = false;
    }
    return collapsedSnapshot;
}

function subscribeCollapsed(onStoreChange: () => void): () => void {
    window.addEventListener(COLLAPSED_EVENT, onStoreChange);
    return () => window.removeEventListener(COLLAPSED_EVENT, onStoreChange);
}

/** Collapse the sidebar for this session only (the preference is not saved). */
function collapseSidebar(): void {
    collapsedLoaded = true;
    collapsedSnapshot = true;
    window.dispatchEvent(new Event(COLLAPSED_EVENT));
}

/** Toggle the sidebar and save the preference, as the previous control did. */
function toggleSidebar(): void {
    const next = !readCollapsed();
    collapsedLoaded = true;
    collapsedSnapshot = next;
    try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
        // storage unavailable
    }
    window.dispatchEvent(new Event(COLLAPSED_EVENT));
}

export default function AdminDashboard() {
    const { user, profile, signOut, loading } = useAuth();
    const userView = resolveUserView(user, profile, loading);
    const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
    const [stats, setStats] = useState({ profiles: 0, products: 0, subs: 0 });

    const router = useRouter();

    useEffect(() => {
        if (userView !== "admin") return;

        // The fetch runs inside an async callback so the state updates land
        // after the await instead of synchronously inside the effect body.
        (async () => {
            try {
                const payload = await consoleFetch<ConsolePayload>("/api/admin/console");

                if (payload.metrics) {
                    setMetrics(payload.metrics);
                }

                setStats({
                    profiles: payload.stats.profiles,
                    products: payload.stats.products,
                    subs: payload.stats.subs,
                });
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        })();
    }, [userView]);

    const handleSignOut = async () => {
        await signOut();
    };

    useEffect(() => {
        // only redirect after we've resolved the userView
        if (loading || userView === null) return;

        // redirect unauthenticated users and non-admins to /portal
        if (!user || userView !== "admin") {
            router.replace("/portal");
        }
    }, [loading, user, userView, router]);

    if (loading || userView === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    const adminTabs = [
        { id: "analytics" as AdminTab, label: "Analytics", icon: TrendingUp },
        { id: "crm" as AdminTab, label: "Client CRM", icon: Users },
        { id: "inventory" as AdminTab, label: "Inventory", icon: Package },
        { id: "comms" as AdminTab, label: "Newsletter Studio", icon: Mail },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
            {/* Backdrop for mobile when expanded */}
            {!collapsed && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40"
                    onClick={() => collapseSidebar()}
                    aria-hidden={true}
                />
            )}

            {/* Left Sidebar - on mobile: fixed when expanded (overlay), part of flow when collapsed */}
            <aside className={`
                ${collapsed ? 'w-16 relative z-0 md:fixed md:left-0 md:top-[72px] md:bottom-0 md:z-90' : 'w-56 fixed left-0 top-[72px] bottom-0 z-90'}
                border-r border-imperium-gold/20 bg-gradient-to-b from-gray-900 to-gray-800 flex-shrink-0 flex flex-col transition-all
            `}>
                <div className="p-2 sm:p-4 border-b border-imperium-gold/20 flex items-center min-h-[57px] relative">
                    <h1 className={`text-lg sm:text-xl font-light text-white tracking-tight absolute left-2 sm:left-4 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Command Center</h1>
                    <div className={`flex items-center ${collapsed ? 'w-full justify-center' : 'ml-auto'}`}>
                        <button
                            onClick={() => toggleSidebar()}
                            className="flex items-center justify-center w-7 h-7 rounded-lg border border-imperium-gold/30 text-imperium-gold/60 hover:text-imperium-gold hover:border-imperium-gold/50"
                            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                        >
                            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>
                </div>


                <div className="flex-1 overflow-hidden">
                    <nav className="p-2 sm:p-4 space-y-2">
                        {adminTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                }}
                                className={`
                                    flex items-center w-full text-[11px] font-medium tracking-wider uppercase rounded-lg
                                    ${collapsed ? 'px-1 justify-center aspect-square' : 'px-3 py-2.5 gap-4'}
                                    ${activeTab === tab.id
                                        ? "bg-imperium-gold/10 text-imperium-gold border border-imperium-gold/20"
                                        : "text-white/40 hover:text-white hover:bg-white/[0.02]"}
                                `}
                            >
                                <tab.icon className="w-5 h-5 flex-shrink-0" />
                                <span className={`${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-2 sm:p-4 border-t border-imperium-gold/20">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`flex items-center ${collapsed ? 'justify-center px-1 aspect-square' : 'gap-2 px-3 py-2.5'} rounded-lg text-[11px] font-medium tracking-wider uppercase text-white/30 hover:text-white hover:bg-white/[0.02]`}
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            <span className={`${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Settings</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content - no margin on mobile (overlaps), margin on desktop */}
            <main className="flex-1 overflow-auto">
                <div className={`p-4 sm:p-6 lg:p-8 ${collapsed ? 'ml-16 md:ml-16' : 'ml-0 md:ml-56'}`}>
                    {activeTab === "analytics" && <AnalyticsView metrics={metrics} stats={stats} />}
                    {activeTab === "crm" && <CRMView />}
                    {activeTab === "inventory" && <ProductManager />}
                    {activeTab === "comms" && <NewsletterStudio />}
                    {activeTab === "settings" && <SettingsView />}
                </div>
            </main>

            {/* Menu Popup Drawer */}
            {menuOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-[72px] h-[calc(100vh-72px)] w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-l border-imperium-gold/20 flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-imperium-gold/20">
                            <span className="text-lg font-light text-white tracking-tight">Command Center</span>
                            <button
                                onClick={() => setMenuOpen(false)}
                                className="p-2 rounded-md text-white/40 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            {adminTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setMenuOpen(false);
                                    }}
                                    className={`
                                        flex items-center w-full px-4 py-3 text-[11px] font-medium tracking-wider uppercase rounded-lg gap-4
                                        ${activeTab === tab.id
                                            ? "bg-imperium-gold/10 text-imperium-gold border border-imperium-gold/20"
                                            : "text-white/40 hover:text-white hover:bg-white/[0.02]"}
                                    `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                            <Link
                                href="/account"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center w-full px-4 py-3 text-[11px] font-medium tracking-wider uppercase rounded-lg gap-4 text-white/40 hover:text-white hover:bg-white/[0.02]"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    handleSignOut();
                                    setMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-3 text-[11px] font-medium tracking-wider uppercase rounded-lg gap-4 text-white/40 hover:text-white hover:bg-white/[0.02]"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Resolve which kind of signed-in user is looking at the dashboard. The value
 * is derived from the auth state instead of being mirrored into React state
 * from an effect.
 */
function resolveUserView(
    user: { id: string } | null,
    profile: { is_admin: boolean; is_premium: boolean; subscription_status: string | null } | null,
    loading: boolean
): UserView | null {
    if (loading) return null;

    if (user && profile) {
        if (profile.is_admin) return "admin";
        if (profile.is_premium || profile.subscription_status === "active") return "premium";
        return "free";
    }

    if (!user) return "free";

    // Signed in but the profile is still loading — wait for it before deciding.
    return null;
}

/**
 * Client health derived from the profile row itself.
 *
 * There is no `client_health` table in the live database, so the score is
 * computed from the columns `profiles` actually has: purchase count, lifetime
 * spend, and how recently the account was active.
 */
function deriveClientHealth(profiles: ProfileRow[], now: number): ClientHealthRow[] {
    const day = 24 * 60 * 60 * 1000;

    return profiles
        .filter((profile) => profile.is_premium || profile.subscription_status === 'active')
        .map((profile) => {
            const lastActivity = profile.updated_at ? new Date(profile.updated_at).getTime() : null;
            const lastPurchase = profile.last_purchase_at ? new Date(profile.last_purchase_at).getTime() : null;
            const purchases = profile.purchase_count || 0;
            const spend = profile.total_spent || 0;

            let score = 50;
            score += Math.min(purchases * 10, 30);
            if (lastPurchase !== null && now - lastPurchase <= 30 * day) score += 15;
            if (lastActivity !== null && now - lastActivity <= 7 * day) score += 15;
            if (lastActivity !== null && now - lastActivity > 30 * day) score -= 25;
            score = Math.max(0, Math.min(100, score));

            const trend = lastActivity === null
                ? 'stable'
                : now - lastActivity <= 7 * day
                    ? 'growing'
                    : now - lastActivity > 30 * day
                        ? 'declining'
                        : 'stable';

            const atRisk = lastActivity !== null && now - lastActivity > 30 * day
                ? 80
                : lastActivity !== null && now - lastActivity > 14 * day
                    ? 50
                    : score < 30
                        ? 60
                        : 0;

            return {
                id: profile.id,
                profile_id: profile.id,
                health_score: score,
                engagement_trend: trend,
                purchases,
                lifetime_spend: spend,
                last_activity_at: profile.updated_at ?? null,
                last_purchase_at: profile.last_purchase_at ?? null,
                at_risk_score: atRisk,
            };
        })
        .sort((a, b) => (a.health_score || 0) - (b.health_score || 0));
}

// Analytics View Component
function AnalyticsView({ metrics, stats }: { metrics: Metrics | null; stats: { profiles: number; products: number; subs: number } }) {
    const [loading, setLoading] = useState(false);

    const refreshMetrics = async () => {
        setLoading(true);
        try {
            await adminFetch('/api/admin/refresh-metrics', { method: 'POST' });
        } catch (e) {
            console.error('Failed to refresh metrics:', e);
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Analytics</h2>
                <button
                    onClick={refreshMetrics}
                    disabled={loading}
                    className="flex items-center gap-2 border border-imperium-gold/30 text-imperium-gold text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg hover:bg-imperium-gold/10 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-6 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Total Users</span>
                    <div className="text-2xl font-light text-white mt-1">{metrics?.total_users || stats.profiles || 0}</div>
                    <div className="text-xs text-white/20 mt-1">Registered accounts</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-6 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Premium Clients</span>
                    <div className="text-2xl font-light text-imperium-gold mt-1">{metrics?.premium_subscribers || 0}</div>
                    <div className="text-xs text-white/20 mt-1">Active subscriptions</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-6 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Total Revenue</span>
                    <div className="text-2xl font-light text-white mt-1">${(metrics?.total_network_revenue || 0).toLocaleString()}</div>
                    <div className="text-xs text-white/20 mt-1">All time</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-6 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Active (30d)</span>
                    <div className="text-2xl font-light text-green-400 mt-1">{metrics?.active_30d_users || 0}</div>
                    <div className="text-xs text-white/20 mt-1">Active users</div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider mb-2">
                        <ShoppingBag className="w-3 h-3" /> Products
                    </div>
                    <div className="text-xl font-light text-white">{stats.products || 0}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider mb-2">
                        <Mail className="w-3 h-3" /> Newsletter
                    </div>
                    <div className="text-xl font-light text-white">{stats.subs || 0}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider mb-2">
                        <TrendingUp className="w-3 h-3" /> Avg Orders
                    </div>
                    <div className="text-xl font-light text-white">{metrics?.avg_purchases_per_user?.toFixed(1) || '0.0'}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider mb-2">
                        <Crown className="w-3 h-3" /> LTV
                    </div>
                    <div className="text-xl font-light text-imperium-gold">
                        ${((metrics?.total_network_revenue || 0) / Math.max(metrics?.premium_subscribers || 1, 1)).toFixed(0)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-[#0f131a] border border-white/[0.08] p-6 sm:p-6 rounded-xl">
                    <h4 className="text-[10px] font-bold uppercase text-white/20 mb-4 tracking-wider">Newsletter</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-white/50 text-sm">Free Opens</span>
                            <span className="text-white text-base font-light">{metrics?.free_newsletter_opens || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50 text-sm">Premium Opens</span>
                            <span className="text-imperium-gold text-base font-light">{metrics?.premium_newsletter_opens || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f131a] border border-white/[0.08] p-6 sm:p-6 rounded-xl">
                    <h4 className="text-[10px] font-bold uppercase text-white/20 mb-4 tracking-wider">Revenue</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-white/50 text-sm">Total Revenue</span>
                            <span className="text-white text-base font-light">${(metrics?.total_network_revenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50 text-sm">Avg. Purchases</span>
                            <span className="text-white text-base font-light">{metrics?.avg_purchases_per_user || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// CRM View Component with Smart Lists
function CRMView() {
    const [leads, setLeads] = useState<ProfileRow[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeList, setActiveList] = useState<'free' | 'subscribers' | 'clients' | 'nurture' | 'health'>('clients');
    const [clientHealth, setClientHealth] = useState<ClientHealthRow[]>([]);

    useEffect(() => {
        // The fetch runs inside an async callback so the state updates land
        // after the await instead of synchronously inside the effect body.
        (async () => {
            try {
                const payload = await consoleFetch<ConsolePayload>("/api/admin/console");
                const profilesData = payload.profiles || [];

                setLeads(profilesData);

                // There is no `client_health` table, so health is derived from the
                // profile rows themselves.
                setClientHealth(deriveClientHealth(profilesData, Date.now()));
            } catch (err) {
                console.error("Failed to load profiles:", err);
            }
        })();
    }, [activeList]);

    // Filter leads based on active smart list
    // CRITICAL: Premium users (clients) are EXCLUDED from free, subscriber, and nurture lists
    const getFilteredLeads = () => {
        let filtered = leads;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(l =>
                l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply smart list filter
        switch (activeList) {
            case 'free':
                // Free users: NOT premium, NOT subscribed, NO purchases
                filtered = filtered.filter(l =>
                    !l.is_premium &&
                    l.subscription_status !== 'active' &&
                    (l.purchase_count === 0 || !l.purchase_count)
                );
                break;
            case 'subscribers':
                // Subscribers: subscribed but NOT premium (newsletter subscribers)
                filtered = filtered.filter(l =>
                    l.is_subscribed &&
                    !l.is_premium &&
                    l.subscription_status !== 'active'
                );
                break;
            case 'clients':
                // Clients (Premium Users): Active premium or subscription
                filtered = filtered.filter(l =>
                    l.is_premium ||
                    l.subscription_status === 'active'
                );
                break;
            case 'nurture':
                // Nurture: Free users with email but no purchase, not premium
                filtered = filtered.filter(l =>
                    !l.is_premium &&
                    l.subscription_status !== 'active' &&
                    l.email &&
                    (l.purchase_count === 0 || !l.purchase_count || l.total_spent === 0)
                );
                break;
            case 'health':
                filtered = [];
                break;
        }

        return filtered;
    };

    const filteredLeads = getFilteredLeads();

    // Get health data for a profile
    const getHealthForProfile = (profileId: string) => {
        return clientHealth.find(h => h.profile_id === profileId);
    };

    // Get health color based on score
    const getHealthColor = (score: number | null | undefined) => {
        const value = score ?? 0;
        if (value >= 70) return 'text-green-400';
        if (value >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const listTabs = [
        { id: 'clients' as const, label: 'Clients', icon: Crown, count: leads.filter(l => l.is_premium || l.subscription_status === 'active').length },
        { id: 'free' as const, label: 'Free Users', icon: Users, count: leads.filter(l => !l.is_premium && l.subscription_status !== 'active' && (l.purchase_count === 0 || !l.purchase_count)).length },
        { id: 'subscribers' as const, label: 'Subscribers', icon: Mail, count: leads.filter(l => l.is_subscribed && !l.is_premium && l.subscription_status !== 'active').length },
        { id: 'nurture' as const, label: 'Nurture', icon: BookOpen, count: leads.filter(l => !l.is_premium && l.subscription_status !== 'active' && l.email && (l.purchase_count === 0 || !l.purchase_count)).length },
        { id: 'health' as const, label: 'Client Health', icon: TrendingUp, count: clientHealth.length },
    ];

    // Client Health View
    if (activeList === 'health') {
        return (
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-light text-white">Client Health</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40">{clientHealth.length} clients tracked</span>
                    </div>
                </div>

                {clientHealth.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-white/20 text-sm border border-dashed border-white/5 rounded-2xl">
                        No client health data yet. Client health is tracked for premium members.
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="text-[10px] text-white/20 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                                    <th className="pb-3 font-bold">Client</th>
                                    <th className="pb-3 font-bold">Health Score</th>
                                    <th className="pb-3 font-bold">Trend</th>
                                    <th className="pb-3 font-bold">Purchases</th>
                                    <th className="pb-3 font-bold">Lifetime Spend</th>
                                    <th className="pb-3 font-bold">Last Active</th>
                                    <th className="pb-3 font-bold">Last Purchase</th>
                                    <th className="pb-3 font-bold">At Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {clientHealth.map((h) => {
                                    const profile = leads.find(l => l.id === h.profile_id);
                                    return (
                                        <tr key={h.id} className="group hover:bg-white/[0.02] text-sm text-white/50">
                                            <td className="py-3 sm:py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-imperium-gold/10 flex items-center justify-center">
                                                        <Crown className="w-4 h-4 text-imperium-gold" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white/80 font-medium">
                                                            {profile?.first_name || profile?.last_name ?
                                                                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() :
                                                                profile?.email || '—'}
                                                        </div>
                                                        <div className="text-white/20 text-xs">{profile?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 sm:py-4">
                                                <div className={`text-lg font-bold ${getHealthColor(h.health_score || 50)}`}>
                                                    {h.health_score || 50}
                                                </div>
                                            </td>
                                            <td className="py-3 sm:py-4">
                                                <span className={`text-xs uppercase tracking-wider ${
                                                    h.engagement_trend === 'growing' ? 'text-green-400' :
                                                    h.engagement_trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
                                                }`}>
                                                    {h.engagement_trend || 'stable'}
                                                </span>
                                            </td>
                                            <td className="py-3 sm:py-4">{h.purchases || 0}</td>
                                            <td className="py-3 sm:py-4">${(h.lifetime_spend || 0).toFixed(2)}</td>
                                            <td className="py-3 sm:py-4 text-xs">
                                                {h.last_activity_at ? new Date(h.last_activity_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-3 sm:py-4 text-xs">
                                                {h.last_purchase_at ? new Date(h.last_purchase_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-3 sm:py-4">
                                                {(h.at_risk_score || 0) > 50 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-[10px] uppercase tracking-wider rounded-full">
                                                        At Risk
                                                    </span>
                                                ) : (
                                                    <span className="text-white/20 text-xs">Healthy</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Client CRM</h2>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56 bg-black/40 border border-white/10 text-white text-xs px-10 py-2.5 rounded-lg focus:outline-none focus:border-imperium-gold/50"
                    />
                </div>
            </div>

            {/* Smart List Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {listTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveList(tab.id)}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-medium tracking-wider uppercase whitespace-nowrap
                            ${activeList === tab.id
                                ? "bg-imperium-gold/10 text-imperium-gold border border-imperium-gold/20"
                                : "text-white/40 hover:text-white hover:bg-white/[0.02] border border-transparent"}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        <span className="ml-1 px-1.5 py-0.5 bg-white/5 rounded text-white/30">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* List Info */}
            <div className="mb-4 flex items-center gap-4 text-xs text-white/30">
                <span>Showing {filteredLeads.length} {activeList === 'clients' ? 'clients' : 'users'}</span>
                {activeList === 'clients' && (
                    <span className="text-imperium-gold">Premium members only</span>
                )}
                {(activeList === 'free' || activeList === 'subscribers' || activeList === 'nurture') && (
                    <span className="text-white/20">Excludes premium clients</span>
                )}
            </div>

            {filteredLeads.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-white/20 text-sm border border-dashed border-white/5 rounded-2xl">
                    No {activeList === 'clients' ? 'clients' : 'users'} found in this list.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                    <table className="w-full text-left min-w-[500px]">
                        <thead>
                            <tr className="text-[10px] text-white/20 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                                <th className="pb-3 font-bold">Name</th>
                                <th className="pb-3 font-bold">Email</th>
                                <th className="pb-3 font-bold">Status</th>
                                <th className="pb-3 font-bold">Spent</th>
                                <th className="pb-3 font-bold">Orders</th>
                                <th className="pb-3 font-bold">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredLeads.map((l) => {
                                const health = getHealthForProfile(l.id);
                                return (
                                    <tr key={l.id} className="group hover:bg-white/[0.02] text-sm text-white/50">
                                        <td className="py-3 sm:py-4">
                                            <div className="flex items-center gap-2">
                                                {l.is_premium || l.subscription_status === 'active' ? (
                                                    <Crown className="w-4 h-4 text-imperium-gold" />
                                                ) : null}
                                                <span className="font-medium text-white/80">
                                                    {l.first_name || l.last_name ?
                                                        `${l.first_name || ''} ${l.last_name || ''}`.trim() :
                                                        '—'}
                                                </span>
                                                {health && activeList === 'clients' && (
                                                    <span className={`text-xs ${getHealthColor(health.health_score)}`}>
                                                        [{health.health_score}]
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 sm:py-4">{l.email || '—'}</td>
                                        <td className="py-3 sm:py-4">
                                            {l.is_premium || l.subscription_status === 'active' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-imperium-gold/10 text-imperium-gold text-[10px] uppercase tracking-wider rounded-full">
                                                    <Crown className="w-3 h-3" /> Premium
                                                </span>
                                            ) : l.is_subscribed ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-wider rounded-full">
                                                    <Mail className="w-3 h-3" /> Subscriber
                                                </span>
                                            ) : (
                                                <span className="text-white/20 text-[10px] uppercase tracking-wider">Free</span>
                                            )}
                                        </td>
                                        <td className="py-3 sm:py-4">${l.total_spent || 0}</td>
                                        <td className="py-3 sm:py-4">{l.purchase_count || 0}</td>
                                        <td className="py-3 sm:py-4 text-xs text-white/20">
                                            {l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Product Manager Component
function ProductManager() {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [linkStatuses, setLinkStatuses] = useState<LinkStatusMap | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', category: '', description: '', price: '', image_url: '', stripe_url: '', in_stock: true });

    useEffect(() => {
        (async () => {
            try {
                const payload = await consoleFetch<ConsolePayload>("/api/admin/console");
                setProducts(payload.products || []);
            } catch (err) {
                console.error("Failed to load products:", err);
            }
        })();
    }, []);

    const handleSyncStripe = async () => {
        setSyncing(true);
        setSyncResult(null);
        setSyncError(null);
        try {
            // fetch latest products from the admin API to ensure fresh data
            const payload = await consoleFetch<ConsolePayload>("/api/admin/console");
            const latestRows = (payload.products || []) as ProductRow[];
            // Sync any product missing a payment_link_url. This includes rows that may already have stripe_url but lack payment_link_url.
            const toSync = latestRows.filter((p) => !p.payment_link_url);

            if (toSync.length === 0) {
                setSyncing(false);
                setSyncResult({ message: 'No products to sync' });
                // still check link statuses for display
                const map: LinkStatusMap = {};
                latestRows.forEach((p) => {
                    map[p.id] = { active: !!p.payment_link_url, found: !!(p.payment_link_url || p.stripe_url), url: p.payment_link_url || p.stripe_url || null };
                });
                setLinkStatuses(map);
                return;
            }

            const response = await adminFetch('/api/sync-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: toSync }),
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Sync API error: ${response.status} ${text}`);
            }
            const result = (await response.json()) as SyncResult;
            setSyncResult(result);
            if (result.results) {
                const refreshedPayload = await consoleFetch<ConsolePayload>("/api/admin/console");
                const refreshedRows = (refreshedPayload.products || []) as ProductRow[];
                setProducts(refreshedRows);
                // After syncing, check link statuses for products
                try {
                    const checkRes = await adminFetch('/api/check-payment-links', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: refreshedRows }),
                    });
                    if (checkRes.ok) {
                        const { results } = (await checkRes.json()) as { results?: Array<LinkStatus & { id: string }> };
                        const map: LinkStatusMap = {};
                        results?.forEach((r) => (map[r.id] = r));
                        setLinkStatuses(map);
                    }
                } catch (e) {
                    console.warn('Failed to check payment links after sync:', e);
                }
            }
        } catch (err) {
            console.error('Sync error:', err);
            setSyncError(String(err));
        }
        setSyncing(false);
    };

    const openAdd = () => {
        setEditProduct(null);
        setForm({ name: '', category: '', description: '', price: '', image_url: '', stripe_url: '', in_stock: true });
        setShowAddModal(true);
    };

    const openEdit = (product: ProductRow) => {
        setEditProduct(product);
        setForm({
            name: product.name || '',
            category: product.category || '',
            description: product.description || '',
            price: String(product.price || ''),
            image_url: product.image_url || '',
            stripe_url: product.stripe_url || '',
            in_stock: product.in_stock !== false,
        });
        setShowAddModal(true);
    };

    const handleSaveProduct = async () => {
        if (!form.name.trim() || !form.price) return;
        setSaving(true);
        const payload = {
            name: form.name.trim(),
            category: form.category.trim() || 'general',
            description: form.description.trim(),
            price: parseFloat(form.price),
            image_url: form.image_url.trim() || null,
            stripe_url: form.stripe_url.trim() || null,
            in_stock: form.in_stock,
            updated_at: new Date().toISOString(),
        };

        if (editProduct) {
            await consoleFetch('/api/admin/console', {
                method: 'POST',
                body: JSON.stringify({ action: 'product.upsert', product: { ...payload, id: editProduct.id } }),
            });
        } else {
            await consoleFetch('/api/admin/console', {
                method: 'POST',
                body: JSON.stringify({ action: 'product.upsert', product: payload }),
            });
        }

        const refreshed = await consoleFetch<ConsolePayload>("/api/admin/console");
        setProducts((refreshed.products || []) as ProductRow[]);
        setShowAddModal(false);
        setSaving(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        await consoleFetch('/api/admin/console', {
            method: 'POST',
            body: JSON.stringify({ action: 'product.delete', id }),
        });
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div>
            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-gray-900 border border-imperium-gold/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-white font-light text-lg mb-6 uppercase tracking-wider">
                            {editProduct ? 'Edit Product' : 'Add Product'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-imperium-gold/50"
                                    placeholder="Product name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-imperium-gold/50"
                                        placeholder="shirts, hoodies..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Price *</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-imperium-gold/50"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-imperium-gold/50 resize-none h-20"
                                    placeholder="Product description"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-imperium-gold/50"
                                    placeholder="/products/image.jpg or https://..."
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Stripe Payment URL</label>
                                <input
                                    type="text"
                                    value={form.stripe_url}
                                    onChange={(e) => setForm(f => ({ ...f, stripe_url: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 text-white text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-imperium-gold/50"
                                    placeholder="https://buy.stripe.com/..."
                                />
                            </div>
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.in_stock}
                                    onChange={(e) => setForm(f => ({ ...f, in_stock: e.target.checked }))}
                                    className="rounded border-white/10 bg-black/40"
                                />
                                <span className="text-xs text-white/40 uppercase tracking-wider">In Stock</span>
                            </label>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleSaveProduct}
                                disabled={saving || !form.name.trim() || !form.price}
                                className="flex-1 py-3 bg-imperium-gold text-black text-xs font-bold tracking-widest uppercase rounded-lg hover:text-white transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : (editProduct ? 'Update' : 'Create')}
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-3 border border-white/10 text-white/40 text-xs font-bold tracking-widest uppercase rounded-lg hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Inventory</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleSyncStripe}
                        disabled={syncing}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-imperium-gold/30 text-imperium-gold text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg hover:bg-imperium-gold/10 transition-all disabled:opacity-50"
                    >
                        {syncing ? "Syncing..." : "Sync Stripe"}
                    </button>
                    <button
                        onClick={openAdd}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-imperium-gold text-imperium-bg text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg hover:text-white transition-all"
                    >
                        <PlusCircle className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-white/20 text-sm border border-dashed border-white/5 rounded-2xl">No products found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-6 rounded-xl group">
                            <div className="flex justify-between items-start mb-2 sm:mb-4">
                                <div className="flex-1 min-w-0 pr-3">
                                    <h4 className="text-white font-medium truncate">{product.name}</h4>
                                    <p className="text-white/40 text-xs">{product.category || 'Uncategorized'}</p>
                                </div>
                                <span className="text-imperium-gold font-light text-sm flex-shrink-0">${product.price || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-white/30">
                                <div className="flex gap-4">
                                    <span>Sold: {product.sold_count || 0}</span>
                                    <span>Stock: {product.available_stock || 0}</span>
                                </div>
                                {linkStatuses && linkStatuses[product.id] ? (
                                    linkStatuses[product.id].active ? (
                                        <span className="text-green-400">Active</span>
                                    ) : (
                                        <span className="text-red-400">Inactive</span>
                                    )
                                ) : product.payment_link_url || product.stripe_url ? (
                                    <span className="text-yellow-400">Checking...</span>
                                ) : (
                                    <span className="text-yellow-500">Not Connected</span>
                                )}
                            </div>
                            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(product)}
                                    className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-white/10 text-white/40 hover:text-white rounded-lg transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider border border-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {syncResult && (
                <div className="mt-6 p-4 rounded-xl bg-[#071018] border border-white/[0.04]">
                    <h4 className="text-sm text-white/40 mb-2">Sync Result</h4>
                    <pre className="text-xs text-white/60 overflow-auto">{JSON.stringify(syncResult, null, 2)}</pre>
                </div>
            )}
            {syncError && (
                <div className="mt-6 p-4 rounded-xl bg-[#2a0b0b] border border-red-600">
                    <h4 className="text-sm text-red-300 mb-2">Sync Error</h4>
                    <div className="text-xs text-red-200">{syncError}</div>
                </div>
            )}
        </div>
    );
}

// Settings View Component
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

// Newsletter Studio Component
function NewsletterStudio() {
    const [newsletters, setNewsletters] = useState<NewsletterRow[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterRow | null>(null);
    const [stats, setStats] = useState<{ free: number; premium: number; total: number }>({ free: 0, premium: 0, total: 0 });

    const loadData = useCallback(async () => {
        // `newsletters` has no sent_at / recipient_count columns in the live
        // database, so the send record lives in the tenant event log. Both
        // reads go through the admin API, where the fleet's RLS policies do
        // not apply.
        const payload = await consoleFetch<ConsolePayload>("/api/admin/console");

        const subs = (payload.profiles || []).filter(
            (row) => (row as { newsletter_subscribed?: boolean | null }).newsletter_subscribed === true,
        ) as SubscriberRow[];
        const free = subs.filter((s) => !s.is_premium).length;
        const premium = subs.filter((s) => s.is_premium).length;
        setStats({ free, premium, total: subs.length });

        const sentMap = new Map<string, { sent_at: string | null; recipient_count: number }>();
        for (const event of (payload.newsletterSendEvents || []) as NewsletterSendEvent[]) {
            const targetId = event.target_id;
            if (!targetId || sentMap.has(targetId)) continue;
            const eventPayload = event.payload || {};
            sentMap.set(targetId, {
                sent_at: event.created_at || eventPayload.sentAt || null,
                recipient_count: Number(eventPayload.recipientCount || 0),
            });
        }

        setNewsletters(
            ((payload.newsletters || []) as NewsletterRow[]).map((nl) => {
                const sent = sentMap.get(nl.id);
                return sent ? { ...nl, sent_at: sent.sent_at, recipient_count: sent.recipient_count } : nl;
            })
        );
    }, []);

    useEffect(() => {
        // The reload runs inside an async callback so the state updates land
        // after the await instead of synchronously inside the effect body.
        (async () => { await loadData(); })();
    }, [loadData]);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setSaving(true);

        await consoleFetch('/api/admin/console', {
            method: 'POST',
            body: JSON.stringify({
                action: 'newsletter.create',
                newsletter: {
                    title,
                    content,
                    is_public: isPublic,
                    published: false,
                    created_at: new Date().toISOString(),
                },
            }),
        });

        setTitle("");
        setContent("");
        setIsPublic(false);
        await loadData();
        setSaving(false);
        showToast('success', 'Newsletter saved as draft');
    };

    const handleSend = async (newsletterId: string) => {
        setSending(true);
        try {
            // The send route is operator-only, so the admin session token
            // travels with the request.
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({ newsletterId })
            });
            const result = (await response.json()) as NewsletterSendResponse;

            if (result.success) {
                showToast('success', `Sent to ${result.recipientCount} subscribers`);
                await loadData();
            } else {
                showToast('error', result.error || 'Failed to send');
            }
        } catch (error: unknown) {
            showToast('error', toErrorMessage(error, 'Failed to send newsletter'));
        }
        setSending(false);
    };

    const handleSendTest = async () => {
        if (!selectedNewsletter || !title.trim()) return;

        const testEmail = 'sitanim8@gmail.com';

        setSendingTest(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
                },
                body: JSON.stringify({
                    newsletterId: selectedNewsletter.id,
                    testMode: true,
                    testEmail
                })
            });
            const result = (await response.json()) as NewsletterSendResponse;

            if (result.success) {
                showToast('success', `Test sent to ${testEmail}`);
            } else {
                showToast('error', result.error || 'Failed to send test');
            }
        } catch (error: unknown) {
            showToast('error', toErrorMessage(error, 'Failed to send test'));
        }
        setSendingTest(false);
    };

    const handlePublish = async (id: string) => {
        await consoleFetch('/api/admin/console', {
            method: 'POST',
            body: JSON.stringify({ action: 'newsletter.publish', id }),
        });
        await loadData();
    };

    const handleSelectNewsletter = (nl: NewsletterRow) => {
        setSelectedNewsletter(nl);
        setTitle(nl.title);
        setContent(nl.content || '');
        setIsPublic(nl.is_public || false);
    };

    return (
        <div className="relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-900/90 border border-green-500' : 'bg-red-900/90 border border-red-500'
                }`}>
                    {toast.type === 'success' ? <Check className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span className="text-white text-sm">{toast.message}</span>
                </div>
            )}

            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Newsletter Studio</h2>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-white/40 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stats.total}</span>
                        <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-imperium-gold" /> {stats.premium}</span>
                    </div>
                </div>
            </div>

            {/* Subscriber Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Total</span>
                    <div className="text-xl font-light text-white mt-1">{stats.total}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Free</span>
                    <div className="text-xl font-light text-white mt-1">{stats.free}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 rounded-xl">
                    <span className="text-imperium-gold/60 text-[9px] uppercase tracking-wider font-bold">Premium</span>
                    <div className="text-xl font-light text-imperium-gold mt-1">{stats.premium}</div>
                </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <input
                    type="text"
                    placeholder="Subject line..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-imperium-gold/50"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <label className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded border-white/10 bg-black/40"
                    />
                    Public (free to view)
                </label>

                <textarea
                    className="w-full h-48 sm:h-64 bg-black/40 border border-white/10 rounded-lg p-4 text-white/70 text-sm font-light leading-relaxed focus:outline-none resize-none"
                    placeholder="Write your brief..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving || !title.trim()}
                            className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-white transition-colors disabled:opacity-30"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Draft'}
                        </button>
                        {selectedNewsletter && !selectedNewsletter.sent_at && (
                            <button
                                onClick={handleSendTest}
                                disabled={sendingTest || !title.trim()}
                                className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors disabled:opacity-30 flex items-center gap-1"
                            >
                                {sendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                                Test
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {selectedNewsletter && !selectedNewsletter.sent_at ? (
                            <button
                                onClick={() => handleSend(selectedNewsletter.id)}
                                disabled={sending || !title.trim()}
                                className="px-5 py-2.5 bg-imperium-gold text-imperium-bg rounded-lg text-[10px] font-bold uppercase tracking-wider hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Send Now
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={saving || !title.trim()}
                                className="px-5 py-2.5 bg-imperium-gold text-imperium-bg rounded-lg text-[10px] font-bold uppercase tracking-wider hover:text-white transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Newsletter Stats Panel */}
            {selectedNewsletter?.sent_at && (
                <div className="mb-6 p-4 bg-[#0f131a] border border-imperium-gold/20 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold uppercase text-imperium-gold tracking-wider">Sent Statistics</h4>
                        <button onClick={() => { setSelectedNewsletter(null); setTitle(''); setContent(''); setIsPublic(false); }} className="text-white/30 hover:text-white text-xs">
                            Clear
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <span className="text-white/30 text-[9px] uppercase tracking-wider">Recipients</span>
                            <div className="text-white text-lg font-light">{selectedNewsletter.recipient_count || 0}</div>
                        </div>
                        <div>
                            <span className="text-white/30 text-[9px] uppercase tracking-wider flex items-center gap-1"><Eye className="w-3 h-3" /> Opens</span>
                            <div className="text-white text-lg font-light">—</div>
                        </div>
                        <div>
                            <span className="text-white/30 text-[9px] uppercase tracking-wider flex items-center gap-1"><MousePointer className="w-3 h-3" /> Clicks</span>
                            <div className="text-white text-lg font-light">—</div>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/30">
                        Sent {selectedNewsletter.sent_at ? new Date(selectedNewsletter.sent_at).toLocaleString() : 'N/A'}
                    </div>
                </div>
            )}

            {newsletters.length > 0 && (
                <div>
                    <h4 className="text-sm font-light tracking-wide uppercase text-white/40 mb-4 sm:mb-4">Archives</h4>
                    <div className="space-y-2">
                        {newsletters.map((nl) => (
                            <div
                                key={nl.id}
                                onClick={() => handleSelectNewsletter(nl)}
                                className={`flex items-center justify-between bg-black/20 border p-4 rounded-lg cursor-pointer transition-all ${
                                    selectedNewsletter?.id === nl.id
                                        ? 'border-imperium-gold/50 bg-imperium-gold/5'
                                        : 'border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex-1 min-w-0 pr-3">
                                    <div className="text-white text-sm truncate">{nl.title}</div>
                                    <div className="text-white/30 text-xs flex items-center gap-2">
                                        {nl.created_at ? new Date(nl.created_at).toLocaleDateString() : ''}
                                        {nl.sent_at && <span className="text-green-400">• Sent</span>}
                                        {nl.sent_at && <span className="text-white/20">{nl.recipient_count} recipients</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {nl.sent_at ? (
                                        <span className="text-[10px] text-green-500 uppercase flex items-center gap-1">
                                            <Send className="w-3 h-3" /> Sent
                                        </span>
                                    ) : nl.published ? (
                                        <span className="text-[10px] text-yellow-500 uppercase">Published</span>
                                    ) : (
                                        <>
                                            <span className="text-[10px] text-white/30 uppercase">Draft</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePublish(nl.id); }}
                                                className="text-[10px] text-imperium-gold uppercase hover:underline"
                                            >
                                                Publish
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
