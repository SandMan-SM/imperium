import type { Metadata } from "next";
import ReferralPageClient from "./ReferralPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Tyrone sent you — Apply for the Imperium Inner Circle",
    description:
        "Step into the Imperium Inner Circle. Your own profile on secretimperium.com, lifetime access to the network, and a custom $25K digital asset for your brand.",
    openGraph: {
        title: "Tyrone sent you — Apply for the Imperium Inner Circle",
        description:
            "Step into the Imperium Inner Circle. Your own profile, lifetime network access, and a custom $25K digital asset.",
        images: [{ url: "/people/tyrone.webp" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tyrone sent you — Imperium Inner Circle",
        description: "Step into the Inner Circle.",
        images: ["/people/tyrone.webp"],
    },
};

export default function ReferralPage() {
    return <ReferralPageClient />;
}
