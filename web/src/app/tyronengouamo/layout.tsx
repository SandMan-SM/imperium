import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tyrone Ngouamo — Training, Nutrition, and the Imperium Inner Circle",
    description:
        "Strength training and nutrition for operators who can't afford to plateau. Personal training, custom meal plans, and a path into the Imperium Inner Circle.",
    openGraph: {
        title: "Tyrone Ngouamo — Training, Nutrition, and the Imperium Inner Circle",
        description:
            "Strength training and nutrition for operators who can't afford to plateau. Personal training, custom meal plans, and a path into the Imperium Inner Circle.",
        images: [{ url: "/people/tyrone.webp" }],
        type: "profile",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tyrone Ngouamo — Imperium Inner Circle",
        description:
            "Strength training and nutrition for operators who can't afford to plateau.",
        images: ["/people/tyrone.webp"],
    },
};

export default function TyroneLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
