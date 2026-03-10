"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    DollarSign,
    Users,
    TrendingUp,
    CreditCard,
    Calendar,
    Filter
} from "lucide-react";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    useEffect(() => {
        fetchAnalyticsData();
    }, [dateRange, selectedMetric]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/analytics?start_date=${dateRange.start}&end_date=${dateRange.end}&metric=${selectedMetric}`);
            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-imperium-gold mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Header */}
            <div className="border-b border-imperium-gold/20 pt-[84px] pb-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-light text-white uppercase tracking-widest mb-2">Revenue Analytics</h1>
                            <p className="text-gray-400">Real-time insights into your monetization strategy</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/[0.02] border border-imperium-gold/20 rounded-lg p-2">
                                <Calendar className="w-4 h-4 text-imperium-gold" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="bg-transparent text-white text-sm border-none outline-none"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="bg-transparent text-white text-sm border-none outline-none"
                                />
                            </div>
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="bg-white/[0.02] border border-imperium-gold/20 rounded-lg px-4 py-2 text-white text-sm"
                            >
                                <option value="revenue">Revenue</option>
                                <option value="subscriptions">Subscriptions</option>
                                <option value="referrals">Referrals</option>
                                <option value="affiliates">Affiliates</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-imperium-gold/10 to-transparent border border-imperium-gold/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(analyticsData.data?.totalRevenue || 0)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-imperium-gold" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active Subscriptions</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatNumber(analyticsData.data?.activeSubscriptions || 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Referrals</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatNumber(analyticsData.data?.totalReferrals || 0)}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active Affiliates</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatNumber(analyticsData.data?.activeAffiliates || 0)}
                                </p>
                            </div>
                            <CreditCard className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4">Daily Revenue</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.entries(analyticsData.data?.dailyRevenue || {}).map(([date, amount]) => ({ date, amount }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        color: 'white'
                                    }}
                                />
                                <Bar dataKey="amount" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue by Source */}
                    <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                        <h3 className="text-white font-semibold mb-4">Revenue by Source</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(analyticsData.data?.revenueBySource || {}).map(([source, amount]) => ({ name: source, value: amount }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name?: string; percent?: number }) => name ? `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%` : ''}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {Object.entries(analyticsData.data?.revenueBySource || {}).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        color: 'white'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subscriptions by Tier */}
                    {selectedMetric === 'subscriptions' && (
                        <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-4">Subscriptions by Tier</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={Object.entries(analyticsData.data?.subscriptionsByTier || {}).map(([tier, count]) => ({ tier, count }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="tier" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            color: 'white'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Referrals by Status */}
                    {selectedMetric === 'referrals' && (
                        <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                            <h3 className="text-white font-semibold mb-4">Referrals by Status</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={[
                                    { name: 'Pending', value: analyticsData.data?.pendingReferrals || 0 },
                                    { name: 'Completed', value: analyticsData.data?.successfulReferrals || 0 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #333',
                                            color: 'white'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#ffc658" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Detailed Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedMetric === 'subscriptions' && (
                        <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                            <h4 className="text-white font-semibold mb-4">Subscription Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Subscriptions:</span>
                                    <span className="text-white">{formatNumber(analyticsData.data?.totalSubscriptions || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Canceled:</span>
                                    <span className="text-red-400">{formatNumber(analyticsData.data?.canceledSubscriptions || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">MRR:</span>
                                    <span className="text-green-400">{formatCurrency(analyticsData.data?.monthlyRecurringRevenue || 0)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMetric === 'referrals' && (
                        <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                            <h4 className="text-white font-semibold mb-4">Referral Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Referral Earnings:</span>
                                    <span className="text-green-400">{formatCurrency(analyticsData.data?.referralEarnings || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Success Rate:</span>
                                    <span className="text-blue-400">{analyticsData.data?.successfulReferrals || 0}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMetric === 'affiliates' && (
                        <div className="bg-white/[0.02] border border-imperium-gold/20 rounded-xl p-6">
                            <h4 className="text-white font-semibold mb-4">Affiliate Metrics</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Commissions:</span>
                                    <span className="text-green-400">{formatCurrency(analyticsData.data?.totalCommissions || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Total Payouts:</span>
                                    <span className="text-blue-400">{formatCurrency(analyticsData.data?.totalPayouts || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Avg Commission Rate:</span>
                                    <span className="text-purple-400">{(analyticsData.data?.averageCommissionRate || 0).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}