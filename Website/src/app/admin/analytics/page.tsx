import { supabase } from '@/lib/supabase';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export const metadata = {
    title: 'Analytics - Imperium Admin',
    description: 'Comprehensive analytics and tracking dashboard',
};

export default async function AnalyticsPage() {
    // Prefer the service-role client so the dashboard sees every row, but
    // fall back to the anon client rather than throwing when the service
    // key is not present (local builds).
    const db = getAdminClient() ?? supabase;

    // Fetch comprehensive analytics data
    const [
        { data: retentionMetrics },
        { data: newsletterStats },
        { data: productStats },
        { data: affiliateStats },
        { data: userInteractions },
        { data: newsletterEngagement }
    ] = await Promise.all([
        db.from('live_retention_metrics').select('*').single(),
        db.from('newsletters').select('id, title, created_at, is_public, published').order('created_at', { ascending: false }),
        db.from('products').select('id, name, views_count, purchase_count, revenue_generated, price, created_at').order('views_count', { ascending: false }),
        db.from('affiliates').select('id, name, email, total_earnings, total_commissions, status, created_at').order('total_earnings', { ascending: false }),
        db.from('user_interactions').select('*'),
        db.from('newsletter_engagement').select('*')
    ]);

    return (
        <div className="min-h-screen bg-imperium-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-white">Analytics Dashboard</h1>
                    <p className="mt-2 text-white/40">Comprehensive tracking and analytics for all user interactions</p>
                </div>

                <AnalyticsDashboard
                    retentionMetrics={retentionMetrics}
                    newsletterStats={newsletterStats || []}
                    productStats={productStats || []}
                    affiliateStats={affiliateStats || []}
                    userInteractions={userInteractions || []}
                    newsletterEngagement={newsletterEngagement || []}
                />
            </div>
        </div>
    );
}
