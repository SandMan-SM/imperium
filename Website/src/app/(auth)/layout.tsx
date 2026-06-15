import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In — Imperium",
    description: "Sign in or create your Imperium account to access the 28 Principles and premium intelligence.",
    robots: { index: false, follow: false },
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
