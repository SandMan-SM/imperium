'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

/**
 * The operator's analytics dashboard.
 *
 * The page used to be a server component that read the tables with the
 * service-role key and rendered them straight into the HTML. It had no gate:
 * anyone who guessed `/admin/analytics` saw the revenue figures, the
 * subscriber counts and the affiliate earnings.
 *
 * The data now comes from `/api/admin/analytics`, which checks the caller's
 * session before it reads anything. The redirect below is a convenience for
 * the operator who clicked the wrong link; the gate that matters is on the
 * route.
 */

interface RetentionMetrics {
    total_users?: number | null;
    premium_subscribers?: number | null;
    active_30d_users?: number | null;
    avg_purchases_per_user?: number | null;
    total_network_revenue?: number | null;
}

interface TimedRow {
    created_at?: string | null;
    timestamp?: string | null;
    opened_at?: string | null;
}

interface NewsletterStat extends TimedRow {
    id: string;
    title?: string | null;
    is_public?: boolean | null;
    published?: boolean | null;
}

interface ProductStat extends TimedRow {
    id: string;
    name?: string | null;
    views_count?: number | null;
    purchase_count?: number | null;
    revenue_generated?: number | null;
    price?: number | null;
}

interface AffiliateStat extends TimedRow {
    id: string;
    name?: string | null;
    email?: string | null;
    total_earnings?: number | null;
    total_commissions?: number | null;
    status?: string | null;
}

interface UserInteraction extends TimedRow {
    id?: string | null;
    event_type?: string | null;
}

interface NewsletterEngagement extends TimedRow {
    id?: string | null;
    newsletter_id?: string | null;
    read_duration_seconds?: number | null;
}

interface AnalyticsPayload {
    retentionMetrics: RetentionMetrics | null;
    newsletterStats: NewsletterStat[];
    productStats: ProductStat[];
    affiliateStats: AffiliateStat[];
    userInteractions: UserInteraction[];
    newsletterEngagement: NewsletterEngagement[];
}

export default function AnalyticsAdminClient() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<AnalyticsPayload | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;

        if (!user || !profile?.is_admin) {
            router.replace('/portal');
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;

                const response = await fetch('/api/admin/analytics', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(
                        response.status === 403
                            ? 'This dashboard is for administrators.'
                            : `The analytics could not be loaded (${response.status}).`,
                    );
                }

                const payload = (await response.json()) as AnalyticsPayload;
                if (!cancelled) setData(payload);
            } catch (cause) {
                if (!cancelled) {
                    setError(cause instanceof Error ? cause.message : 'The analytics could not be loaded.');
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [loading, user, profile?.is_admin, router]);

    if (loading || !user || !profile?.is_admin) {
        return (
            <div className="min-h-screen bg-imperium-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-imperium-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-light text-white">Analytics Dashboard</h1>
                    <p className="mt-2 text-red-400/80">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-imperium-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-imperium-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-imperium-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-white">Analytics Dashboard</h1>
                    <p className="mt-2 text-white/40">Comprehensive tracking and analytics for all user interactions</p>
                </div>

                <AnalyticsDashboard
                    retentionMetrics={data.retentionMetrics}
                    newsletterStats={data.newsletterStats}
                    productStats={data.productStats}
                    affiliateStats={data.affiliateStats}
                    userInteractions={data.userInteractions}
                    newsletterEngagement={data.newsletterEngagement}
                />
            </div>
        </div>
    );
}
