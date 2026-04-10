import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Checkout — Imperium Elite",
    description: "Complete your Imperium purchase securely.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
