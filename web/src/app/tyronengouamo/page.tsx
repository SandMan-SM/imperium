// Server component — fetches Tyrone's service offerings from public.products
// at request time so the page HTML is server-rendered, never gated on a
// client-side fetch.

import { createClient } from "@supabase/supabase-js";
import TyronePageClient, { type ServiceRow } from "./TyronePageClient";

export const dynamic = "force-dynamic";

async function fetchTyroneServices(): Promise<ServiceRow[]> {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!url || !key) return [];
        const supabase = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await supabase
            .from("products")
            .select("id, name, description, price, image_url, stripe_url, payment_link_url, metadata")
            .eq("brand", "tyrone")
            .eq("in_stock", true);
        if (error) {
            // eslint-disable-next-line no-console
            console.error("[tyronengouamo] fetch error", error);
            return [];
        }
        return (data ?? []) as ServiceRow[];
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[tyronengouamo] fetch exception", e);
        return [];
    }
}

export default async function TyronePage() {
    const services = await fetchTyroneServices();
    return <TyronePageClient services={services} />;
}
