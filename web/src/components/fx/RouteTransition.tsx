"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

// Wraps the rendered page in an AnimatePresence keyed by pathname.
// Cross-fades between routes. Vercel/Linear style — quick (180ms),
// no curtain walls. Honors prefers-reduced-motion (no transition).
export default function RouteTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const reduce = useReducedMotion();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
                style={{ minHeight: "100vh" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
