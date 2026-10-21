import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductDetailClient from "./ProductDetailClient";
import Script from "next/script";

const SITE_URL = "https://secretimperium.com";

const CATALOG_META: Record<string, { name: string; description: string; image: string; price?: string }> = {
  "imperium-command-tee": {
    name: "Imperium Command Tee",
    description: "Premium heavyweight cotton. Minimal Imperium insignia on chest. Structured drop-cut silhouette designed for the serious operator.",
    image: "/products/shirt.jpeg",
    price: "45.00",
  },
  "exclusive-imperium-hoodie": {
    name: "Exclusive Imperium Hoodie",
    description: "400gsm heavyweight fleece. Boxy architectural fit with embossed Imperium emblem. Built to signal sovereignty in any room.",
    image: "/products/hoodie.jpeg",
    price: "85.00",
  },
  "imperium-stealth-sweats": {
    name: "Imperium Stealth Sweats",
    description: "French terry sweatpants. Tapered fit, minimal embroidery, zippered ankles. Built for recovery, remapped for command.",
    image: "/products/sweats.jpeg",
    price: "65.00",
  },
};

async function getProductMeta(slug: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("products")
      .select("name, description, image_url, price")
      .eq("slug", slug)
      .single();
    if (data) return { name: data.name, description: data.description, image: data.image_url, price: data.price };
  } catch {}
  return CATALOG_META[slug] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductMeta(slug);

  const title = product?.name || "Product";
  const description = product?.description || "Premium apparel and gear for the sovereign operator.";
  const image = product?.image || "/opengraph-image";
  // Product images are stored as site-relative paths; OpenGraph needs an
  // absolute URL or social platforms silently drop the preview card.
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shop/${slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
      type: "website",
      url: `${SITE_URL}/shop/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductMeta(slug);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: [`${SITE_URL}${product.image}`],
        url: `${SITE_URL}/shop/${slug}`,
        brand: {
          "@type": "Brand",
          name: "Imperium Elite",
        },
        offers: {
          "@type": "Offer",
          price: product.price || "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "Imperium Elite" },
        },
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductDetailClient slug={slug} />
    </>
  );
}
