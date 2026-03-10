"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, User, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/CartDrawer";

export function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
    const { user, profile, rawProfile, previewView, setPreview, signOut, loading } = useAuth();
    const { itemCount, setIsCartOpen } = useCart();

    // show eyeball when the underlying raw profile is admin (so preview doesn't hide it)
    const isAdmin = rawProfile?.is_admin || profile?.is_admin;

    const [currentView, setCurrentView] = useState<string>('admin');
    const [hasLocalPreview, setHasLocalPreview] = useState(false);

    // derive active view from context or storage so highlighting is accurate
    const activeView = (previewView || (typeof window !== 'undefined' ? localStorage.getItem('preview_view') : null) || 'admin');

    useEffect(() => {
        if (isAdmin) {
            const view = previewView || localStorage.getItem('preview_view') || 'admin';
            setCurrentView(view);

            // Try to dynamically load a local-only helper script at /local/admin-preview.js.
            // If the file exists in web/public/local/admin-preview.js it will expose
            // window.__imperium_admin_preview which enables the Eye control.
            try {
                const script = document.createElement('script');
                script.src = '/local/admin-preview.js';
                script.async = true;
                script.onload = () => {
                    try {
                        const helper = (window as any).__imperium_admin_preview;
                        setHasLocalPreview(!!(helper && helper.shouldShowEye));
                    } catch (e) {
                        setHasLocalPreview(false);
                    }
                };
                script.onerror = () => setHasLocalPreview(false);
                document.head.appendChild(script);

                // ensure currentView reflects previewView immediately when script loads
                script.onload = () => {
                    try {
                        const helper = (window as any).__imperium_admin_preview;
                        setHasLocalPreview(!!(helper && helper.shouldShowEye));
                        const v = localStorage.getItem('preview_view') || previewView || 'admin';
                        setCurrentView(v);
                    } catch (e) {
                        setHasLocalPreview(false);
                    }
                };

                return () => {
                    // cleanup appended script
                    if (script.parentNode) script.parentNode.removeChild(script);
                };
            } catch (e) {
                setHasLocalPreview(false);
            }
        } else {
            // ensure currentView falls back to admin for non-admin pages
            setCurrentView('admin');
        }
    }, [isAdmin]);

    // Keep the local `currentView` in sync with the Auth context previewView
    useEffect(() => {
        try {
            const v = previewView || (typeof window !== 'undefined' ? localStorage.getItem('preview_view') : null) || 'admin';
            setCurrentView(v);
        } catch (e) {
            // ignore
        }
    }, [previewView]);

    // keep for future conditional behavior; not used currently
    const isAdminPage = pathname === "/admin";

    const navLinks = [
        { label: "28 Principles", href: "/28principles" },
        { label: "Newsletter", href: "/newsletter" },
        { label: "Arsenal", href: "/shop" },
    ];

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    return (
        <>
            <CartDrawer />
            <header className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-[#030712]/95 backdrop-blur-xl">
                <div className="container mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="text-lg font-bold tracking-[0.3em] text-[#d4af37] uppercase hover:text-[#e8c84a] transition-colors">
                        Imperium
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                        {navLinks.map(l => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/40 hover:text-white transition-colors duration-200"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-5">
                        {/* Admin View Switcher */}
                        {isAdmin && (
                            <div className="relative">
                                <button
                                    onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                                    className="flex items-center justify-center p-2 text-white/40 hover:text-white transition-colors surface-card"
                                    aria-label="View options"
                                    aria-expanded={viewDropdownOpen}
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                {viewDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0e14] border border-white/[0.08] rounded-lg shadow-xl z-[9999] py-1">
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'public'); } catch (e) { }
                                                setCurrentView('public');
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) {
                                                    try { helper.setPreview('public'); } catch (e) { window.location.reload(); }
                                                } else {
                                                    // update context preview as well so pages that depend on checkPremiumStatus update
                                                    if (setPreview) {
                                                        try { await setPreview('public'); } catch (e) { /* ignore */ }
                                                    }
                                                    // no forced reload here; context will re-fetch profile and components will update
                                                }
                                                setViewDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase text-white/60 hover:text-white hover:bg-white/[0.02]"
                                        >
                                            <span className={activeView === 'public' ? 'text-imperium-gold' : ''}>Public</span>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'subscriber'); } catch (e) { }
                                                setCurrentView('subscriber');
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) {
                                                    try { helper.setPreview('subscriber'); } catch (e) { window.location.reload(); }
                                                } else {
                                                    if (setPreview) {
                                                        try { await setPreview('subscriber'); } catch (e) { /* ignore */ }
                                                    }
                                                }
                                                setViewDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase text-white/60 hover:text-white hover:bg-white/[0.02]"
                                        >
                                            <span className={activeView === 'subscriber' ? 'text-imperium-gold' : ''}>Subscriber</span>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'free'); } catch (e) { }
                                                setCurrentView('free');
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) {
                                                    try { helper.setPreview('free'); } catch (e) { window.location.reload(); }
                                                } else {
                                                    if (setPreview) {
                                                        try { await setPreview('free'); } catch (e) { /* ignore */ }
                                                    }
                                                }
                                                setViewDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase text-white/60 hover:text-white hover:bg-white/[0.02]"
                                        >
                                            <span className={activeView === 'free' ? 'text-imperium-gold' : ''}>Free</span>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'premium'); } catch (e) { }
                                                setCurrentView('premium');
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) {
                                                    try { helper.setPreview('premium'); } catch (e) { window.location.reload(); }
                                                } else {
                                                    if (setPreview) {
                                                        try { await setPreview('premium'); } catch (e) { /* ignore */ }
                                                    }
                                                }
                                                setViewDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase text-white/60 hover:text-white hover:bg-white/[0.02]"
                                        >
                                            <span className={activeView === 'premium' ? 'text-imperium-gold' : ''}>Premium</span>
                                        </button>
                                        <div className="border-t border-white/[0.06] my-1" />
                                        <button
                                            onClick={() => {
                                                try { localStorage.removeItem('preview_view'); } catch (e) { }
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.clearPreview) {
                                                    try { helper.clearPreview(); } catch (e) { window.location.reload(); }
                                                } else {
                                                    window.location.reload();
                                                }
                                                setCurrentView('admin');
                                                setViewDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase text-imperium-gold hover:bg-white/[0.02]"
                                        >
                                            <span className={activeView === 'admin' ? 'text-imperium-gold' : ''}>Admin</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-white/40 hover:text-white transition-colors surface-card"
                            aria-label="Cart"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-imperium-gold text-imperium-bg text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-3 lg:gap-4">
                                <Link
                                    href="/portal"
                                    className="flex items-center gap-2 px-4 py-2 border border-imperium-gold/30 text-imperium-gold text-[10px] font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-imperium-gold/10 transition-all surface-card"
                                >
                                    <User className="w-4 h-4" />
                                    Portal
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200 btn-primary"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle & cart */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Mobile Eye (only when helper enabled for admins) */}
                        {isAdmin && hasLocalPreview && (
                            <div className="relative">
                                <button
                                    onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                                    className="flex items-center justify-center p-2 text-white/40 hover:text-white transition-colors"
                                    aria-label="View options"
                                    aria-expanded={viewDropdownOpen}
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                                {viewDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0e14] border border-white/[0.08] rounded-lg shadow-xl z-[9999] py-1">
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'public'); } catch (e) { }
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) { try { helper.setPreview('public'); } catch (e) { window.location.reload(); } }
                                                else { if (setPreview) { try { await setPreview('public'); } catch (e) { /* ignore */ } } }
                                                setViewDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase ${activeView === 'public' ? 'text-imperium-gold' : 'text-white/60'} hover:text-white hover:bg-white/[0.02]`}
                                        >
                                            Public
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'subscriber'); } catch (e) { }
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) { try { helper.setPreview('subscriber'); } catch (e) { window.location.reload(); } }
                                                else { if (setPreview) { try { await setPreview('subscriber'); } catch (e) { /* ignore */ } } }
                                                setViewDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase ${activeView === 'subscriber' ? 'text-imperium-gold' : 'text-white/60'} hover:text-white hover:bg-white/[0.02]`}
                                        >
                                            Subscriber
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'free'); } catch (e) { }
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) { try { helper.setPreview('free'); } catch (e) { window.location.reload(); } }
                                                else { if (setPreview) { try { await setPreview('free'); } catch (e) { /* ignore */ } } }
                                                setViewDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase ${activeView === 'free' ? 'text-imperium-gold' : 'text-white/60'} hover:text-white hover:bg-white/[0.02]`}
                                        >
                                            Free
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try { localStorage.setItem('preview_view', 'premium'); } catch (e) { }
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.setPreview) { try { helper.setPreview('premium'); } catch (e) { window.location.reload(); } }
                                                else { if (setPreview) { try { await setPreview('premium'); } catch (e) { /* ignore */ } } }
                                                setViewDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase ${activeView === 'premium' ? 'text-imperium-gold' : 'text-white/60'} hover:text-white hover:bg-white/[0.02]`}
                                        >
                                            Premium
                                        </button>
                                        <div className="border-t border-white/[0.06] my-1" />
                                        <button
                                            onClick={async () => {
                                                try { localStorage.removeItem('preview_view'); } catch (e) { }
                                                const helper = (window as any).__imperium_admin_preview;
                                                if (helper && helper.clearPreview) { try { helper.clearPreview(); } catch (e) { window.location.reload(); } }
                                                else { if (setPreview) { try { await setPreview(null); } catch (e) { /* ignore */ } } }
                                                setViewDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[11px] font-medium tracking-wider uppercase ${activeView === 'admin' ? 'text-imperium-gold' : 'text-imperium-gold/60'} hover:bg-white/[0.02]`}
                                        >
                                            Admin
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-white/60 hover:text-white transition-colors"
                            aria-label="Cart"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-imperium-gold text-imperium-bg text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setOpen(true)}
                            className="text-white/60 hover:text-white transition-colors p-1"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-[75vw] max-w-[300px] bg-[#030712] border-l border-white/[0.08] flex flex-col p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-8 sm:mb-10">
                            <span className="text-base font-bold tracking-[0.3em] text-[#d4af37] uppercase">Imperium</span>
                            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-1">
                            {navLinks.map(l => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="py-3.5 sm:py-4 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/40 hover:text-white border-b border-white/[0.06] transition-colors surface-card"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/portal"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-3.5 border border-imperium-gold/30 text-imperium-gold text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-imperium-gold/10 transition-colors surface-card"
                                    >
                                        <User className="w-4 h-4" />
                                        Portal
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setOpen(false);
                                        }}
                                        className="block w-full text-center py-3.5 border border-white/10 text-white/40 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:border-white/20 hover:text-white transition-colors surface-card"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="block w-full text-center py-3.5 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-colors btn-primary"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
