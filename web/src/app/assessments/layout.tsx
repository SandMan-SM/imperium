import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessments — Imperium Elite",
  description:
    "Four assessments to know thyself: Archetype (Greek mythology), Personality, EQ, and IQ. Discover your lineage, archetype, purpose, and shadow.",
  openGraph: {
    title: "Imperium Assessments — Know Thyself",
    description:
      "Discover your Greek archetype, personality type, emotional intelligence, and reasoning. Four short, precise tests.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperium Assessments — Know Thyself",
    description:
      "Discover your Greek archetype, personality type, emotional intelligence, and reasoning.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
