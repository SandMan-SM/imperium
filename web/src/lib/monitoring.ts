/**
 * Comprehensive Monitoring and Feedback System
 * 
 * This module provides real-time monitoring, performance tracking, and
 * feedback collection to prevent hallucinations and maintain system health.
 */

interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    tags?: Record<string, string>;
}

interface SystemHealth {
    timestamp: number;
    status: 'healthy' | 'degraded' | 'critical';
    metrics: {
        responseTime: number;
        errorRate: number;
        memoryUsage: number;
        cpuUsage: number;
        activeUsers: number;
    };
    issues: string[];
    recommendations: string[];
}

interface UserFeedback {
    id: string;
    userId?: string;
    sessionId?: string;
    type: 'error' | 'confusion' | 'suggestion' | 'praise';
    message: string;
    context?: any;
    timestamp: number;
    isResolved: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

interface MonitoringConfig {
    enableRealTimeMonitoring: boolean;
    enablePerformanceTracking: boolean;
    enableFeedbackCollection: boolean;
    enableHealthChecks: boolean;
    samplingRate: number; // 0-1
    alertThresholds: {
        responseTime: number; // ms
        errorRate: number; // percentage
        memoryUsage: number; // percentage
        cpuUsage: number; // percentage
    };
    feedbackTimeout: number; // ms
}

class MonitoringSystem {
    private config: MonitoringConfig;
    private performanceMetrics: PerformanceMetric[] = [];
    private systemHealth: SystemHealth | null = null;
    private feedbackQueue: UserFeedback[] = [];
    private healthCheckInterval: NodeJS.Timeout | null = null;
    private performanceTrackingEnabled = false;
    private lastHealthCheck = 0;

    constructor(config?: Partial<MonitoringConfig>) {
        this.config = {
            enableRealTimeMonitoring: true,
            enablePerformanceTracking: true,
            enableFeedbackCollection: true,
            enableHealthChecks: true,
            samplingRate: 0.1, // Sample 10% of requests
            alertThresholds: {
                responseTime: 2000, // 2 seconds
                errorRate: 5, // 5%
                memoryUsage: 80, // 80%
                cpuUsage: 70 // 70%
            },
            feedbackTimeout: 300000, // 5 minutes
            ...config
        };
    }

    /**
     * Start monitoring system
     */
    start(): void {
        if (this.config.enableHealthChecks) {
            this.startHealthChecks();
        }

        if (this.config.enablePerformanceTracking) {
            this.startPerformanceTracking();
        }

        console.log('Monitoring system started');
    }

    /**
     * Stop monitoring system
     */
    stop(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        this.performanceTrackingEnabled = false;
        console.log('Monitoring system stopped');
    }

    /**
     * Record a performance metric
     */
    recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
        if (!this.config.enablePerformanceTracking) {
            return;
        }

        // Apply sampling
        if (Math.random() > this.config.samplingRate) {
            return;
        }

        const performanceMetric: PerformanceMetric = {
            ...metric,
            timestamp: Date.now()
        };

        this.performanceMetrics.push(performanceMetric);

        // Maintain metrics history size
        if (this.performanceMetrics.length > 10000) {
            this.performanceMetrics.shift();
        }

        // Check for performance alerts
        this.checkPerformanceAlerts(performanceMetric);
    }

