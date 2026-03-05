"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Package, Mail, Search, PlusCircle, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [authError, setAuthError] = useState("");

    const [activeTab, setActiveTab] = useState<"crm" | "products" | "newsletters">("crm");
    const [stats, setStats] = useState({ clients: 0, products: 0, subs: 0 });

    useEffect(() => {
        // Check local storage for existing session
        if (typeof window !== "undefined" && localStorage.getItem("imperium_admin_auth") === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Keep existing admin creds for now as a "Sovereign" entry
        if (emailInput.toLowerCase().trim() === "sitanim6@gmail.com") {
            setIsAuthenticated(true);
            if (typeof window !== "undefined") {
                localStorage.setItem("imperium_admin_auth", "true");
                // Notify header to update
                window.dispatchEvent(new Event("imperium_auth_change"));
            }
        } else {
            setAuthError("Credential mismatch. Access denied.");
        }
    };

    useEffect(() => {
        // Only load stats if authenticated
        if (!isAuthenticated) return;

        async function loadStats() {
            try {
                const [
                    { count: cCount },
                    { count: pCount },
                    { count: sCount }
                ] = await Promise.all([
                    supabase.from("clients").select("*", { count: 'exact', head: true }),
                    supabase.from("products").select("*", { count: 'exact', head: true }),
                    supabase.from("newsletter_subscribers").select("*", { count: 'exact', head: true })
                ]);
                setStats({ clients: cCount || 0, products: pCount || 0, subs: sCount || 0 });
            } catch (err) {
                console.error("Failed to load stats:", err);
            }
        }
        loadStats();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
                <div className="bg-[#0f131a] border border-white/[0.08] p-10 rounded-2xl max-w-md w-full text-center relative overflow-hidden backdrop-blur-xl">

                    <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-6 border border-[#d4af37]/20">
                        <ShieldCheck className="text-[#d4af37] w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-bold tracking-[0.25em] uppercase text-white mb-2">Sovereign Access</h2>
                    <p className="text-[10px] text-white/40 mb-10 tracking-[0.2em] uppercase font-semibold">Verification Required for Clearance</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                setAuthError("");
                            }}
                            placeholder="Identity Email"
                            className="w-full bg-black/40 border border-white/10 text-white text-center px-6 py-4 rounded-xl focus:outline-none focus:border-[#d4af37] transition-all text-sm font-light placeholder:text-white/20"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#d4af37] text-[#030712] uppercase tracking-[0.2em] font-bold text-xs py-4 rounded-xl hover:bg-[#e8c84a] transition-all hover:scale-[1.02]"
                        >
                            Request Uplink
                        </button>
                    </form>

                    {authError && (
                        <div className="mt-6 text-red-500/80 text-[10px] tracking-[0.15em] uppercase font-bold bg-red-500/5 border border-red-500/10 py-3 rounded-lg">
                            {authError}
                        </div>
                    )}
                </div>

                <p className="mt-8 text-[10px] tracking-[0.2em] uppercase text-white/20 font-semibold">
                    Encrypted Protocol · Omni Level
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 border border-[#d4af37]/20 rounded-full bg-[#d4af37]/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                        <span className="text-[9px] font-bold tracking-[0.2em] text-[#d4af37] uppercase">Omni Level Cleared</span>
                    </div>
                    <h1 className="text-4xl font-light text-white tracking-tight">Command Center</h1>
                    <p className="text-white/40 font-light mt-2 text-sm">Oversee metrics and execute directives from the core.</p>
                </div>

                <div className="flex bg-black/40 border border-white/[0.08] rounded-xl overflow-hidden p-1">
                    <button onClick={() => setActiveTab("crm")} className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${activeTab === "crm" ? "bg-[#d4af37] text-[#030712]" : "text-white/30 hover:text-white hover:bg-white/5"}`}>Registry</button>
                    <button onClick={() => setActiveTab("products")} className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${activeTab === "products" ? "bg-[#d4af37] text-[#030712]" : "text-white/30 hover:text-white hover:bg-white/5"}`}>Arsenal</button>
                    <button onClick={() => setActiveTab("newsletters")} className={`px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${activeTab === "newsletters" ? "bg-[#d4af37] text-[#030712]" : "text-white/30 hover:text-white hover:bg-white/5"}`}>Comms</button>
                </div>
            </header>

            {/* KPI Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#0f131a] border border-white/[0.08] p-8 rounded-2xl flex items-center justify-between group hover:border-[#d4af37]/20 transition-all duration-300">
                    <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">Total Clients</span>
                        <div className="text-3xl font-light text-white mt-1">{stats.clients}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/10 flex items-center justify-center group-hover:bg-[#d4af37]/10 transition-all border-dashed">
                        <Users className="text-[#d4af37]/50 w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-8 rounded-2xl flex items-center justify-between group hover:border-[#d4af37]/20 transition-all duration-300">
                    <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">Active Arsenal</span>
                        <div className="text-3xl font-light text-white mt-1">{stats.products}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/10 flex items-center justify-center group-hover:bg-[#d4af37]/10 transition-all border-dashed">
                        <Package className="text-[#d4af37]/50 w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#0f131a] border border-white/[0.08] p-8 rounded-2xl flex items-center justify-between group hover:border-[#d4af37]/20 transition-all duration-300">
                    <div>
                        <span className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">Network Subs</span>
                        <div className="text-3xl font-light text-white mt-1">{stats.subs}</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/10 flex items-center justify-center group-hover:bg-[#d4af37]/10 transition-all border-dashed">
                        <Mail className="text-[#d4af37]/50 w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Dynamic Views */}
            <div className="bg-[#0f131a] border border-white/[0.08] rounded-2xl p-6 md:p-10 min-h-[500px]">
                {activeTab === "crm" && <CRMView />}
                {activeTab === "products" && <ProductManager />}
                {activeTab === "newsletters" && <NewsletterStudio />}
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => {
                        localStorage.removeItem("imperium_admin_auth");
                        setIsAuthenticated(false);
                        window.dispatchEvent(new Event("imperium_auth_change"));
                    }}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/20 hover:text-red-500/50 transition-colors"
                >
                    Terminate Session
                </button>
            </div>
        </div>
    );
}

