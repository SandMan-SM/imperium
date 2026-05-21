"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

// Replaces hard `border-t border-imperium-gold/20` lines.
// A gradient line that fades from edges to gold in the center, with a
// thin shimmer that crosses left-to-right when the divider enters view.
// Subtle, expensive-feeling.
export default function GoldDivider({
    className = "",
    width = "max-w-3xl",
}: {
    className?: string;
    width?: string;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const reduce = useReducedMotion();

    return (
        <div ref={ref} className={`relative mx-auto h-px overflow-hidden ${width} ${className}`}>
            <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.45) 50%, transparent 100%)",
                }}
            />
            {!reduce && inView && (
                <motion.div
                    aria-hidden="true"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    className="absolute inset-y-0 w-1/3"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent 0%, rgba(232, 200, 74, 0.9) 50%, transparent 100%)",
                    }}
                />
            )}
        </div>
    );
}
