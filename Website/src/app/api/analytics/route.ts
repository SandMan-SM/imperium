export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/server/imperium-capture";
import { isAdminRequest } from "@/lib/server/admin-auth";

/** Mirrors the CHECK constraint on `user_interactions.event_type`. */
const ALLOWED_EVENT_TYPES = new Set([
    'page_view',
    'click',
    'form_submit',
    'newsletter_subscribe',
    'newsletter_unsubscribe',
    'product_view',
    'product_purchase',
    'affiliate_signup',
    'newsletter_open',
    'newsletter_read',
]);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const startDate = url.searchParams.get('start_date');
        const endDate = url.searchParams.get('end_date');
        const metric = url.searchParams.get('metric') || 'revenue';

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        let query;
        let data;

        switch (metric) {
            case 'revenue':
                // The live database has no `revenue` table; money movements
                // live in `transactions` (amount, currency, type, paid_at).
                query = supabase
                    .from('transactions')
                    .select('amount,currency,type,status,paid_at,created_at')
                    .order('created_at', { ascending: false });

                if (startDate && endDate) {
                    query = query.gte('created_at', startDate).lte('created_at', endDate);
                }

                const { data: revenueData, error: revenueError } = await query;

                if (revenueError) {
                    console.error('Analytics revenue query failed:', revenueError.message);
                    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
                }

                data = {
                    totalRevenue: revenueData.reduce((sum, item) => sum + parseFloat(item.amount), 0),
                    revenueBySource: revenueData.reduce<Record<string, number>>((acc, item) => {
                        const source = item.type || 'unknown';
                        acc[source] = (acc[source] || 0) + parseFloat(item.amount);
                        return acc;
                    }, {}),
                    revenueByCurrency: revenueData.reduce<Record<string, number>>((acc, item) => {
                        const currency = item.currency || 'unknown';
                        acc[currency] = (acc[currency] || 0) + parseFloat(item.amount);
                        return acc;
                    }, {}),
                    dailyRevenue: revenueData.reduce<Record<string, number>>((acc, item) => {
                        const stamp = item.paid_at || item.created_at;
                        if (!stamp) return acc;
                        const date = String(stamp).split('T')[0];
                        acc[date] = (acc[date] || 0) + parseFloat(item.amount);
                        return acc;
                    }, {})
                };
                break;

            case 'subscriptions':
                query = supabase
                    .from('subscriptions')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (startDate && endDate) {
                    query = query.gte('created_at', startDate).lte('created_at', endDate);
                }

                const { data: subscriptionData, error: subscriptionError } = await query;

                if (subscriptionError) {
                    return NextResponse.json({ error: "Failed to fetch subscription data" }, { status: 500 });
                }

                data = {
                    totalSubscriptions: subscriptionData.length,
                    activeSubscriptions: subscriptionData.filter(s => s.status === 'active').length,
                    canceledSubscriptions: subscriptionData.filter(s => s.status === 'canceled').length,
                    subscriptionsByTier: subscriptionData.reduce((acc, item) => {
                        acc[item.tier] = (acc[item.tier] || 0) + 1;
                        return acc;
                    }, {}),
                    monthlyRecurringRevenue: subscriptionData
                        .filter(s => s.status === 'active')
                        .reduce((sum, item) => sum + (item.amount || 20), 0)
                };
                break;

            case 'referrals':
                query = supabase
                    .from('referrals')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (startDate && endDate) {
                    query = query.gte('created_at', startDate).lte('created_at', endDate);
                }

                const { data: referralData, error: referralError } = await query;

                if (referralError) {
                    return NextResponse.json({ error: "Failed to fetch referral data" }, { status: 500 });
                }

                data = {
                    totalReferrals: referralData.length,
                    successfulReferrals: referralData.filter(r => r.status === 'completed').length,
                    pendingReferrals: referralData.filter(r => r.status === 'pending').length,
                    referralEarnings: referralData.reduce((sum, item) => sum + parseFloat(item.commission || 0), 0),
                    topReferrers: referralData.reduce((acc, item) => {
                        acc[item.referrer_id] = (acc[item.referrer_id] || 0) + 1;
                        return acc;
                    }, {})
                };
                break;

            case 'affiliates':
                query = supabase
                    .from('affiliates')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (startDate && endDate) {
                    query = query.gte('created_at', startDate).lte('created_at', endDate);
                }

                const { data: affiliateData, error: affiliateError } = await query;

                if (affiliateError) {
                    return NextResponse.json({ error: "Failed to fetch affiliate data" }, { status: 500 });
                }

                data = {
                    totalAffiliates: affiliateData.length,
                    activeAffiliates: affiliateData.filter(a => a.status === 'active').length,
                    totalCommissions: affiliateData.reduce((sum, item) => sum + parseFloat(item.total_commissions || 0), 0),
                    totalPayouts: affiliateData.reduce((sum, item) => sum + parseFloat(item.total_earnings || 0), 0),
                    averageCommissionRate: affiliateData.reduce((sum, item) => sum + parseFloat(item.commission_rate || 0), 0) / affiliateData.length
                };
                break;

            default:
                return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
        }

        return NextResponse.json({
            metric,
            data,
            dateRange: { start: startDate, end: endDate }
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Recording is an operator action: the row is written with the
        // service-role client, so the route has to be gated the same way the
        // newsletter send route is.
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { metric, value, metadata } = await request.json();

        if (!metric || !value) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // `user_interactions.event_type` is constrained to a fixed list, so
        // an arbitrary metric can never be written.
        if (!ALLOWED_EVENT_TYPES.has(metric)) {
            return NextResponse.json({ error: `Unsupported metric. Allowed: ${[...ALLOWED_EVENT_TYPES].join(', ')}` }, { status: 400 });
        }

        const supabase = getAdminClient();
        if (!supabase) {
            return NextResponse.json({ error: "Analytics backend not configured" }, { status: 503 });
        }

        // The live database has no `analytics` table; interaction events live
        // in `user_interactions`.
        const { data, error } = await supabase
            .from('user_interactions')
            .insert({
                event_type: metric,
                event_data: { value, metadata: metadata || {} },
                page_url: metadata?.page_url ?? request.url,
                session_id: metadata?.session_id ?? '',
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Analytics record failed:', error.message);
            return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
        }

        return NextResponse.json({ message: "Analytics recorded successfully", data });

    } catch (error) {
        console.error('Analytics record error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}