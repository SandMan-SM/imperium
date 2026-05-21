import { type ReactNode } from "react";

// Standardized card wrapper. Replaces ad-hoc
// `rounded-2xl border border-imperium-border bg-imperium-surface` blocks
// scattered across pages. Configurable elevation, hover lift, optional
// inset gold glow. Server-safe (no client APIs).
export default function GlassCard({
    children,
    as = "div",
    elevation = "med",
    glow = false,
    hover = true,
    className = "",
    ...rest
}: {
    children: ReactNode;
    as?: "div" | "article" | "section" | "li";
    elevation?: "low" | "med" | "high";
    glow?: boolean;
    hover?: boolean;
    className?: string;
} & React.HTMLAttributes<HTMLElement>) {
    const Tag = as as keyof React.JSX.IntrinsicElements;
    const elevationClass =
        elevation === "low"
            ? "bg-white/[0.02] border-white/[0.05]"
            : elevation === "high"
              ? "bg-white/[0.05] border-imperium-gold/25"
              : "bg-white/[0.03] border-imperium-border";
    const hoverClass = hover
        ? "transition-all duration-500 hover:border-imperium-gold/40 hover:bg-white/[0.05] hover:-translate-y-[2px] hover:shadow-[0_18px_40px_-16px_rgba(212,175,55,0.18)]"
        : "";
    const glowClass = glow
        ? "before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none before:bg-[radial-gradient(60%_50%_at_50%_0%,rgba(212,175,55,0.10),transparent_70%)]"
        : "";
    return (
        // @ts-expect-error dynamic tag with rest props is fine at runtime
        <Tag
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-md ${elevationClass} ${hoverClass} ${glowClass} ${className}`}
            {...rest}
        >
            {children}
        </Tag>
    );
}
