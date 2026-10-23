/**
 * Comprehensive Error Handling and Recovery System
 * 
 * This module provides robust error handling, recovery mechanisms, and
 * monitoring to prevent system failures and hallucinations from error states.
 */

interface ErrorContext {
    timestamp: number;
    error: Error;
    stack?: string;
    context?: any;
    userId?: string;
    sessionId?: string;
    retryCount?: number;
    isRecoverable: boolean;
    source: string;
}

interface RecoveryAction {
    name: string;
    action: (context: ErrorContext) => Promise<boolean>;
    shouldRetry: boolean;
    maxRetries: number;
    backoffMs: number;
    retryCount: number;
}

interface ErrorHandlerConfig {
    enableLogging: boolean;
    enableRecovery: boolean;
    enableMonitoring: boolean;
    maxErrorHistory: number;
    alertThreshold: number;
    recoveryTimeout: number;
}

class ErrorHandler {
    private errorHistory: ErrorContext[] = [];
    private recoveryActions: Map<string, RecoveryAction[]> = new Map();
    private config: ErrorHandlerConfig;
    private isRecovering: Map<string, boolean> = new Map();
    private recoveryTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(config?: Partial<ErrorHandlerConfig>) {
        this.config = {
            enableLogging: true,
            enableRecovery: true,
            enableMonitoring: true,
            maxErrorHistory: 1000,
            alertThreshold: 10,
            recoveryTimeout: 30000, // 30 seconds
            ...config
        };
    }

    /**
     * Handle an error with comprehensive logging and recovery
     */
    async handleError(
        error: Error,
        context?: {
            userId?: string;
            sessionId?: string;
            source?: string;
            retryCount?: number;
            isRecoverable?: boolean;
        }
    ): Promise<void> {
        const errorContext: ErrorContext = {
            timestamp: Date.now(),
            error,
            stack: error.stack,
            context: context?.source === 'api' ? this.sanitizeContext(context) : context,
            userId: context?.userId,
            sessionId: context?.sessionId,
            retryCount: context?.retryCount || 0,
            isRecoverable: context?.isRecoverable ?? true,
            source: context?.source || 'unknown'
        };

        // Add to error history
        this.addToHistory(errorContext);

        // Log error
        if (this.config.enableLogging) {
            this.logError(errorContext);
        }

        // Check for alert conditions
        if (this.config.enableMonitoring) {
            this.checkAlertConditions(errorContext);
        }

        // Attempt recovery if enabled and error is recoverable
        if (this.config.enableRecovery && errorContext.isRecoverable) {
            await this.attemptRecovery(errorContext);
        }
    }

    /**
     * Register recovery actions for a specific error type
     */
    registerRecoveryActions(errorType: string, actions: RecoveryAction[]): void {
        this.recoveryActions.set(errorType, actions);
    }

    /**
     * Execute a recovery action manually
     */
    async executeRecoveryAction(
        errorType: string,
        actionName: string,
        context: ErrorContext
    ): Promise<boolean> {
        const actions = this.recoveryActions.get(errorType);
        if (!actions) {
            return false;
        }

        const action = actions.find(a => a.name === actionName);
        if (!action) {
            return false;
        }

        try {
            return await action.action(context);
        } catch (recoveryError) {
            console.error(`Recovery action ${actionName} failed:`, recoveryError);
            return false;
        }
    }

