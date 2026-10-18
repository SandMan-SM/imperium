import type { MetadataRoute } from "next";
import { archiveEntries } from "@/lib/archive";

const SITE_URL = "https://secretimperium.com";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/archive/`, changeFrequency: "weekly", priority: .9 },
    { url: `${SITE_URL}/newsletter/`, changeFrequency: "weekly", priority: .8 },
    { url: `${SITE_URL}/partners/`, changeFrequency: "monthly", priority: .7 },
    ...["resources", "resources/lead-franchise", "resources/ais-empire", "resources/lead-franchise-ais-empire"].map((path) => ({ url: `${SITE_URL}/${path}/`, changeFrequency: "monthly" as const, priority: .55 })),
    ...archiveEntries.map((entry) => ({ url: `${SITE_URL}/archive/${entry.slug}/`, changeFrequency: "monthly" as const, priority: .7 })),
    { url: `${SITE_URL}/mission-statement/`, changeFrequency: "monthly", priority: .5 },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "yearly", priority: .2 },
    { url: `${SITE_URL}/terms/`, changeFrequency: "yearly", priority: .2 },
  ];
}
