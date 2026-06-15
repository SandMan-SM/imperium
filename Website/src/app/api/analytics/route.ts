export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
                query = supabase
                    .from('revenue')
                    .select('*')
                    .order('date', { ascending: false });

                if (startDate && endDate) {
                    query = query.gte('date', startDate).lte('date', endDate);
                }

                const { data: revenueData, error: revenueError } = await query;

                if (revenueError) {
                    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
                }

                data = {
                    totalRevenue: revenueData.reduce((sum, item) => sum + parseFloat(item.amount), 0),
                    revenueBySource: revenueData.reduce((acc, item) => {
                        acc[item.source] = (acc[item.source] || 0) + parseFloat(item.amount);
                        return acc;
                    }, {}),
                    revenueByCurrency: revenueData.reduce((acc, item) => {
                        acc[item.currency] = (acc[item.currency] || 0) + parseFloat(item.amount);
                        return acc;
                    }, {}),
                    dailyRevenue: revenueData.reduce((acc, item) => {
                        const date = item.date.split('T')[0];
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
        const { metric, value, metadata } = await request.json();

        if (!metric || !value) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase
            .from('analytics')
            .insert({
                metric,
                value,
                metadata: metadata || {},
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
        }

        return NextResponse.json({ message: "Analytics recorded successfully", data });

    } catch (error) {
        console.error('Analytics record error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}