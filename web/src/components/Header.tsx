"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navigation = [
    { label: "The Archive", href: "/archive/" },
    { label: "Newsletter", href: "/newsletter/" },
    { label: "About", href: "/mission-statement/" },
    { label: "Partners", href: "/partners/" },
];

export function Header() {
    const pathname = usePathname().replace(/\/$/, "") || "/";
    const [open, setOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                menuButton.current?.focus();
            }
        };
        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [open]);

    const isCurrentPage = (href: string) => !href.includes("#") && pathname === href.replace(/\/$/, "");

    return (
        <header className="editorial-header sticky top-0 z-50 border-b border-[#d7d7cd] bg-[#f7f5ef]/95 text-[#252820] backdrop-blur-xl">
            <div className="editorial-header-inner mx-auto flex h-[82px] max-w-[1360px] items-center justify-between gap-6 px-5 sm:px-8 lg:h-[88px] lg:px-12">
                <Link href="/" onClick={() => setOpen(false)} className="shrink-0" aria-label="Imperium home">
                    <span className="block font-serif text-[28px] font-semibold uppercase leading-none tracking-[0.035em] sm:text-[31px]">Imperium</span>
                    <span className="mt-1.5 hidden text-[12px] leading-none text-[#62675b] lg:block">The resource library</span>
                </Link>

                <nav aria-label="Main navigation" className="hidden items-center gap-5 md:flex lg:gap-8">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isCurrentPage(item.href) ? "page" : undefined}
                            className={`flex min-h-11 items-center border-b text-[14px] transition-colors hover:border-[#737759] hover:text-[#525a3d] ${isCurrentPage(item.href) ? "border-[#737759] font-medium text-[#252820]" : "border-transparent text-[#565c50]"}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <Link href="/archive/" className="hidden min-h-11 items-center justify-center rounded-md border border-[#252820] bg-[#252820] px-5 text-[14px] font-medium text-[#f7f5ef] transition-colors hover:border-[#454c37] hover:bg-[#454c37] md:inline-flex">
                    Browse resources
                </Link>

                <button
                    ref={menuButton}
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-expanded={open}
                    aria-controls="mobile-navigation"
                    aria-label={open ? "Close navigation" : "Open navigation"}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-[#d7d7cd] text-[#252820] transition-colors hover:border-[#737759] hover:bg-[#eeede5] md:hidden"
                >
                    {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
                </button>
            </div>

            {open && (
                <nav id="mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-82px)] overflow-y-auto border-t border-[#d7d7cd] bg-[#f7f5ef] px-5 pb-6 pt-2 md:hidden">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-current={isCurrentPage(item.href) ? "page" : undefined}
                            className={`flex min-h-12 items-center border-b border-[#e4e3da] py-3 text-[16px] transition-colors hover:text-[#525a3d] ${isCurrentPage(item.href) ? "font-medium text-[#252820]" : "text-[#565c50]"}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link href="/archive/" onClick={() => setOpen(false)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#252820] px-5 text-[14px] font-medium text-[#f7f5ef] transition-colors hover:bg-[#454c37]">
                        Browse resources
                    </Link>
                </nav>
            )}
        </header>
    );
}
