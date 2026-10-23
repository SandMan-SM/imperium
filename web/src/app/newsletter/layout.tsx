import type { Metadata } from "next";

const description = "Imperium's newsletter: letters on clear thinking, meaningful work, and everyday life. Read public editions and meet the partners in our network.";
const image = {
  url: "https://secretimperium.com/newsletter/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "The Imperium Letter — Greek architectural imagery and original editorial typography",
};

export const metadata: Metadata = {
  title: { absolute: "The Imperium Newsletter · Letters & Partners" },
  description,
  alternates: { canonical: "https://secretimperium.com/newsletter/" },
  openGraph: {
    title: "The Imperium Newsletter",
    description,
    url: "https://secretimperium.com/newsletter/",
    siteName: "Imperium",
    type: "website",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Imperium Newsletter",
    description,
    images: [image],
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
