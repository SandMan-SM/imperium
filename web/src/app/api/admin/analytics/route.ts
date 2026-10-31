export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { isAdminRequest } from '@/lib/server/admin-auth';

/**
 * The operator's analytics datasets.
 *
 * The analytics dashboard used to be a server component that read the tables
 * with the service-role key and rendered them. It had no gate of any kind:
 * the page sat at a guessable URL and answered anyone who asked, so revenue,
 * subscriber counts, affiliate earnings and profile emails were readable by
 * a stranger with no account at all.
 *
 * The read now happens here, where the caller's session is checked first
 * (`isAdminRequest`), and the page below only renders what this route
 * returns. A client-side redirect is a convenience, not a gate — the data
 * never leaves the server without the token.
 *
 * The empty tables are real, not broken: `affiliates`, `user_interactions`
 * and `newsletter_engagement` have no rows in the live database. The route
 * returns empty arrays for them and the dashboard renders its empty states.
 */

export async function GET(request: Request) {
    try {
        if (!(await isAdminRequest(request))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        const [retentionMetrics, newsletterStats, productStats, affiliateStats, userInteractions, newsletterEngagement] =
            await Promise.all([
                admin.from('live_retention_metrics').select('*').limit(1),
                admin
                    .from('newsletters')
                    .select('id, title, created_at, is_public, published')
                    .order('created_at', { ascending: false }),
                admin
                    .from('products')
                    .select('id, name, views_count, purchase_count, revenue_generated, price, created_at')
                    .order('views_count', { ascending: false }),
                admin
                    .from('affiliates')
                    .select('id, name, email, total_earnings, total_commissions, status, created_at')
                    .order('total_earnings', { ascending: false }),
                admin.from('user_interactions').select('*'),
                admin.from('newsletter_engagement').select('*'),
            ]);

        return NextResponse.json({
            retentionMetrics: (retentionMetrics.data || [])[0] || null,
            newsletterStats: newsletterStats.data || [],
            productStats: productStats.data || [],
            affiliateStats: affiliateStats.data || [],
            userInteractions: userInteractions.data || [],
            newsletterEngagement: newsletterEngagement.data || [],
        });
    } catch (error) {
        console.error('Admin analytics read failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
