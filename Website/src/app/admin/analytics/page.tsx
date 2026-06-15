import { supabase } from '../../../lib/supabase';
import { AnalyticsDashboard } from '../../../components/AnalyticsDashboard';

export const metadata = {
    title: 'Analytics - Imperium Admin',
    description: 'Comprehensive analytics and tracking dashboard',
};

export default async function AnalyticsPage() {
    // Fetch comprehensive analytics data
    const [
        { data: retentionMetrics },
        { data: newsletterStats },
        { data: productStats },
        { data: affiliateStats },
        { data: userInteractions },
        { data: newsletterEngagement }
    ] = await Promise.all([
        supabase.from('live_retention_metrics').select('*').single(),
        supabase.from('newsletters').select('id, title, created_at, is_public, published').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, views_count, purchase_count, revenue_generated, price').order('views_count', { ascending: false }),
        supabase.from('affiliates').select('id, name, email, total_earnings, total_commissions, status').order('total_earnings', { ascending: false }),
        supabase.from('user_interactions').select('*'),
        supabase.from('newsletter_engagement').select('*')
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="mt-2 text-gray-600">Comprehensive tracking and analytics for all user interactions</p>
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