    /**
     * Collect user feedback
     */
    collectFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'isResolved'>): string {
        if (!this.config.enableFeedbackCollection) {
            return '';
        }

        const feedbackEntry: UserFeedback = {
            ...feedback,
            id: this.generateId(),
            timestamp: Date.now(),
            isResolved: false
        };

        this.feedbackQueue.push(feedbackEntry);

        // Process feedback based on type
        this.processFeedback(feedbackEntry);

        return feedbackEntry.id;
    }

    /**
     * Resolve user feedback
     */
    resolveFeedback(feedbackId: string, resolution?: string): boolean {
        const feedback = this.feedbackQueue.find(f => f.id === feedbackId);
        if (!feedback) {
            return false;
        }

        feedback.isResolved = true;

        if (resolution) {
            // Log resolution
            console.log(`Feedback ${feedbackId} resolved: ${resolution}`);
        }

        return true;
    }

    /**
     * Get system health status
     */
    getSystemHealth(): SystemHealth | null {
        return this.systemHealth;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats(timeRange?: { start: number; end: number }): {
        metrics: PerformanceMetric[];
        averages: Record<string, number>;
        percentiles: Record<string, number>;
        trends: Record<string, number>;
    } {
        const metrics = timeRange
            ? this.performanceMetrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
            : this.performanceMetrics;

        const averages = this.calculateAverages(metrics);
        const percentiles = this.calculatePercentiles(metrics);
        const trends = this.calculateTrends(metrics);

        return {
            metrics,
            averages,
            percentiles,
            trends
        };
    }

    /**
     * Get unresolved feedback
     */
    getUnresolvedFeedback(): UserFeedback[] {
        return this.feedbackQueue.filter(f => !f.isResolved);
    }

    /**
     * Get monitoring dashboard data
     */
    getDashboardData(): {
        health: SystemHealth | null;
        performance: any;
        feedback: { total: number; unresolved: number; byType: Record<string, number> };
        alerts: string[];
    } {
        const performance = this.getPerformanceStats({
            start: Date.now() - (60 * 60 * 1000), // Last hour
            end: Date.now()
        });

        const feedbackStats = {
            total: this.feedbackQueue.length,
            unresolved: this.feedbackQueue.filter(f => !f.isResolved).length,
            byType: this.groupFeedbackByType()
        };

        const alerts = this.getRecentAlerts();

        return {
            health: this.systemHealth,
            performance,
            feedback: feedbackStats,
            alerts
        };
    }

    // Private methods

    private startHealthChecks(): void {
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Check every 30 seconds
    }

    private startPerformanceTracking(): void {
        this.performanceTrackingEnabled = true;

        // Track page load performance
        if (typeof window !== 'undefined' && window.performance && window.performance.getEntriesByType) {
            window.addEventListener('load', () => {
                const navigationEntries = window.performance.getEntriesByType('navigation');
                if (navigationEntries.length > 0) {
                    const navigation = navigationEntries[0] as any;

                    this.recordMetric({
                        name: 'page_load_time',
                        value: navigation.loadEventEnd - navigation.fetchStart,
                        unit: 'ms'
                    });

                    this.recordMetric({
                        name: 'dom_content_loaded',
                        value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                        unit: 'ms'
                    });
                }
            });
        }
    }

    private async performHealthCheck(): Promise<void> {
        const now = Date.now();

        // Don't check too frequently
        if (now - this.lastHealthCheck < 5000) {
            return;
        }

        this.lastHealthCheck = now;

        try {
            const health = await this.calculateSystemHealth();
            this.systemHealth = health;

            // Check for health alerts
            this.checkHealthAlerts(health);

            // Log health status
            console.log(`System health: ${health.status}`, health.metrics);
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }

    private async calculateSystemHealth(): Promise<SystemHealth> {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Calculate response time from recent metrics
        const recentMetrics = this.performanceMetrics.filter(m => m.timestamp > oneHourAgo);
        const responseTime = this.calculateAverageResponseTime(recentMetrics);

        // Calculate error rate
        const errorRate = this.calculateErrorRate(recentMetrics);

        // Get memory usage (if available)
        const memoryUsage = this.getMemoryUsage();

        // Get CPU usage (if available)
        const cpuUsage = this.getCpuUsage();

        // Calculate active users (simplified)
        const activeUsers = this.getActiveUsers();

        const metrics = {
            responseTime,
            errorRate,
            memoryUsage,
            cpuUsage,
            activeUsers
        };

        // Determine health status
        let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (responseTime > this.config.alertThresholds.responseTime) {
            status = responseTime > this.config.alertThresholds.responseTime * 2 ? 'critical' : 'degraded';
            issues.push(`High response time: ${responseTime}ms`);
            recommendations.push('Optimize database queries and caching');
        }

        if (errorRate > this.config.alertThresholds.errorRate) {
            status = errorRate > this.config.alertThresholds.errorRate * 2 ? 'critical' : 'degraded';
            issues.push(`High error rate: ${errorRate}%`);
            recommendations.push('Review error handling and fix critical bugs');
        }

        if (memoryUsage > this.config.alertThresholds.memoryUsage) {
            status = memoryUsage > this.config.alertThresholds.memoryUsage * 1.2 ? 'critical' : 'degraded';
            issues.push(`High memory usage: ${memoryUsage}%`);
            recommendations.push('Review memory leaks and optimize data structures');
        }

        if (cpuUsage > this.config.alertThresholds.cpuUsage) {
            status = cpuUsage > this.config.alertThresholds.cpuUsage * 1.2 ? 'critical' : 'degraded';
            issues.push(`High CPU usage: ${cpuUsage}%`);
            recommendations.push('Optimize algorithms and consider scaling');
        }

        return {
            timestamp: now,
            status,
            metrics,
            issues,
            recommendations
        };
    }

    private calculateAverageResponseTime(metrics: PerformanceMetric[]): number {
        const responseTimeMetrics = metrics.filter(m => m.name === 'response_time');
        if (responseTimeMetrics.length === 0) {
            return 0;
        }

        const total = responseTimeMetrics.reduce((sum, m) => sum + m.value, 0);
        return total / responseTimeMetrics.length;
    }

    private calculateErrorRate(metrics: PerformanceMetric[]): number {
        const totalRequests = metrics.filter(m => m.name === 'request_count').length;
        const errorRequests = metrics.filter(m => m.name === 'error_count').length;

        if (totalRequests === 0) {
            return 0;
        }

        return (errorRequests / totalRequests) * 100;
    }

    private getMemoryUsage(): number {
        // Simplified memory usage calculation
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            const memory = (performance as any).memory;
            return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        }
        return 0;
    }

    private getCpuUsage(): number {
        // Simplified CPU usage calculation
        // In a real implementation, you would get this from system metrics
        return 0;
    }

    private getActiveUsers(): number {
        // Simplified active users calculation
        // In a real implementation, you would track active sessions
        return 0;
    }

    private calculateAverages(metrics: PerformanceMetric[]): Record<string, number> {
        const averages: Record<string, number> = {};

        const groupedMetrics = this.groupMetricsByName(metrics);

        Object.entries(groupedMetrics).forEach(([name, metricList]) => {
            const total = metricList.reduce((sum, m) => sum + m.value, 0);
            averages[name] = total / metricList.length;
        });

        return averages;
    }

    private calculatePercentiles(metrics: PerformanceMetric[]): Record<string, number> {
        const percentiles: Record<string, number> = {};

        const groupedMetrics = this.groupMetricsByName(metrics);

        Object.entries(groupedMetrics).forEach(([name, metricList]) => {
            const sortedValues = metricList.map(m => m.value).sort((a, b) => a - b);
            const length = sortedValues.length;

            if (length === 0) {
                percentiles[name] = 0;
                return;
            }

            percentiles[`${name}_p50`] = sortedValues[Math.floor(length * 0.5)];
            percentiles[`${name}_p90`] = sortedValues[Math.floor(length * 0.9)];
            percentiles[`${name}_p95`] = sortedValues[Math.floor(length * 0.95)];
            percentiles[`${name}_p99`] = sortedValues[Math.floor(length * 0.99)];
        });

        return percentiles;
    }

    private calculateTrends(metrics: PerformanceMetric[]): Record<string, number> {
        const trends: Record<string, number> = {};

        const groupedMetrics = this.groupMetricsByName(metrics);

        Object.entries(groupedMetrics).forEach(([name, metricList]) => {
            if (metricList.length < 2) {
                trends[name] = 0;
                return;
            }

            const recent = metricList.slice(-10); // Last 10 metrics
            const older = metricList.slice(-20, -10); // Previous 10 metrics

            if (older.length === 0) {
                trends[name] = 0;
                return;
            }

            const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
            const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;

            trends[name] = ((recentAvg - olderAvg) / olderAvg) * 100;
        });

        return trends;
    }

    private groupMetricsByName(metrics: PerformanceMetric[]): Record<string, PerformanceMetric[]> {
        const grouped: Record<string, PerformanceMetric[]> = {};

        metrics.forEach(metric => {
            if (!grouped[metric.name]) {
                grouped[metric.name] = [];
            }
            grouped[metric.name].push(metric);
        });

        return grouped;
    }

    private groupFeedbackByType(): Record<string, number> {
        const grouped: Record<string, number> = {};

        this.feedbackQueue.forEach(feedback => {
            if (!grouped[feedback.type]) {
                grouped[feedback.type] = 0;
            }
            grouped[feedback.type]++;
        });

        return grouped;
    }

    private checkPerformanceAlerts(metric: PerformanceMetric): void {
        if (metric.name === 'response_time' && metric.value > this.config.alertThresholds.responseTime) {
            this.triggerAlert(`High response time detected: ${metric.value}${metric.unit}`, {
                metric: metric.name,
                value: metric.value,
                threshold: this.config.alertThresholds.responseTime
            });
        }
    }

    private checkHealthAlerts(health: SystemHealth): void {
        if (health.status === 'critical') {
            this.triggerAlert('System health is critical', {
                status: health.status,
                issues: health.issues,
                metrics: health.metrics
            });
        }
    }

    private getRecentAlerts(): string[] {
        // In a real implementation, you would maintain an alerts log
        return [];
    }

    private processFeedback(feedback: UserFeedback): void {
        switch (feedback.type) {
            case 'error':
                console.error(`User reported error: ${feedback.message}`, feedback.context);
                break;
            case 'confusion':
                console.warn(`User confusion reported: ${feedback.message}`, feedback.context);
                break;
            case 'suggestion':
                console.log(`User suggestion: ${feedback.message}`, feedback.context);
                break;
            case 'praise':
                console.log(`User praise: ${feedback.message}`);
                break;
        }
    }

    private triggerAlert(message: string, details: any): void {
        console.error(`🚨 MONITORING ALERT: ${message}`, details);

        // In a real implementation, you might:
        // - Send to monitoring service
        // - Create incident tickets
        // - Notify on-call engineers
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

// Export singleton instance
export const monitoringSystem = new MonitoringSystem();

// Export types
export type { PerformanceMetric, SystemHealth, UserFeedback, MonitoringConfig };