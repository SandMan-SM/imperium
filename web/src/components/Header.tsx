"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Header() {
    const [open, setOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check local storage for existing session
        const checkAuth = () => {
            if (typeof window !== "undefined") {
                setIsAuthenticated(localStorage.getItem("imperium_admin_auth") === "true");
            }
        };

        checkAuth();
        // Listen for storage changes in case login happens in another tab
        window.addEventListener("storage", checkAuth);
        // Custom event for same-tab updates
        window.addEventListener("imperium_auth_change", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("imperium_auth_change", checkAuth);
        };
    }, []);

    const navLinks = [
        { label: "Intelligence", href: "/#newsletter" },
        ...(isAuthenticated ? [{ label: "28 Principles", href: "/28principles" }] : []),
        { label: "Newsletter", href: "/newsletter" },
        { label: "Arsenal", href: "/shop" },
    ];

    const handleSignOut = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("imperium_admin_auth");
            setIsAuthenticated(false);
            window.dispatchEvent(new Event("imperium_auth_change"));
            window.location.href = "/";
        }
    };

    return (
        <>
            <header className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-[#030712]/95 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-[72px] flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="text-lg font-bold tracking-[0.3em] text-[#d4af37] uppercase hover:text-[#e8c84a] transition-colors">
                        Imperium
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
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
                    <div className="hidden md:flex items-center gap-5">
                        {isAuthenticated ? (
                            <button
                                onClick={handleSignOut}
                                className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/20 hover:text-white/40 transition-colors"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                href="/admin"
                                className="px-5 py-2 border border-white/10 text-white/60 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:border-white/30 hover:text-white transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setOpen(true)}
                        className="md:hidden text-white/60 hover:text-white transition-colors p-1"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-[75vw] max-w-[300px] bg-[#030712] border-l border-white/[0.08] flex flex-col p-8">
                        <div className="flex items-center justify-between mb-10">
                            <span className="text-base font-bold tracking-[0.3em] text-[#d4af37] uppercase">Imperium</span>
                            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex flex-col">
                            {navLinks.map(l => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => setOpen(false)}
                                    className="py-4 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/40 hover:text-white border-b border-white/[0.06] transition-colors"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-3">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setOpen(false);
                                    }}
                                    className="block w-full text-center py-3.5 border border-white/10 text-white/40 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:border-white/20 hover:text-white transition-colors"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/admin"
                                    onClick={() => setOpen(false)}
                                    className="block w-full text-center py-3.5 border border-white/10 text-white/40 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:border-white/20 hover:text-white transition-colors"
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
