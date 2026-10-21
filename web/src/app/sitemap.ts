import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

const SITE_URL = "https://secretimperium.com";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "28principles", changeFrequency: "weekly", priority: 0.9 },
  { path: "shop", changeFrequency: "weekly", priority: 0.8 },
  { path: "market", changeFrequency: "daily", priority: 0.8 },
  { path: "newsletter", changeFrequency: "weekly", priority: 0.7 },
  { path: "privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "terms", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Product detail pages are indexable and were missing from the sitemap
 * entirely, which kept every /shop/[slug] URL out of search results.
 */
async function getProductPaths(): Promise<string[]> {
  try {
    const { data } = await supabaseAdmin
      .from("products")
      .select("slug")
      .not("slug", "is", null);
    if (!Array.isArray(data)) return [];
    return data
      .map((p: { slug?: string | null }) => (p.slug ? `shop/${p.slug}` : ""))
      .filter(Boolean);
  } catch {
    // A failed product lookup must not take the whole sitemap down.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const productPaths = await getProductPaths();

  const routes = [...STATIC_ROUTES, ...productPaths.map((path) => ({
    path,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))];

  return routes.map((r) => ({
    url: r.path ? `${SITE_URL}/${r.path}` : SITE_URL,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