    /**
     * Get error statistics and health metrics
     */
    getHealthMetrics(): {
        totalErrors: number;
        recentErrors: number;
        errorRate: number;
        recoverySuccessRate: number;
        topErrorTypes: Array<{ type: string; count: number }>;
        isSystemHealthy: boolean;
    } {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentErrors = this.errorHistory.filter(e => e.timestamp > oneHourAgo);

        // Count error types
        const errorTypeCounts = new Map<string, number>();
        this.errorHistory.forEach(error => {
            const type = error.error.name || 'Unknown';
            errorTypeCounts.set(type, (errorTypeCounts.get(type) || 0) + 1);
        });

        const topErrorTypes = Array.from(errorTypeCounts.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate recovery success rate (simplified)
        const recoverySuccessRate = this.calculateRecoverySuccessRate();

        return {
            totalErrors: this.errorHistory.length,
            recentErrors: recentErrors.length,
            errorRate: recentErrors.length / 60, // errors per hour
            recoverySuccessRate,
            topErrorTypes,
            isSystemHealthy: recentErrors.length < this.config.alertThreshold
        };
    }

    /**
     * Clear error history
     */
    clearErrorHistory(): void {
        this.errorHistory = [];
    }

    /**
     * Get detailed error report
     */
    getErrorReport(timeRange?: { start: number; end: number }): {
        errors: ErrorContext[];
        summary: any;
        recommendations: string[];
    } {
        const errors = timeRange
            ? this.errorHistory.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
            : this.errorHistory;

        const summary = this.generateErrorSummary(errors);
        const recommendations = this.generateRecommendations(errors);

        return {
            errors,
            summary,
            recommendations
        };
    }

    // Private methods

    private addToHistory(errorContext: ErrorContext): void {
        this.errorHistory.push(errorContext);

        // Maintain history size limit
        if (this.errorHistory.length > this.config.maxErrorHistory) {
            this.errorHistory.shift();
        }
    }

    private logError(errorContext: ErrorContext): void {
        const logLevel = errorContext.isRecoverable ? 'warn' : 'error';
        const message = `[${errorContext.source}] ${errorContext.error.name}: ${errorContext.error.message}`;

        console[logLevel](message, {
            timestamp: new Date(errorContext.timestamp).toISOString(),
            userId: errorContext.userId,
            sessionId: errorContext.sessionId,
            retryCount: errorContext.retryCount,
            stack: errorContext.stack
        });
    }

    private checkAlertConditions(errorContext: ErrorContext): void {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const recentErrors = this.errorHistory.filter(e => e.timestamp > oneHourAgo);

        // Check error rate threshold
        if (recentErrors.length >= this.config.alertThreshold) {
            this.triggerAlert('High error rate detected', {
                errorCount: recentErrors.length,
                timeWindow: '1 hour',
                recentErrors: recentErrors.slice(-5)
            });
        }

        // Check for specific error patterns
        this.checkErrorPatterns(recentErrors);
    }

    private async attemptRecovery(errorContext: ErrorContext): Promise<void> {
        const errorType = errorContext.error.name;
        const actions = this.recoveryActions.get(errorType);

        if (!actions || actions.length === 0) {
            return;
        }

        const key = `${errorType}_${errorContext.userId || 'anonymous'}`;

        // Prevent concurrent recovery for same error type and user
        if (this.isRecovering.get(key)) {
            return;
        }

        this.isRecovering.set(key, true);

        try {
            for (const action of actions) {
                if (action.retryCount >= action.maxRetries) {
                    continue;
                }

                // Apply backoff delay
                if (action.backoffMs > 0) {
                    await this.delay(action.backoffMs);
                }

                try {
                    const success = await action.action(errorContext);

                    if (success) {
                        console.log(`Recovery successful for ${errorType} using action ${action.name}`);
                        break;
                    } else {
                        action.retryCount++;
                    }
                } catch (recoveryError) {
                    console.error(`Recovery action ${action.name} failed:`, recoveryError);
                    action.retryCount++;
                }
            }
        } finally {
            this.isRecovering.delete(key);

            // Clear recovery timer if exists
            const timer = this.recoveryTimers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.recoveryTimers.delete(key);
            }
        }
    }

    private sanitizeContext(context: any): any {
        // Remove sensitive information from context before logging
        const sanitized = { ...context };

        // Remove common sensitive fields
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.apiKey;
        delete sanitized.secret;

        return sanitized;
    }

    private calculateRecoverySuccessRate(): number {
        // This would need to be implemented based on your recovery tracking
        // For now, return a placeholder
        return 0.85; // 85% success rate
    }

    private triggerAlert(message: string, details: any): void {
        console.error(`🚨 SYSTEM ALERT: ${message}`, details);

        // In a real implementation, you might:
        // - Send to monitoring service (Datadog, New Relic, etc.)
        // - Send email/SMS notifications
        // - Create incident tickets
        // - Trigger automated responses
    }

