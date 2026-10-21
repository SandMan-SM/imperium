import type { Metadata } from "next";
import PrinciplesClient from "./PrinciplesClient";

export const metadata: Metadata = {
  title: "The 28 Principles",
  description:
    "The complete Imperium operating system. 28 laws derived from history's most formidable sovereigns, condensed into an executable framework for the disciplined operator.",
  alternates: { canonical: "https://secretimperium.com/28principles" },
  openGraph: {
    title: "The 28 Principles",
    description:
      "The complete Imperium operating system. 28 laws derived from history's most formidable sovereigns, condensed into an executable framework.",
    type: "website",
    url: "https://secretimperium.com/28principles",
    images: [
      {
        url: "https://secretimperium.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The 28 Principles — Imperium Elite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The 28 Principles",
    description:
      "The complete Imperium operating system. 28 laws derived from history's most formidable sovereigns.",
    images: ["https://secretimperium.com/opengraph-image"],
  },
};

export default function PrinciplesPage() {
  return <PrinciplesClient />;
}
