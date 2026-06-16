import type { Metadata } from "next";
import NewsletterClient from "./NewsletterClient";

export const metadata: Metadata = {
  title: "Intelligence Brief — Imperium Elite",
  description:
    "Daily strategic intelligence for the disciplined sovereign. Precision frameworks from the world's most formidable minds. Join 2,400+ operators.",
  openGraph: {
    title: "Intelligence Brief — Imperium Elite",
    description:
      "Daily strategic intelligence for the disciplined sovereign. Precision frameworks from the world's most formidable minds.",
    type: "website",
    url: "https://secretimperium.com/newsletter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Intelligence Brief — Imperium Elite",
    description:
      "Daily strategic intelligence for the disciplined sovereign. Join 2,400+ operators.",
  },
};

export default function NewsletterPage() {
  return <NewsletterClient />;
}