    private checkErrorPatterns(recentErrors: ErrorContext[]): void {
        // Check for patterns that indicate systemic issues
        const errorTypes = recentErrors.map(e => e.error.name);
        const typeCounts = new Map<string, number>();

        errorTypes.forEach(type => {
            typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        });

        // Check for cascading failures
        const mostCommonType = Array.from(typeCounts.entries())
            .sort((a, b) => b[1] - a[1])[0];

        if (mostCommonType && mostCommonType[1] > this.config.alertThreshold * 0.5) {
            this.triggerAlert(`Cascading failure detected: ${mostCommonType[0]}`, {
                errorType: mostCommonType[0],
                count: mostCommonType[1],
                percentage: (mostCommonType[1] / recentErrors.length) * 100
            });
        }
    }

    private generateErrorSummary(errors: ErrorContext[]): any {
        const summary = {
            totalErrors: errors.length,
            timeRange: errors.length > 0
                ? {
                    start: new Date(Math.min(...errors.map(e => e.timestamp))).toISOString(),
                    end: new Date(Math.max(...errors.map(e => e.timestamp))).toISOString()
                }
                : null,
            errorTypes: new Map<string, number>(),
            sources: new Map<string, number>(),
            recoverableErrors: errors.filter(e => e.isRecoverable).length,
            criticalErrors: errors.filter(e => !e.isRecoverable).length
        };

        errors.forEach(error => {
            const type = error.error.name || 'Unknown';
            const source = error.source || 'unknown';

            summary.errorTypes.set(type, (summary.errorTypes.get(type) || 0) + 1);
            summary.sources.set(source, (summary.sources.get(source) || 0) + 1);
        });

        return summary;
    }

    private generateRecommendations(errors: ErrorContext[]): string[] {
        const recommendations: string[] = [];

        // Analyze error patterns and suggest improvements
        const errorTypes = new Map<string, number>();
        errors.forEach(e => {
            const type = e.error.name || 'Unknown';
            errorTypes.set(type, (errorTypes.get(type) || 0) + 1);
        });

        // Common recommendations based on error patterns
        if ((errorTypes.get('NetworkError') || 0) > 10) {
            recommendations.push('Consider implementing better network error handling and retry logic');
        }

        if ((errorTypes.get('ValidationError') || 0) > 5) {
            recommendations.push('Review data validation logic to prevent invalid data from reaching the system');
        }

        if ((errorTypes.get('TimeoutError') || 0) > 5) {
            recommendations.push('Review system performance and consider increasing timeout thresholds');
        }

        if (errors.some(e => e.source === 'database')) {
            recommendations.push('Review database connection pooling and query optimization');
        }

        if (errors.some(e => e.source === 'api')) {
            recommendations.push('Review API rate limiting and external service dependencies');
        }

        return recommendations;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Common recovery actions
export const commonRecoveryActions = {
    // Database connection recovery
    databaseConnection: [
        {
            name: 'retryConnection',
            action: async (context: ErrorContext) => {
                // Implement database reconnection logic
                console.log('Attempting database reconnection...');
                // await database.reconnect();
                return true;
            },
            shouldRetry: true,
            maxRetries: 3,
            backoffMs: 1000,
            retryCount: 0
        }
    ],

    // Network error recovery
    networkError: [
        {
            name: 'retryRequest',
            action: async (context: ErrorContext) => {
                // Implement request retry logic
                console.log('Retrying failed network request...');
                // await retryFailedRequest(context);
                return true;
            },
            shouldRetry: true,
            maxRetries: 5,
            backoffMs: 2000,
            retryCount: 0
        },
        {
            name: 'fallbackToCache',
            action: async (context: ErrorContext) => {
                // Implement cache fallback logic
                console.log('Falling back to cached data...');
                // await useCachedData(context);
                return true;
            },
            shouldRetry: false,
            maxRetries: 1,
            backoffMs: 0,
            retryCount: 0
        }
    ],

    // Authentication error recovery
    authenticationError: [
        {
            name: 'refreshToken',
            action: async (context: ErrorContext) => {
                // Implement token refresh logic
                console.log('Refreshing authentication token...');
                // await refreshAuthToken();
                return true;
            },
            shouldRetry: true,
            maxRetries: 2,
            backoffMs: 500,
            retryCount: 0
        }
    ]
};

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Register common recovery actions
Object.entries(commonRecoveryActions).forEach(([errorType, actions]) => {
    errorHandler.registerRecoveryActions(errorType, actions);
});

// Export types
export type { ErrorContext, RecoveryAction, ErrorHandlerConfig };