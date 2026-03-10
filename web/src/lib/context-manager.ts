/**
 * Centralized Context Manager
 * 
 * This system tracks all operations and prevents context loss by maintaining
 * a comprehensive audit trail of file operations, data fetches, and state changes.
 */

interface OperationRecord {
    id: string;
    type: 'file_read' | 'file_write' | 'api_call' | 'database_query' | 'state_update';
    timestamp: number;
    path?: string;
    data?: any;
    success: boolean;
    error?: string;
    contextSnapshot: any;
}

interface FileState {
    path: string;
    lastModified: number;
    contentHash: string;
    lastAccessed: number;
    accessCount: number;
}

interface ValidationResult {
    isValid: boolean;
    confidence: number; // 0-1
    source: string;
    timestamp: number;
}

class ContextManager {
    private operations: OperationRecord[] = [];
    private fileStates: Map<string, FileState> = new Map();
    private stateSnapshots: Map<string, any> = new Map();
    private maxOperations = 1000; // Limit memory usage
    private validationCache: Map<string, ValidationResult> = new Map();

    /**
     * Record an operation with full context
     */
    recordOperation(
        type: OperationRecord['type'],
        path?: string,
        data?: any,
        success: boolean = true,
        error?: string
    ): string {
        const operationId = this.generateId();
        const timestamp = Date.now();

        // Capture current context snapshot
        const contextSnapshot = this.captureContextSnapshot();

        const operation: OperationRecord = {
            id: operationId,
            type,
            timestamp,
            path,
            data,
            success,
            error,
            contextSnapshot
        };

        // Add to operations log
        this.operations.push(operation);

        // Maintain operations log size
        if (this.operations.length > this.maxOperations) {
            this.operations.shift();
        }

        // Update file state if applicable
        if (path && (type === 'file_read' || type === 'file_write')) {
            this.updateFileState(path, type === 'file_write', data);
        }

        return operationId;
    }

    /**
     * Update file state tracking
     */
    private updateFileState(path: string, isWrite: boolean, data?: any) {
        const existing = this.fileStates.get(path);
        const now = Date.now();

        if (existing) {
            existing.lastAccessed = now;
            existing.accessCount++;
            if (isWrite) {
                existing.lastModified = now;
                existing.contentHash = this.hashContent(data);
            }
        } else {
            this.fileStates.set(path, {
                path,
                lastModified: isWrite ? now : 0,
                contentHash: isWrite ? this.hashContent(data) : '',
                lastAccessed: now,
                accessCount: 1
            });
        }
    }

    /**
     * Capture current context state
     */
    private captureContextSnapshot(): any {
        return {
            timestamp: Date.now(),
            fileStates: Object.fromEntries(this.fileStates),
            recentOperations: this.operations.slice(-10), // Last 10 operations
            validationCache: Object.fromEntries(this.validationCache)
        };
    }

    /**
     * Validate file existence and content consistency
     */
    async validateFile(path: string, expectedContent?: string): Promise<ValidationResult> {
        const cacheKey = `file:${path}:${expectedContent || ''}`;

        // Check cache first
        const cached = this.validationCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < 5000) { // 5 second cache
            return cached;
        }

        try {
            // Check if file exists in our tracking
            const fileState = this.fileStates.get(path);
            if (!fileState) {
                const result = {
                    isValid: false,
                    confidence: 0.1,
                    source: 'context_manager',
                    timestamp: Date.now()
                };
                this.validationCache.set(cacheKey, result);
                return result;
            }

            // Check modification time
            const now = Date.now();
            const timeSinceModified = now - fileState.lastModified;
            const timeSinceAccessed = now - fileState.lastAccessed;

            let confidence = 0.8;

            // Adjust confidence based on file age and access patterns
            if (timeSinceModified > 300000) { // 5 minutes
                confidence -= 0.2;
            }
            if (timeSinceAccessed > 600000) { // 10 minutes
                confidence -= 0.1;
            }
            if (fileState.accessCount < 3) {
                confidence -= 0.1;
            }

            // Validate content if provided
            if (expectedContent) {
                const contentHash = this.hashContent(expectedContent);
                if (fileState.contentHash !== contentHash) {
                    confidence = 0.3; // Low confidence if content doesn't match
                }
            }

            const result = {
                isValid: confidence > 0.5,
                confidence,
                source: 'context_manager',
                timestamp: Date.now()
            };

            this.validationCache.set(cacheKey, result);
            return result;

        } catch (error) {
            const result = {
                isValid: false,
                confidence: 0.1,
                source: 'context_manager_error',
                timestamp: Date.now()
            };
            this.validationCache.set(cacheKey, result);
            return result;
        }
    }

    /**
     * Get file state information
     */
    getFileState(path: string): FileState | null {
        return this.fileStates.get(path) || null;
    }

    /**
     * Get recent operations for debugging
     */
    getRecentOperations(limit: number = 20): OperationRecord[] {
        return this.operations.slice(-limit);
    }

    /**
     * Clear validation cache (useful for testing)
     */
    clearValidationCache(): void {
        this.validationCache.clear();
    }

    /**
     * Generate unique operation ID
     */
    private generateId(): string {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create content hash for comparison
     */
    private hashContent(content: any): string {
        if (!content) return '';

        const str = typeof content === 'string' ? content : JSON.stringify(content);
        let hash = 0;

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return hash.toString(36);
    }

    /**
     * Get context health report
     */
    getContextHealth(): {
        totalOperations: number;
        trackedFiles: number;
        cacheHitRate: number;
        averageConfidence: number;
    } {
        const totalOperations = this.operations.length;
        const trackedFiles = this.fileStates.size;

        // Calculate cache hit rate
        const cacheEntries = Array.from(this.validationCache.values());
        const recentCacheEntries = cacheEntries.filter(entry =>
            Date.now() - entry.timestamp < 300000 // Last 5 minutes
        );

        const cacheHitRate = cacheEntries.length > 0
            ? recentCacheEntries.length / cacheEntries.length
            : 0;

        // Calculate average confidence
        const averageConfidence = cacheEntries.length > 0
            ? cacheEntries.reduce((sum, entry) => sum + entry.confidence, 0) / cacheEntries.length
            : 0;

        return {
            totalOperations,
            trackedFiles,
            cacheHitRate,
            averageConfidence
        };
    }
}

// Export singleton instance
export const contextManager = new ContextManager();

// Export types for use in other modules
export type { OperationRecord, FileState, ValidationResult };