"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";

// Site-wide smooth scroll with inertia. Mounted in the root layout so every
// route inherits the smoothed scroll. Honors prefers-reduced-motion by
// skipping initialization entirely.
export default function LenisProvider({ children }: { children: ReactNode }) {
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.4,
        });

        function raf(time: number) {
            lenis.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
        }
        rafIdRef.current = requestAnimationFrame(raf);

        // Intercept in-page anchor clicks so Lenis handles them with inertia
        function onAnchorClick(e: MouseEvent) {
            const target = e.target as HTMLElement | null;
            const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null;
            if (!anchor) return;
            const id = anchor.getAttribute("href")?.slice(1);
            if (!id) return;
            const el = document.getElementById(id);
            if (!el) return;
            e.preventDefault();
            lenis.scrollTo(el, { offset: -80 });
        }
        document.addEventListener("click", onAnchorClick);

        return () => {
            document.removeEventListener("click", onAnchorClick);
            if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
