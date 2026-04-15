import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account — Imperium",
    description: "Manage your Imperium account, orders, and subscription.",
    robots: { index: false, follow: false },
};

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
