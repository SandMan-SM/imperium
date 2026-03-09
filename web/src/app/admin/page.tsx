"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Users, Package, Mail, Search, PlusCircle, ShieldCheck, Loader2, Crown, TrendingUp, BookOpen, LogOut, ShoppingBag, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

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

export default function AdminDashboard() {
    const { user, profile, signOut, loading } = useAuth();
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [userView, setUserView] = useState<UserView | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
    const [stats, setStats] = useState({ profiles: 0, products: 0, subs: 0 });
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        // determine userView only once profile/user loading is finished
        if (loading) return;

        if (user && profile) {
            if (profile.is_admin) {
                setUserView("admin");
            } else if (profile.is_premium || profile.subscription_status === "active") {
                setUserView("premium");
            } else {
                setUserView("free");
            }
        } else if (!user) {
            setUserView("free");
        }
    }, [user, profile, loading]);

    useEffect(() => {
        // initialize collapsed state from localStorage
        try {
            const v = localStorage.getItem('cc_collapsed');
            if (v !== null) setCollapsed(v === 'true');
        } catch (e) {
            // ignore
        }
    }, []);

    useEffect(() => {
        if (userView !== "admin") return;

        async function loadData() {
            try {
                const { data: metricsData } = await supabase
                    .from("live_retention_metrics")
                    .select("*")
                    .limit(1)
                    .single();

                if (metricsData) {
                    setMetrics(metricsData);
                }

                const [
                    { count: pCount },
                    { count: prodCount },
                    { count: sCount }
                ] = await Promise.all([
                    supabase.from("profiles").select("*", { count: 'exact', head: true }),
                    supabase.from("products").select("*", { count: 'exact', head: true }),
                    supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("is_subscribed", true)
                ]);
                setStats({ profiles: pCount || 0, products: prodCount || 0, subs: sCount || 0 });
            } catch (err) {
                console.error("Failed to load data:", err);
            }
        }
        loadData();
    }, [userView]);

    const handleSignOut = async () => {
        await signOut();
    };

    const router = useRouter();

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
            <div className="min-h-screen bg-imperium-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    const adminTabs = [
        { id: "analytics" as AdminTab, label: "Analytics", icon: TrendingUp },
        { id: "crm" as AdminTab, label: "Client CRM", icon: Users },
        { id: "inventory" as AdminTab, label: "Inventory", icon: Package },
        { id: "comms" as AdminTab, label: "Comms Studio", icon: Mail },
        { id: "settings" as AdminTab, label: "Settings", icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-imperium-bg flex">
            {/* Left Sidebar */}
            <aside className={`
                ${collapsed ? 'w-16' : 'w-56'} 
                border-r border-white/[0.08] bg-[#0a0e14] flex-shrink-0 flex flex-col 
                fixed md:relative left-0 top-[72px] bottom-0 md:top-0 z-40 
                transition-[width] duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-2 sm:p-4 border-b border-white/[0.06] flex items-center justify-between">
                    {!collapsed && <h1 className="text-lg sm:text-xl font-light text-white tracking-tight">Command Center</h1>}
                    {/* Single toggle button for both mobile close and desktop collapse */}
                    <button
                        onClick={() => {
                            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                // Mobile: close sidebar
                                setMobileOpen(false);
                            } else {
                                // Desktop: toggle collapse
                                setCollapsed((s) => {
                                    try { localStorage.setItem('cc_collapsed', String(!s)); } catch (e) {}
                                    return !s;
                                });
                            }
                        }}
                        className="p-2 rounded-md text-white/60 hover:text-white"
                        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                    >
                        {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <nav className="p-2 sm:p-4 space-y-2">
                        {adminTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    // Close mobile menu when selecting a tab
                                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                        setMobileOpen(false);
                                    }
                                }}
                                className={`
                                    flex items-center w-full text-[11px] font-medium tracking-wider uppercase transition-all duration-200 ease-in-out
                                    ${collapsed ? 'px-1 justify-center aspect-square rounded-lg' : 'px-3 py-2.5 gap-3 rounded-lg'} 
                                    ${activeTab === tab.id ? "bg-imperium-gold/10 text-imperium-gold border border-imperium-gold/20" : "text-white/40 hover:text-white hover:bg-white/[0.02]"}
                                `}
                            >
                                <tab.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200" />
                                {!collapsed && <span className="hidden sm:inline">{tab.label}</span>}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-2 sm:p-4 border-t border-white/[0.06]">
                    <div className="flex flex-col gap-2">
                        <Link href="/account" className={`flex items-center ${collapsed ? 'justify-center px-1 aspect-square rounded-lg' : 'gap-2 px-3 py-2.5 rounded-lg'} text-[11px] font-medium tracking-wider uppercase text-white/30 hover:text-white transition-all duration-200 ease-in-out hover:bg-white/[0.02]`}>
                            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Settings</span>}
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className={`flex items-center ${collapsed ? 'justify-center px-1 aspect-square rounded-lg' : 'gap-2 px-3 py-2.5 rounded-lg'} text-[11px] font-medium tracking-wider uppercase text-white/30 hover:text-white transition-all duration-200 ease-in-out hover:bg-white/[0.02]`}
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile only hamburger - shows when sidebar is hidden on mobile */}
            <button
                onClick={() => setMobileOpen(true)}
                className={`
                    md:hidden fixed top-[80px] left-4 z-50 p-2 bg-[#0a0e14] border border-white/[0.08] rounded-lg text-white/60 hover:text-white
                    transition-opacity duration-300
                    ${mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                `}
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay - shows when sidebar is open on mobile */}
            {mobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-30 top-[72px]"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main Content - no margin on mobile, margin on desktop for sidebar */}
            <main className="flex-1 overflow-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                    {activeTab === "analytics" && <AnalyticsView metrics={metrics} stats={stats} />}
                    {activeTab === "crm" && <CRMView />}
                    {activeTab === "inventory" && <ProductManager />}
                    {activeTab === "comms" && <NewsletterStudio />}
                    {activeTab === "settings" && <SettingsView />}
                </div>
            </main>
        </div>
    );
}

export function PortalLogin() {
    return (
        <div className="min-h-screen bg-imperium-bg flex items-center justify-center p-6">
            <div className="bg-[#0f131a] border border-white/[0.08] p-8 sm:p-10 rounded-2xl max-w-md w-full text-center">
                <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-5 border border-[#d4af37]/20">
                    <ShieldCheck className="text-[#d4af37] w-7 h-7" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase text-white mb-2">Portal Access</h2>
                <p className="text-[10px] text-white/40 mb-8 tracking-[0.15em] uppercase">Sign in to access your dashboard</p>
                <Link
                    href="/login"
                    className="block w-full bg-[#d4af37] text-[#030712] uppercase tracking-[0.18em] font-bold text-xs py-3.5 rounded-xl hover:bg-[#e8c84a] transition-all"
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
}

export function UserPortal({ userView }: { userView: "free" | "premium" }) {
    const { profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<"principles" | "newsletter">("principles");

    const handleSignOut = async () => {
        await signOut();
    };

    const portalTabs = [
        { id: "principles" as const, label: "28 Principles", icon: BookOpen, href: "/28principles" },
        { id: "newsletter" as const, label: "Newsletter", icon: Mail, href: "/newsletter" },
    ];

    return (
        <div className="min-h-screen bg-imperium-bg flex">
            {/* Left Sidebar (fixed to left edge) */}
            <aside className="fixed md:relative left-0 top-[72px] md:top-0 bottom-0 w-56 border-r border-white/[0.08] bg-[#0a0e14] flex-shrink-0 flex flex-col z-20">
                <div className="p-4 sm:p-6 border-b border-white/[0.06]">
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

                <div className="p-3 sm:p-4 border-t border-white/[0.06]">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 sm:px-4 py-2.5 text-[11px] font-medium tracking-wider uppercase text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/[0.02]"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-4 sm:p-6 sm:max-w-lg">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl text-white mb-2">Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}</h2>
                        <p className="text-white/40 text-sm">
                            {userView === "premium" 
                                ? "You have premium access to all content."
                                : "Upgrade to premium for full access to all content."}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:gap-4">
                        <Link href="/28principles" className="flex items-center gap-4 p-4 sm:p-5 bg-[#0f131a] border border-white/[0.08] rounded-xl hover:border-imperium-gold/20 transition-all group">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-imperium-gold/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="text-imperium-gold w-5 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium group-hover:text-imperium-gold transition-colors">28 Principles</h3>
                                <p className="text-white/40 text-sm">Access the Imperium doctrine</p>
                            </div>
                        </Link>

                        <Link href="/newsletter" className="flex items-center gap-4 p-4 sm:p-5 bg-[#0f131a] border border-white/[0.08] rounded-xl hover:border-imperium-gold/20 transition-all group">
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
                </div>
            </main>
        </div>
    );
}

function AnalyticsView({ metrics, stats }: { metrics: Metrics | null; stats: { profiles: number; products: number; subs: number } }) {
    return (
        <div>
            <h2 className="text-lg sm:text-xl font-light text-white mb-4 sm:mb-6">Analytics</h2>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-5 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Total Users</span>
                    <div className="text-2xl font-light text-white mt-1">{metrics?.total_users || stats.profiles}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-5 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Premium</span>
                    <div className="text-2xl font-light text-white mt-1">{metrics?.premium_subscribers || 0}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-5 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Revenue</span>
                    <div className="text-2xl font-light text-white mt-1">${(metrics?.total_network_revenue || 0).toLocaleString()}</div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-5 rounded-xl">
                    <span className="text-white/30 text-[9px] uppercase tracking-wider font-bold">Active (30d)</span>
                    <div className="text-2xl font-light text-white mt-1">{metrics?.active_30d_users || 0}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-[#0f131a] border border-white/[0.08] p-5 sm:p-6 rounded-xl">
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

                <div className="bg-[#0f131a] border border-white/[0.08] p-5 sm:p-6 rounded-xl">
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

function CRMView() {
    const [leads, setLeads] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setLeads(data || []));
    }, []);

    const filteredLeads = leads.filter(l => 
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
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

            {filteredLeads.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-white/20 text-sm border border-dashed border-white/5 rounded-2xl">No users found.</div>
            ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                    <table className="w-full text-left min-w-[400px]">
                        <thead>
                            <tr className="text-[10px] text-white/20 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                                <th className="pb-3 font-bold">Name</th>
                                <th className="pb-3 font-bold">Email</th>
                                <th className="pb-3 font-bold">Status</th>
                                <th className="pb-3 font-bold">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredLeads.map((l: any) => (
                                <tr key={l.id} className="group hover:bg-white/[0.02] text-sm text-white/50">
                                    <td className="py-3 sm:py-4 font-medium text-white/80">{l.first_name || l.last_name ? `${l.first_name || ''} ${l.last_name || ''}`.trim() : '—'}</td>
                                    <td className="py-3 sm:py-4">{l.email || '—'}</td>
                                    <td className="py-3 sm:py-4">
                                        {l.is_premium ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-imperium-gold/10 text-imperium-gold text-[10px] uppercase tracking-wider rounded-full">
                                                <Crown className="w-3 h-3" /> Premium
                                            </span>
                                        ) : (
                                            <span className="text-white/20 text-[10px] uppercase tracking-wider">Free</span>
                                        )}
                                    </td>
                                    <td className="py-3 sm:py-4 text-xs text-white/20">{l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function ProductManager() {
    const [products, setProducts] = useState<any[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<any | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [linkStatuses, setLinkStatuses] = useState<Record<string, { active: boolean; found: boolean; url: string | null }> | null>(null);

    useEffect(() => {
        supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => setProducts(data || []));
    }, []);

    const handleSyncStripe = async () => {
        setSyncing(true);
        setSyncResult(null);
        setSyncError(null);
        try {
            // fetch latest products from supabase to ensure fresh data
            const { data: latest } = await supabase.from('products').select('*');
            // Sync any product missing a payment_link_url. This includes rows that may already have stripe_url but lack payment_link_url.
            const toSync = (latest || []).filter((p: any) => !p.payment_link_url);

            if (toSync.length === 0) {
                setSyncing(false);
                setSyncResult({ message: 'No products to sync' });
                // still check link statuses for display
                const map: any = {};
                (latest || []).forEach((p: any) => {
                    map[p.id] = { active: !!p.payment_link_url, found: !!(p.payment_link_url || p.stripe_url), url: p.payment_link_url || p.stripe_url || null };
                });
                setLinkStatuses(map);
                return;
            }

            const response = await fetch('/api/sync-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: toSync }),
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Sync API error: ${response.status} ${text}`);
            }
            const result = await response.json();
            setSyncResult(result);
            if (result.results) {
                const { data: refreshed } = await supabase.from('products').select('*').order('created_at', { ascending: false });
                setProducts(refreshed || []);
                // After syncing, check link statuses for products
                try {
                    const checkRes = await fetch('/api/check-payment-links', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: refreshed || [] }),
                    });
                    if (checkRes.ok) {
                        const { results } = await checkRes.json();
                        const map: any = {};
                        results.forEach((r: any) => (map[r.id] = r));
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

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Inventory</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={handleSyncStripe}
                        disabled={syncing}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-imperium-gold/30 text-imperium-gold text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg hover:bg-imperium-gold/10 transition-all disabled:opacity-50"
                    >
                        {syncing ? "Syncing..." : "Sync Stripe"}
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-imperium-gold text-imperium-bg text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-lg hover:bg-white transition-all">
                        <PlusCircle className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 sm:py-16 text-white/20 text-sm border border-dashed border-white/5 rounded-2xl">No products found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-[#0f131a] border border-white/[0.08] p-4 sm:p-5 rounded-xl">
                            <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <div className="flex-1 min-w-0 pr-3">
                                    <h4 className="text-white font-medium truncate">{product.name}</h4>
                                    <p className="text-white/40 text-xs">{product.category || 'Uncategorized'}</p>
                                </div>
                                <span className="text-imperium-gold font-light text-sm flex-shrink-0">${product.price || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-white/30">
                                <div className="flex gap-3">
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

function SettingsView() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    useEffect(() => {
        supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => setProducts(data || []));
    }, []);

    const handleSyncMissing = useCallback(async () => {
        setLoading(true);
        try {
            // only send products missing payment link (stripe_url or payment_link_url)
            const toSync = products.filter(p => !p.stripe_url && !p.payment_link_url);

            if (toSync.length === 0) {
                setResult({ message: 'No products to sync' });
                setLoading(false);
                return;
            }

            const res = await fetch('/api/sync-products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: toSync }),
            });
            const data = await res.json();
            setResult(data);

            // refresh products list from supabase
            const { data: refreshed } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            setProducts(refreshed || []);
        } catch (err) {
            console.error('Settings sync error:', err);
            setResult({ error: String(err) });
        }
        setLoading(false);
    }, [products]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Settings</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSyncMissing}
                        disabled={loading}
                        className="border border-imperium-gold/30 text-imperium-gold text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-imperium-gold/10 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Syncing...' : 'Sync Stripe (missing)'}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-white/40 text-sm">This will create Stripe products/prices/payment links for any products missing a payment link.</p>
            </div>

            {result && (
                <div className="mb-6 p-4 rounded-xl bg-[#071018] border border-white/[0.04]">
                    <pre className="text-xs text-white/60 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}

            <div>
                <h3 className="text-sm text-white/40 mb-3">Products</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map(p => (
                        <div key={p.id} className="p-4 bg-[#0f131a] border border-white/[0.06] rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <div className="text-white font-medium">{p.name}</div>
                                    <div className="text-white/30 text-xs">{p.category || 'Uncategorized'}</div>
                                </div>
                                <div className="text-sm text-imperium-gold">${p.price || 0}</div>
                            </div>
                            <div className="text-xs text-white/40">
                                Stripe: {p.stripe_url ? <span className="text-green-400">Yes</span> : <span className="text-yellow-400">No</span>} · Payment Link: {p.payment_link_url ? <span className="text-green-400">Yes</span> : <span className="text-yellow-400">No</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function NewsletterStudio() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [newsletters, setNewsletters] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        supabase.from("profiles").select("*").eq("is_subscribed", true).order("created_at", { ascending: false }).then(({ data }) => setSubscribers(data || []));
        supabase.from("newsletters").select("*").order("created_at", { ascending: false }).then(({ data }) => setNewsletters(data || []));
    }, []);

    const handleSave = async () => {
        if (!title.trim()) return;
        setSaving(true);
        
        await supabase.from("newsletters").insert({
            title,
            content,
            is_public: isPublic,
            published: false,
            created_at: new Date().toISOString(),
        });

        setTitle("");
        setContent("");
        setIsPublic(false);
        supabase.from("newsletters").select("*").order("created_at", { ascending: false }).then(({ data }) => setNewsletters(data || []));
        setSaving(false);
    };

    const handlePublish = async (id: string) => {
        await supabase.from("newsletters").update({ published: true }).eq("id", id);
        supabase.from("newsletters").select("*").order("created_at", { ascending: false }).then(({ data }) => setNewsletters(data || []));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-light text-white">Comms Studio</h2>
                <div className="text-sm text-white/40">{subscribers.length} subscribers</div>
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

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={saving || !title.trim()}
                        className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white/30 hover:text-white transition-colors disabled:opacity-30"
                    >
                        Save Draft
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || !title.trim()}
                        className="px-5 py-2.5 bg-imperium-gold text-imperium-bg rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50"
                    >
                        Publish
                    </button>
                </div>
            </div>

            {newsletters.length > 0 && (
                <div>
                    <h4 className="text-sm font-light tracking-wide uppercase text-white/40 mb-3 sm:mb-4">Archives</h4>
                    <div className="space-y-2">
                        {newsletters.map((nl) => (
                            <div key={nl.id} className="flex items-center justify-between bg-black/20 border border-white/5 p-3 rounded-lg">
                                <div className="flex-1 min-w-0 pr-3">
                                    <div className="text-white text-sm truncate">{nl.title}</div>
                                    <div className="text-white/30 text-xs">{nl.created_at ? new Date(nl.created_at).toLocaleDateString() : ''}</div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {nl.published ? (
                                        <span className="text-[10px] text-green-500 uppercase">Published</span>
                                    ) : (
                                        <>
                                            <span className="text-[10px] text-white/30 uppercase">Draft</span>
                                            <button onClick={() => handlePublish(nl.id)} className="text-[10px] text-imperium-gold uppercase hover:underline">Publish</button>
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
