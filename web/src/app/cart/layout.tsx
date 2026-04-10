import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cart — Imperium Elite",
    description: "Review your cart and proceed to checkout.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
