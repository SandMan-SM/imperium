'use client';

import { useMemo, useState } from 'react';
import {
    Users,
    Mail,
    ShoppingBag,
    DollarSign,
    BarChart3,
    TrendingUp,
    Eye,
    Clock,
    Share2,
    Activity,
    Globe,
    Smartphone
} from 'lucide-react';

interface AnalyticsDashboardProps {
    retentionMetrics: any;
    newsletterStats: any[];
    productStats: any[];
    affiliateStats: any[];
    userInteractions: any[];
    newsletterEngagement: any[];
}

const RANGE_MS: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

/**
 * Reads the timestamp off a row whatever the source table calls it.
 * `newsletters` / `products` / `affiliates` use created_at,
 * `user_interactions` uses timestamp, `newsletter_engagement` uses opened_at.
 */
function rowTimestamp(row: any): number | null {
    const raw = row?.created_at ?? row?.timestamp ?? row?.opened_at ?? null;
    if (!raw) return null;
    const parsed = new Date(raw).getTime();
    return Number.isNaN(parsed) ? null : parsed;
}

export function AnalyticsDashboard({
    retentionMetrics,
    newsletterStats,
    productStats,
    affiliateStats,
    userInteractions,
    newsletterEngagement
}: AnalyticsDashboardProps) {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedMetric, setSelectedMetric] = useState('all');

    // Calculate derived metrics
    const totalRevenue = productStats.reduce((sum, product) => sum + (product.revenue_generated || 0), 0);
    const totalCommissions = affiliateStats.reduce((sum, affiliate) => sum + (affiliate.total_commissions || 0), 0);

    // The time range filters the rows the panels are built from.
    const filtered = useMemo(() => {
        const window = RANGE_MS[timeRange];
        if (!window) {
            return { newsletters: newsletterStats, products: productStats, affiliates: affiliateStats, interactions: userInteractions, engagement: newsletterEngagement };
        }
        const cutoff = Date.now() - window;
        const within = (row: any) => {
            const at = rowTimestamp(row);
            return at === null ? false : at >= cutoff;
        };
        return {
            newsletters: newsletterStats.filter(within),
            products: productStats.filter(within),
            affiliates: affiliateStats.filter(within),
            interactions: userInteractions.filter(within),
            engagement: newsletterEngagement.filter(within),
        };
    }, [timeRange, newsletterStats, productStats, affiliateStats, userInteractions, newsletterEngagement]);

    // `newsletter_engagement` has no `opens` column — a row with an
    // `opened_at` timestamp IS an open.
    const totalNewsletterOpens = filtered.engagement.filter((row: any) => row.opened_at).length;
    const avgReadTime = filtered.engagement.length
        ? filtered.engagement.reduce((sum, row: any) => sum + (row.read_duration_seconds || 0), 0) / filtered.engagement.length
        : 0;

    // `user_interactions` has no `count` column — one row is one event.
    const interactionCounts = filtered.interactions.reduce((acc: Record<string, number>, interaction: any) => {
        const key = interaction.event_type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const show = (metric: string) => selectedMetric === 'all' || selectedMetric === metric;

    const card = 'bg-imperium-surface border border-imperium-border rounded-xl p-6';
    const label = 'text-sm font-medium text-white/40';
    const value = 'text-2xl font-bold text-white';

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className={card}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-light text-white">Live Analytics</h2>
                        <p className="text-sm text-white/40">Real-time tracking of all user interactions and business metrics</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            aria-label="Time range"
                            className="flex-1 sm:flex-none px-3 py-2 bg-imperium-surface border border-imperium-border rounded-md text-white/70 focus:outline-none focus:border-imperium-gold/50"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            aria-label="Metric"
                            className="flex-1 sm:flex-none px-3 py-2 bg-imperium-surface border border-imperium-border rounded-md text-white/70 focus:outline-none focus:border-imperium-gold/50"
                        >
                            <option value="all">All Metrics</option>
                            <option value="users">User Analytics</option>
                            <option value="newsletter">Newsletter Analytics</option>
                            <option value="products">Product Analytics</option>
                            <option value="affiliates">Affiliate Analytics</option>
                            <option value="interactions">Interaction Analytics</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className={card}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={label}>Total Users</p>
                            <p className={value}>
                                {retentionMetrics?.total_users?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-4 bg-imperium-gold/10 rounded-full">
                            <Users className="h-6 w-6 text-imperium-gold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-white/40">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        <span>Live tracking</span>
                    </div>
                </div>

                {/* Premium Subscribers */}
                <div className={card}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={label}>Premium Subscribers</p>
                            <p className={value}>
                                {retentionMetrics?.premium_subscribers?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-4 bg-imperium-gold/10 rounded-full">
                            <DollarSign className="h-6 w-6 text-imperium-gold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-white/40">
                        <span>Recurring revenue</span>
                    </div>
                </div>

                {/* Newsletter Opens */}
                <div className={card}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={label}>Newsletter Opens</p>
                            <p className={value}>{totalNewsletterOpens.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-imperium-gold/10 rounded-full">
                            <Mail className="h-6 w-6 text-imperium-gold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-white/40">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Avg read time: {Math.round(avgReadTime)}s</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className={card}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={label}>Total Revenue</p>
                            <p className={value}>${totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-imperium-gold/10 rounded-full">
                            <BarChart3 className="h-6 w-6 text-imperium-gold" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-white/40">
                        <span>Products + Subscriptions</span>
                    </div>
                </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Interaction Analytics */}
                {show('interactions') && (
                    <div className={card}>
                        <h3 className="text-lg font-light text-white mb-4">User Interactions</h3>
                        <div className="space-y-3">
                            {[
                                { key: 'page_view', label: 'Page Views', Icon: Activity },
                                { key: 'product_view', label: 'Product Views', Icon: Eye },
                                { key: 'newsletter_subscribe', label: 'Newsletter Subs', Icon: Mail },
                                { key: 'product_purchase', label: 'Purchases', Icon: ShoppingBag },
                                { key: 'affiliate_signup', label: 'Affiliate Signups', Icon: Share2 },
                            ].map(({ key, label: text, Icon }) => (
                                <div key={key} className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/[0.06] rounded">
                                    <div className="flex items-center text-white/70">
                                        <Icon className="h-4 w-4 text-imperium-gold mr-2" />
                                        <span>{text}</span>
                                    </div>
                                    <span className="font-semibold text-white">{interactionCounts[key] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Performance */}
                {show('products') && (
                    <div className={card}>
                        <h3 className="text-lg font-light text-white mb-4">Top Products</h3>
                        <div className="space-y-4">
                            {filtered.products.slice(0, 5).map((product: any) => (
                                <div key={product.id} className="flex justify-between items-center p-4 border border-white/[0.07] rounded">
                                    <div>
                                        <p className="font-medium text-white">{product.name}</p>
                                        <p className="text-sm text-white/40">Views: {product.views_count || 0} • Sales: {product.purchase_count || 0}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">${product.revenue_generated?.toLocaleString() || '0'}</p>
                                        <p className="text-sm text-white/40">Price: ${product.price || '0'}</p>
                                    </div>
                                </div>
                            ))}
                            {filtered.products.length === 0 && (
                                <p className="text-sm text-white/25">No product activity in this range.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Newsletter and Affiliate Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Newsletter Performance */}
                {show('newsletter') && (
                    <div className={card}>
                        <h3 className="text-lg font-light text-white mb-4">Newsletter Performance</h3>
                        <div className="space-y-3">
                            {filtered.newsletters.slice(0, 5).map((newsletter: any) => {
                                const engagement = filtered.engagement.filter((e: any) => e.newsletter_id === newsletter.id);
                                return (
                                    <div key={newsletter.id} className="flex justify-between items-center p-4 border border-white/[0.07] rounded">
                                        <div>
                                            <p className="font-medium text-white">{newsletter.title}</p>
                                            <p className="text-sm text-white/40">
                                                {newsletter.published ? 'Published' : 'Draft'} • {newsletter.is_public ? 'Public' : 'Private'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">{engagement.length} opens</p>
                                            <p className="text-sm text-white/40">
                                                Avg: {Math.round(
                                                    engagement.length
                                                        ? engagement.reduce((sum: number, e: any) => sum + (e.read_duration_seconds || 0), 0) / engagement.length
                                                        : 0
                                                )}s
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            {filtered.newsletters.length === 0 && (
                                <p className="text-sm text-white/25">No newsletters in this range.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Affiliate Performance */}
                {show('affiliates') && (
                    <div className={card}>
                        <h3 className="text-lg font-light text-white mb-4">Affiliate Performance</h3>
                        <div className="space-y-3">
                            {filtered.affiliates.slice(0, 5).map((affiliate: any) => (
                                <div key={affiliate.id} className="flex justify-between items-center p-4 border border-white/[0.07] rounded">
                                    <div>
                                        <p className="font-medium text-white">{affiliate.name}</p>
                                        <p className="text-sm text-white/40">{affiliate.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">${affiliate.total_earnings?.toLocaleString() || '0'}</p>
                                        <p className="text-sm text-white/40">Commissions: {affiliate.total_commissions || 0}</p>
                                    </div>
                                </div>
                            ))}
                            {filtered.affiliates.length === 0 && (
                                <p className="text-sm text-white/25">No affiliate activity in this range.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Live Metrics */}
            <div className={card}>
                <h3 className="text-lg font-light text-white mb-4">Live Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                        <Globe className="h-8 w-8 text-imperium-gold mx-auto mb-2" />
                        <p className="text-sm text-white/40">Active Users</p>
                        <p className={value}>{retentionMetrics?.active_30d_users || '0'}</p>
                    </div>
                    <div className="text-center p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                        <Smartphone className="h-8 w-8 text-imperium-gold mx-auto mb-2" />
                        <p className="text-sm text-white/40">Avg Purchases/User</p>
                        <p className={value}>{retentionMetrics?.avg_purchases_per_user || '0'}</p>
                    </div>
                    <div className="text-center p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                        <DollarSign className="h-8 w-8 text-imperium-gold mx-auto mb-2" />
                        <p className="text-sm text-white/40">Network Revenue</p>
                        <p className={value}>${retentionMetrics?.total_network_revenue?.toLocaleString() || '0'}</p>
                    </div>
                </div>
                {show('users') && (
                    <p className="mt-4 text-xs text-white/30">
                        Affiliate commissions across the selected range: ${totalCommissions.toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    );
}
