import type { Metadata } from "next";
import NewsletterClient from "./NewsletterClient";

export const metadata: Metadata = {
  title: "Intelligence Brief",
  description:
    "Daily strategic intelligence for the disciplined sovereign. Precision frameworks from the world's most formidable minds. Join 2,400+ operators.",
  alternates: { canonical: "https://secretimperium.com/newsletter" },
  openGraph: {
    title: "Intelligence Brief",
    description:
      "Daily strategic intelligence for the disciplined sovereign. Precision frameworks from the world's most formidable minds.",
    type: "website",
    url: "https://secretimperium.com/newsletter",
    images: [
      {
        url: "https://secretimperium.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Imperium Intelligence Brief",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intelligence Brief",
    description:
      "Daily strategic intelligence for the disciplined sovereign. Join 2,400+ operators.",
    images: ["https://secretimperium.com/opengraph-image"],
  },
};

export default function NewsletterPage() {
  return <NewsletterClient />;
}
