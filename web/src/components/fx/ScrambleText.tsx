"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>?";

// Text scramble effect — chars cycle through random glyphs before settling
// on the final text. Used on key hero h1s only. Renders as a <span> so it
// can be nested inside any heading tag the caller chooses.
// Accessibility: aria-label on the wrapper carries the final text;
// the cycling span is aria-hidden.
export default function ScrambleText({
    text,
    duration = 0.7,
    triggerOnMount = true,
    className = "",
}: {
    text: string;
    duration?: number;
    triggerOnMount?: boolean;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState(reduce ? text : "");

    useEffect(() => {
        if (reduce) {
            setDisplay(text);
            return;
        }
        const shouldRun = triggerOnMount || inView;
        if (!shouldRun) return;

        let raf = 0;
        const start = performance.now();
        const ms = duration * 1000;
        const len = text.length;

        const step = (now: number) => {
            const t = Math.min(1, (now - start) / ms);
            const settled = Math.floor(t * len);
            let out = text.slice(0, settled);
            for (let i = settled; i < len; i++) {
                const ch = text[i];
                if (ch === " " || ch === "\n") out += ch;
                else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
            setDisplay(out);
            if (t < 1) raf = requestAnimationFrame(step);
            else setDisplay(text);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [inView, text, duration, triggerOnMount, reduce]);

    return (
        <span ref={ref} aria-label={text} className={className}>
            <span aria-hidden="true">{display}</span>
        </span>
    );
}
