"use client";

// Drifting multi-stop radial-gradient mesh. Replaces the flat
// from-gray-900-via-gray-800-to-black gradient that was on every page.
// Sits fixed behind all content. Three layers with mix-blend-mode for depth.
// Honors prefers-reduced-motion via the global CSS class .fx-reduce-motion
// applied on the keyframes in globals.css.
export default function AuroraBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030712]"
        >
            {/* Deep base */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(30, 41, 80, 0.45) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 80% 100%, rgba(60, 50, 30, 0.35) 0%, transparent 65%), linear-gradient(180deg, #060912 0%, #030712 60%, #02050d 100%)",
                }}
            />

            {/* Layer 1 — gold mass, slow drift */}
            <div
                className="fx-aurora-drift absolute -inset-32 opacity-[0.55] mix-blend-screen"
                style={{
                    background:
                        "radial-gradient(50% 35% at 30% 30%, rgba(212, 175, 55, 0.22) 0%, transparent 70%)",
                    animationDuration: "34s",
                    filter: "blur(40px)",
                }}
            />

            {/* Layer 2 — cool counterweight, opposite drift */}
            <div
                className="fx-aurora-drift-rev absolute -inset-32 opacity-[0.5] mix-blend-screen"
                style={{
                    background:
                        "radial-gradient(45% 40% at 70% 60%, rgba(80, 110, 200, 0.18) 0%, transparent 70%)",
                    animationDuration: "42s",
                    filter: "blur(50px)",
                }}
            />

            {/* Layer 3 — bright gold accent, tight */}
            <div
                className="fx-aurora-pulse absolute -inset-16 opacity-[0.35] mix-blend-screen"
                style={{
                    background:
                        "radial-gradient(35% 25% at 50% 40%, rgba(232, 200, 74, 0.18) 0%, transparent 75%)",
                    animationDuration: "16s",
                    filter: "blur(80px)",
                }}
            />

            {/* Vignette to keep edges grounded */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 90% 90% at 50% 40%, transparent 50%, rgba(3, 7, 18, 0.7) 100%)",
                }}
            />
        </div>
    );
}
