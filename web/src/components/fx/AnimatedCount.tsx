"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Counts up from 0 to `to` when the element enters viewport.
// Optional prefix/suffix. Optional thousands-separator formatting.
export default function AnimatedCount({
    to,
    duration = 1.6,
    prefix = "",
    suffix = "",
    format = true,
    className = "",
}: {
    to: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    format?: boolean;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const inView = useInView(ref, { once: true, amount: 0.4 });
    const reduce = useReducedMotion();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) {
            setValue(to);
            return;
        }
        let raf = 0;
        const start = performance.now();
        const ms = duration * 1000;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic
        const step = (now: number) => {
            const t = Math.min(1, (now - start) / ms);
            const v = Math.round(to * ease(t));
            setValue(v);
            if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [inView, to, duration, reduce]);

    const display = format ? value.toLocaleString("en-US") : String(value);

    return (
        <motion.span ref={ref} className={className}>
            {prefix}
            {display}
            {suffix}
        </motion.span>
    );
}
