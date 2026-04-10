import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daily Intelligence Brief — Imperium Elite",
    description: "Strategic intelligence and the 28 Principles delivered directly to your inbox. Join 2,400+ sovereign-minded operators.",
    openGraph: {
        title: "Daily Intelligence Brief — Imperium Elite",
        description: "Strategic intelligence and the 28 Principles delivered directly to your inbox.",
        type: "website",
    },
};

export default function NewsletterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