// ------ Sub Components for Tabs ------

function CRMView() {
    const [leads, setLeads] = useState<any[]>([]);

    useEffect(() => {
        supabase.from("clients").select("*").order("created_at", { ascending: false }).then(({ data }) => setLeads(data || []));
    }, []);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <h3 className="text-lg font-light tracking-wide uppercase text-[#d4af37]">Client Registry</h3>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="text" placeholder="Search identities..." className="w-full sm:w-64 bg-black/40 border border-white/10 text-white text-xs px-10 py-3 rounded-xl focus:outline-none focus:border-[#d4af37]/50" />
                </div>
            </div>

            {leads.length === 0 ? (
                <div className="text-center py-20 text-white/20 text-sm font-light uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">No client records found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                                <th className="py-6 font-bold">Identity</th>
                                <th className="py-6 font-bold">Transmission</th>
                                <th className="py-6 font-bold">Organization</th>
                                <th className="py-6 font-bold">Initial Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {leads.map((l: any) => (
                                <tr key={l.id} className="group hover:bg-white/[0.02] transition-colors text-sm text-white/50">
                                    <td className="py-6 font-medium text-white/80">{l.full_name}</td>
                                    <td className="py-6 font-light">{l.email}</td>
                                    <td className="py-6 font-light text-[11px] uppercase tracking-wider">{l.company || '—'}</td>
                                    <td className="py-6 font-light text-xs text-white/20">{new Date(l.created_at).toLocaleDateString()}</td>
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
    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-light tracking-wide uppercase text-[#d4af37]">Arsenal Engineering</h3>
                <button className="flex items-center gap-2 bg-[#d4af37] text-[#030712] text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-white transition-all shadow-lg shadow-[#d4af37]/10">
                    <PlusCircle className="w-4 h-4" /> Add Asset
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-black/20 border border-white/[0.08] p-8 rounded-2xl">
                    <h4 className="text-[10px] font-bold uppercase text-white/20 mb-6 tracking-[0.2em]">Deploy New Product</h4>
                    <form className="space-y-4">
                        <input type="text" placeholder="Product Name (e.g., Executive Cap)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#d4af37] placeholder:text-white/10" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Price (USD)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#d4af37] placeholder:text-white/10" />
                            <input type="text" placeholder="Category" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#d4af37] placeholder:text-white/10" />
                        </div>
                        <input type="text" placeholder="Stripe Payment Link" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#d4af37] placeholder:text-white/10" />
                        <textarea placeholder="Direct Action Benefits (One per line)" rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#d4af37] placeholder:text-white/10 resize-none" />
                        <button className="w-full border border-white/10 hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#030712] py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-white/40 mt-4">Save & Sync to Registry</button>
                    </form>
                </div>

                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <Package className="w-12 h-12 text-white/5 mb-6" />
                    <p className="text-xs uppercase tracking-[0.2em] text-white/20 font-bold mb-2">Upload Schematic</p>
                    <p className="text-[10px] text-white/10">JPG, PNG, WEBP (Max 5MB)</p>
                    <button className="mt-8 px-6 py-2 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 hover:border-white/20 rounded-full transition-all">Browse Files</button>
                </div>
            </div>
        </div>
    );
}

function NewsletterStudio() {
    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-light tracking-wide uppercase text-[#d4af37]">Intelligence Studio</h3>
                <button className="flex items-center gap-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#d4af37] transition-all shadow-lg shadow-white/5">
                    <Mail className="w-4 h-4" /> Dispatch Brief
                </button>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
                <input type="text" placeholder="Transmission Subject (e.g., [IMPERIUM] The Law of Leverage)" className="w-full bg-black/40 border border-white/10 rounded-xl px-8 py-5 text-white text-xl font-light focus:outline-none focus:border-[#d4af37] placeholder:text-white/10" />

                <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-black/60 border-b border-white/5 px-6 py-3 flex items-center gap-6">
                        <button className="text-xs text-white/40 hover:text-white font-bold">B</button>
                        <button className="text-xs text-white/40 hover:text-white italic">I</button>
                        <button className="text-xs text-white/40 hover:text-white underline font-serif">U</button>
                        <div className="w-px h-4 bg-white/10" />
                        <button className="text-xs text-white/40 hover:text-white">🔗</button>
                    </div>
                    <textarea
                        className="w-full h-96 bg-transparent p-10 text-white/70 text-base font-light leading-relaxed focus:outline-none resize-none border-none"
                        placeholder="Draft the intelligence brief. Calm, precise, strategic..."
                        defaultValue={`Strategic Directive Issued.

Focus on the architecture of discipline...

POWERED BY OMNI AI`}
                    />
                </div>

                <div className="flex justify-end gap-6 mt-8">
                    <button className="px-8 py-4 text-white/20 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors">Save To Archives</button>
                    <button className="px-10 py-4 bg-[#d4af37] text-[#030712] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white hover:scale-105">Schedule Transmission</button>
                </div>
            </div>
        </div>
    );
}
