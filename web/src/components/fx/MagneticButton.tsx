"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { type ReactNode, useRef } from "react";

// Magnetic wrapper — on hover, the wrapped content drifts toward the cursor
// with spring physics, returns to center on leave. Wrap your <a> / <button>
// / <Link> in this. Does NOT create a custom cursor (per operator constraint).
export default function MagneticButton({
    children,
    strength = 10,
    className = "",
    style,
}: {
    children: ReactNode;
    strength?: number; // px max drift
    className?: string;
    style?: React.CSSProperties;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const reduce = useReducedMotion();

    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const x = useSpring(mx, { stiffness: 180, damping: 14, mass: 0.4 });
    const y = useSpring(my, { stiffness: 180, damping: 14, mass: 0.4 });

    function handleMove(e: React.MouseEvent) {
        if (reduce) return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        mx.set(Math.max(-strength, Math.min(strength, dx * 0.25)));
        my.set(Math.max(-strength, Math.min(strength, dy * 0.25)));
    }

    function handleLeave() {
        mx.set(0);
        my.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ x, y, display: "inline-flex", ...style }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
