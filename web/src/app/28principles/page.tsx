import type { Metadata } from "next";
import PrinciplesClient from "./PrinciplesClient";

export const metadata: Metadata = {
  title: "The 28 Principles — Imperium Elite",
  description:
    "The complete Imperium operating system. 28 laws derived from history's most formidable sovereigns, condensed into an executable framework for the disciplined operator.",
  openGraph: {
    title: "The 28 Principles — Imperium Elite",
    description:
      "The complete Imperium operating system. 28 laws derived from history's most formidable sovereigns, condensed into an executable framework.",
    type: "website",
    url: "https://secretimperium.com/28principles",
  },
  twitter: {
    card: "summary_large_image",
    title: "The 28 Principles — Imperium Elite",
    description:
      "The complete Imperium operating system. 28 laws derived from history's most formidable sovereigns.",
  },
};

export default function PrinciplesPage() {
  return <PrinciplesClient />;
}
