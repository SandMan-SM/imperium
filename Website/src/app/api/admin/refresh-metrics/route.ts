export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
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

        // Try to update live_retention_metrics
        const { error: metricsError } = await supabase
            .from("live_retention_metrics")
            .upsert({
                total_users: totalUsers,
                premium_subscribers: premiumUsers,
                active_30d_users: active30d,
                total_network_revenue: totalRevenue,
                avg_purchases_per_user: avgPurchases,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (metricsError) {
            console.error('Metrics update error:', metricsError);
            // Continue even if metrics update fails
        }

        // Update client_health for premium users
        const premiumProfiles = profiles?.filter(p => 
            p.is_premium || p.subscription_status === 'active'
        ) || [];

        for (const profile of premiumProfiles) {
            // Check if health record exists
            const { data: existingHealth } = await supabase
                .from("client_health")
                .select("*")
                .eq("profile_id", profile.id)
                .single();

            // Get email stats (simulated - in real app would come from newsletter opens)
            const emailOpens = Math.floor(Math.random() * 20); // Placeholder
            const emailClicks = Math.floor(Math.random() * 10); // Placeholder
            
            // Calculate health score
            const healthScore = Math.min(100,
                emailOpens * 2 + 
                emailClicks * 3 + 
                (profile.purchase_count || 0) * 10 +
                (profile.updated_at && new Date(profile.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 20 : 0)
            );

            const atRiskScore = profile.updated_at && new Date(profile.updated_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                ? 80 
                : profile.updated_at && new Date(profile.updated_at) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
                    ? 50
                    : healthScore < 30 ? 60 : 0;

            const healthData = {
                profile_id: profile.id,
                health_score: healthScore,
                email_opens_30d: emailOpens,
                email_clicks_30d: emailClicks,
                purchases_30d: profile.purchase_count || 0,
                last_activity_at: profile.updated_at,
                engagement_trend: healthScore > 70 ? 'growing' : healthScore < 30 ? 'declining' : 'stable',
                at_risk_score: atRiskScore,
                updated_at: new Date().toISOString()
            };

            if (existingHealth) {
                await supabase
                    .from("client_health")
                    .update(healthData)
                    .eq("profile_id", profile.id);
            } else {
                await supabase
                    .from("client_health")
                    .insert(healthData);
            }
        }

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
