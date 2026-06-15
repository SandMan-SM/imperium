import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Member Portal — Imperium Elite",
    description: "Access your Imperium member portal. Manage your subscription, access the 28 Principles, and track your intelligence briefs.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
