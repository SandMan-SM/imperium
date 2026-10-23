import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

const CATALOG_META: Record<string, { name: string; description: string; image: string }> = {
  "imperium-command-tee": {
    name: "Imperium Command Tee",
    description: "Premium heavyweight cotton. Minimal Imperium insignia on chest. Structured drop-cut silhouette designed for the serious operator.",
    image: "/products/shirt.jpeg",
  },
  "exclusive-imperium-hoodie": {
    name: "Exclusive Imperium Hoodie",
    description: "400gsm heavyweight fleece. Boxy architectural fit with embossed Imperium emblem. Built to signal sovereignty in any room.",
    image: "/products/hoodie.jpeg",
  },
  "imperium-stealth-sweats": {
    name: "Imperium Stealth Sweats",
    description: "French terry sweatpants. Tapered fit, minimal embroidery, zippered ankles. Built for recovery, remapped for command.",
    image: "/products/sweats.jpeg",
  },
};

async function getProductMeta(slug: string) {
  // The products table has no `slug` column, so the catalogue below is the
  // source of truth for the product pages (the detail view falls back to the
  // same catalogue when the database has no matching row).
  return CATALOG_META[slug] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductMeta(slug);

  const title = product ? `${product.name} — Imperium` : "Product — Imperium";
  const description = product?.description || "Premium apparel and gear for the sovereign operator.";
  const image = product?.image || "/opengraph-image";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
