"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/CartDrawer";

export function Header() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user, profile, signOut, loading } = useAuth();
    const { itemCount, setIsCartOpen } = useCart();

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
                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-white/40 hover:text-white transition-colors"
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
                                    className="flex items-center gap-2 px-4 py-2 border border-imperium-gold/30 text-imperium-gold text-[10px] font-semibold tracking-[0.15em] uppercase rounded-full hover:bg-imperium-gold/10 transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    Portal
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle & cart */}
                    <div className="flex md:hidden items-center gap-2">
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
                                    className="py-3.5 sm:py-4 text-[11px] font-semibold tracking-[0.18em] uppercase text-white/40 hover:text-white border-b border-white/[0.06] transition-colors"
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
                                        className="flex items-center justify-center gap-2 w-full py-3.5 border border-imperium-gold/30 text-imperium-gold text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-imperium-gold/10 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Portal
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setOpen(false);
                                        }}
                                        className="block w-full text-center py-3.5 border border-white/10 text-white/40 text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:border-white/20 hover:text-white transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="block w-full text-center py-3.5 bg-imperium-gold text-[#030712] text-[11px] font-bold tracking-[0.18em] uppercase rounded-full hover:bg-white transition-colors"
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
