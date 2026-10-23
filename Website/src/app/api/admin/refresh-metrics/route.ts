export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        // Get stats from profiles
        const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, is_premium, subscription_status, total_spent, purchase_count, updated_at, created_at");

        if (profilesError) throw profilesError;

        const totalUsers = profiles?.length || 0;
        const premiumUsers = profiles?.filter(p => 
            p.is_premium || p.subscription_status === 'active'
        ).length || 0;
        const active30d = profiles?.filter(p => 
            p.updated_at && new Date(p.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length || 0;
        const totalRevenue = profiles?.reduce((sum, p) => sum + (p.total_spent || 0), 0) || 0;
        const avgPurchases = totalUsers > 0 
            ? (profiles?.reduce((sum, p) => sum + (p.purchase_count || 0), 0) || 0) / totalUsers 
            : 0;

        // `live_retention_metrics` is a database view over the fleet tables — it
        // is not updatable, and the admin console reads it directly. The stats
        // above are computed live from `profiles` and returned to the caller.

        return NextResponse.json({ 
            success: true, 
            stats: {
                totalUsers,
                premiumUsers,
                active30d,
                totalRevenue,
                avgPurchases
            }
        });
    } catch (error) {
        console.error('Error refreshing metrics:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
