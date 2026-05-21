"use client";

// Site-wide SVG noise / film grain. Fixed, pointer-events none, very low
// opacity. Massive perceived-quality lift for zero performance cost — the
// noise SVG is rendered once into a data URL and reused as a background.
const noiseSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
            <filter id='n'>
                <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
                <feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/>
            </filter>
            <rect width='100%' height='100%' filter='url(%23n)'/>
        </svg>`,
    );

export default function NoiseOverlay() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[1] opacity-[0.05] mix-blend-overlay"
            style={{
                backgroundImage: `url("${noiseSvg}")`,
                backgroundSize: "200px 200px",
            }}
        />
    );
}
