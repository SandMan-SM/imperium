'use client';

import { useState, useEffect } from 'react';
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
    const totalNewsletterOpens = newsletterEngagement.reduce((sum, engagement) => sum + (engagement.opens || 0), 0);
    const avgReadTime = newsletterEngagement.reduce((sum, engagement) => sum + (engagement.avg_read_time || 0), 0) / newsletterEngagement.length || 0;

    // Get interaction counts by type
    const interactionCounts = userInteractions.reduce((acc, interaction) => {
        acc[interaction.event_type] = interaction.count;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Live Analytics</h2>
                        <p className="text-sm text-gray-600">Real-time tracking of all user interactions and business metrics</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {retentionMetrics?.total_users?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        <span>Live tracking</span>
                    </div>
                </div>

                {/* Premium Subscribers */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Premium Subscribers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {retentionMetrics?.premium_subscribers?.toLocaleString() || '0'}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                        <span>Recurring revenue</span>
                    </div>
                </div>

                {/* Newsletter Opens */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Newsletter Opens</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalNewsletterOpens.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <Mail className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Avg read time: {Math.round(avgReadTime)}s</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${totalRevenue.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <BarChart3 className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                        <span>Products + Subscriptions</span>
                    </div>
                </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Interaction Analytics */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Interactions</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                                <Activity className="h-4 w-4 text-blue-600 mr-2" />
                                <span>Page Views</span>
                            </div>
                            <span className="font-semibold">{interactionCounts.page_view || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                                <Eye className="h-4 w-4 text-green-600 mr-2" />
                                <span>Product Views</span>
                            </div>
                            <span className="font-semibold">{interactionCounts.product_view || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 text-red-600 mr-2" />
                                <span>Newsletter Subs</span>
                            </div>
                            <span className="font-semibold">{interactionCounts.newsletter_subscribe || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                                <ShoppingBag className="h-4 w-4 text-purple-600 mr-2" />
                                <span>Purchases</span>
                            </div>
                            <span className="font-semibold">{interactionCounts.product_purchase || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                                <Share2 className="h-4 w-4 text-yellow-600 mr-2" />
                                <span>Affiliate Signups</span>
                            </div>
                            <span className="font-semibold">{interactionCounts.affiliate_signup || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Product Performance */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                    <div className="space-y-4">
                        {productStats.slice(0, 5).map((product) => (
                            <div key={product.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-600">Views: {product.views_count || 0} • Sales: {product.purchase_count || 0}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">${product.revenue_generated?.toLocaleString() || '0'}</p>
                                    <p className="text-sm text-gray-600">Price: ${product.price || '0'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter and Affiliate Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Newsletter Performance */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Performance</h3>
                    <div className="space-y-3">
                        {newsletterStats.slice(0, 5).map((newsletter) => {
                            const engagement = newsletterEngagement.find(e => e.newsletter_id === newsletter.id);
                            return (
                                <div key={newsletter.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                                    <div>
                                        <p className="font-medium text-gray-900">{newsletter.title}</p>
                                        <p className="text-sm text-gray-600">
                                            {newsletter.published ? 'Published' : 'Draft'} • {newsletter.is_public ? 'Public' : 'Private'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{engagement?.opens || 0} opens</p>
                                        <p className="text-sm text-gray-600">Avg: {Math.round(engagement?.avg_read_time || 0)}s</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Affiliate Performance */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Affiliate Performance</h3>
                    <div className="space-y-3">
                        {affiliateStats.slice(0, 5).map((affiliate) => (
                            <div key={affiliate.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                                <div>
                                    <p className="font-medium text-gray-900">{affiliate.name}</p>
                                    <p className="text-sm text-gray-600">{affiliate.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">${affiliate.total_earnings?.toLocaleString() || '0'}</p>
                                    <p className="text-sm text-gray-600">Commissions: {affiliate.total_commissions || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Metrics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{retentionMetrics?.active_30d_users || '0'}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Avg Purchases/User</p>
                        <p className="text-2xl font-bold text-gray-900">{retentionMetrics?.avg_purchases_per_user || '0'}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Network Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${retentionMetrics?.total_network_revenue?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}