"use client";

import { useScroll, useSpring, useTransform } from "framer-motion";
import { motion } from "framer-motion";

// Gold radial glow that follows scroll position down the page. Sits behind
// content. Replaces the static glow blob that was identical on every page.
// Uses spring-smoothed scroll so it lags the page slightly — feels alive.
export default function ScrollGlow() {
    const { scrollYProgress } = useScroll();
    const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });
    const top = useTransform(smooth, [0, 1], ["8%", "78%"]);
    const opacity = useTransform(smooth, [0, 0.5, 1], [0.5, 0.7, 0.4]);

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed left-1/2 z-0 h-[420px] w-[820px] -translate-x-1/2"
            style={{
                top,
                opacity,
                background:
                    "radial-gradient(closest-side, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.06) 35%, transparent 70%)",
                filter: "blur(60px)",
            }}
        />
    );
}
