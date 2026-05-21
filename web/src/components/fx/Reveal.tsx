"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

type Variant = "fade" | "up" | "left" | "right" | "scale";

const VARIANTS: Record<Variant, Variants> = {
    fade: {
        hidden: { opacity: 0 },
        show: { opacity: 1 },
    },
    up: {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0 },
    },
    left: {
        hidden: { opacity: 0, x: -24 },
        show: { opacity: 1, x: 0 },
    },
    right: {
        hidden: { opacity: 0, x: 24 },
        show: { opacity: 1, x: 0 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.96 },
        show: { opacity: 1, scale: 1 },
    },
};

// Generic scroll-into-view wrapper. Replaces ad-hoc whileInView blocks
// scattered around. Honors prefers-reduced-motion (no transform, just opacity).
export default function Reveal({
    children,
    as = "div",
    variant = "up",
    delay = 0,
    duration = 0.7,
    amount = 0.2,
    once = true,
    className = "",
    style,
}: {
    children: ReactNode;
    as?: "div" | "section" | "article" | "header" | "footer" | "li";
    variant?: Variant;
    delay?: number;
    duration?: number;
    amount?: number;
    once?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const reduce = useReducedMotion();
    const variants = reduce ? VARIANTS.fade : VARIANTS[variant];

    const MotionTag = motion[as] as typeof motion.div;

    return (
        <MotionTag
            initial="hidden"
            whileInView="show"
            viewport={{ once, amount }}
            variants={variants}
            transition={{ duration, delay, ease: [0.21, 0.6, 0.32, 1] }}
            className={className}
            style={style}
        >
            {children}
        </MotionTag>
    );
}
