import type { MetadataRoute } from "next";
import {PUBLIC_NEWSLETTER_ARTICLES} from "@/lib/newsletter-public";
import { archiveEntries } from "@/lib/archive";

const SITE_URL = "https://secretimperium.com";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/apply/`, changeFrequency: "monthly", priority: .9 },
    { url: `${SITE_URL}/archive/`, changeFrequency: "weekly", priority: .9 },
    { url: `${SITE_URL}/newsletter/`, changeFrequency: "weekly", priority: .8 },
    { url: `${SITE_URL}/partners/`, changeFrequency: "monthly", priority: .7 },
    { url: `${SITE_URL}/tyronengouamo/`, changeFrequency: "monthly", priority: .75 },
    { url: `${SITE_URL}/tyronengouamo/referral/`, changeFrequency: "monthly", priority: .55 },
    ...["resources", "resources/lead-franchise", "resources/ais-empire", "resources/lead-franchise-ais-empire"].map((path) => ({ url: `${SITE_URL}/${path}/`, changeFrequency: "monthly" as const, priority: .55 })),
    ...PUBLIC_NEWSLETTER_ARTICLES.map(article => ({url: `${SITE_URL}/newsletter/${article.slug}/`, lastModified: article.publishedAt, changeFrequency: "monthly" as const, priority: .7})),
    ...archiveEntries.map((entry) => ({ url: `${SITE_URL}/archive/${entry.slug}/`, changeFrequency: "monthly" as const, priority: .7 })),
    { url: `${SITE_URL}/mission-statement/`, changeFrequency: "monthly", priority: .5 },
    // Market Intelligence — the Hermes daily market scan. The page ships its
    // own canonical, title and description and renders `index, follow`, so it
    // asks to be indexed; leaving it out of the sitemap meant it was only
    // reachable by guessing the URL. audit:sitemap fails the build if an
    // indexable route is missing from here.
    { url: `${SITE_URL}/market/`, changeFrequency: "daily", priority: .7 },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "yearly", priority: .2 },
    { url: `${SITE_URL}/terms/`, changeFrequency: "yearly", priority: .2 },
  ];
}
