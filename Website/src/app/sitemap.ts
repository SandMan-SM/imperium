import type { MetadataRoute } from "next";

const SITE_URL = "https://secretimperium.com";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "28principles", changeFrequency: "weekly", priority: 0.9 },
  { path: "assessments", changeFrequency: "weekly", priority: 0.8 },
  { path: "assessments/archetype", changeFrequency: "monthly", priority: 0.7 },
  { path: "assessments/personality", changeFrequency: "monthly", priority: 0.7 },
  { path: "assessments/eq", changeFrequency: "monthly", priority: 0.6 },
  { path: "assessments/iq", changeFrequency: "monthly", priority: 0.6 },
  { path: "shop", changeFrequency: "weekly", priority: 0.8 },
  { path: "newsletter", changeFrequency: "weekly", priority: 0.7 },
  { path: "portal", changeFrequency: "monthly", priority: 0.5 },
  { path: "privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map((r) => ({
    url: r.path ? `${SITE_URL}/${r.path}` : SITE_URL,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
