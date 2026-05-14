// Server component: fetches published newsletters from Supabase at request time
// and renders the post HTML in the initial response so it's never blocked by
// a client-side fetch failure or auth-state hiccup.

import { createClient } from "@supabase/supabase-js";
import NewsletterPageClient, { type NewsletterRow } from "./NewsletterPageClient";

export const dynamic = "force-dynamic";

async function fetchPublishedNewsletters(): Promise<NewsletterRow[]> {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!url || !key) return [];
        const supabase = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await supabase
            .from("newsletters")
            .select("id, title, content, image_url, published, is_public, created_at")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(20);
        if (error) {
            // eslint-disable-next-line no-console
            console.error("[newsletter] fetch error", error);
            return [];
        }
        return (data ?? []) as NewsletterRow[];
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[newsletter] fetch exception", e);
        return [];
    }
}

export default async function NewsletterPage() {
    const newsletters = await fetchPublishedNewsletters();
    return <NewsletterPageClient newsletters={newsletters} />;
}
