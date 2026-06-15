/**
 * Intelligent Caching System
 * 
 * This module provides multi-level caching with intelligent invalidation strategies
 * to prevent redundant operations and improve application efficiency while maintaining
 * data consistency and preventing hallucinations from stale cache data.
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
    dependencies: string[]; // List of cache keys this entry depends on
    accessCount: number;
    lastAccessed: number;
}

interface CacheStats {
    hits: number;
    misses: number;
    evictions: number;
    totalSize: number;
    averageTTL: number;
}

interface CacheConfig {
    maxEntries: number;
    defaultTTL: number;
    memoryLimit: number; // in bytes
    enableCompression: boolean;
    compressionThreshold: number; // minimum size to compress
}

class IntelligentCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private dependencyGraph: Map<string, Set<string>> = new Map(); // key -> dependent keys
    private config: CacheConfig;
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalSize: 0,
        averageTTL: 0
    };

    constructor(config?: Partial<CacheConfig>) {
        this.config = {
            maxEntries: 1000,
            defaultTTL: 5 * 60 * 1000, // 5 minutes
            memoryLimit: 50 * 1024 * 1024, // 50MB
            enableCompression: true,
            compressionThreshold: 1024, // 1KB
            ...config
        };
    }

    /**
     * Set a value in the cache with optional TTL and dependencies
     */
    set<T>(
        key: string,
        value: T,
        options?: {
            ttl?: number;
            dependencies?: string[];
            compress?: boolean;
        }
    ): void {
        const now = Date.now();
        const ttl = options?.ttl ?? this.config.defaultTTL;
        const dependencies = options?.dependencies ?? [];

        // Check memory limit before adding
        if (!this.hasMemoryFor(value)) {
            this.evictLeastUsedEntries();
        }

        // Compress large values if enabled
        let data = value;
        if (options?.compress ?? this.config.enableCompression) {
            data = this.compressData(value);
        }

        const entry: CacheEntry<any> = {
            data,
            timestamp: now,
            ttl,
            dependencies,
            accessCount: 0,
            lastAccessed: now
        };

        // Update dependency graph
        this.updateDependencyGraph(key, dependencies);

        // Add to cache
        this.cache.set(key, entry);
        this.updateStats();
    }

    /**
     * Get a value from the cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        const now = Date.now();

        // Check if expired
        if (now - entry.timestamp > entry.ttl) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }

        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = now;
        this.stats.hits++;

        // Decompress if needed
        let data = entry.data;
        if (this.isCompressed(data)) {
            data = this.decompressData(data);
        }

        return data;
    }

    /**
     * Check if a key exists and is valid
     */
    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        const now = Date.now();
        return now - entry.timestamp <= entry.ttl;
    }

    /**
     * Delete a key from cache and its dependents
     */
    delete(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        // Remove from cache
        this.cache.delete(key);

        // Remove from dependency graph
        this.dependencyGraph.delete(key);

        // Invalidate dependents
        this.invalidateDependents(key);

        this.updateStats();
        return true;
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        this.dependencyGraph.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalSize: 0,
            averageTTL: 0
        };
    }

    /**
     * Invalidate cache entries based on dependencies
     */
    invalidate(keys: string | string[]): void {
        const keyList = Array.isArray(keys) ? keys : [keys];

        for (const key of keyList) {
            this.delete(key);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats & { hitRate: number; missRate: number } {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
        const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;

        return {
            ...this.stats,
            hitRate,
            missRate
        };
    }

    /**
     * Get cache health report
     */
    getHealthReport(): {
        isHealthy: boolean;
        issues: string[];
        recommendations: string[];
        memoryUsage: { current: number; limit: number; percentage: number };
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];
        const stats = this.getStats();

        // Check hit rate
        if (stats.hitRate < 0.5) {
            issues.push(`Low hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
            recommendations.push('Consider increasing TTL for frequently accessed data');
        }

        // Check memory usage
        const memoryUsage = this.calculateMemoryUsage();
        const memoryPercentage = (memoryUsage.current / memoryUsage.limit) * 100;

        if (memoryPercentage > 80) {
            issues.push(`High memory usage: ${memoryPercentage.toFixed(1)}%`);
            recommendations.push('Consider reducing maxEntries or enabling compression');
        }

        // Check for stale entries
        const staleCount = this.getStaleEntryCount();
        if (staleCount > this.config.maxEntries * 0.1) {
            issues.push(`Many stale entries: ${staleCount}`);
            recommendations.push('Consider reducing default TTL');
        }

        return {
            isHealthy: issues.length === 0,
            issues,
            recommendations,
            memoryUsage
        };
    }

    /**
     * Preload frequently accessed data
     */
    preload<T>(key: string, loader: () => Promise<T>, options?: {
        ttl?: number;
        dependencies?: string[];
    }): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const cached = this.get<T>(key);
                if (cached) {
                    resolve(cached);
                    return;
                }

                const data = await loader();
                this.set(key, data, options);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update cache entry with new data and refresh TTL
     */
    refresh<T>(key: string, newData: T): void {
        const entry = this.cache.get(key);
        if (entry) {
            entry.data = newData;
            entry.timestamp = Date.now();
            entry.lastAccessed = Date.now();
            this.updateStats();
        }
    }

    // Private methods

    private hasMemoryFor(data: any): boolean {
        const dataSize = this.estimateDataSize(data);
        const currentSize = this.calculateMemoryUsage().current;
        return currentSize + dataSize <= this.config.memoryLimit;
    }

    private evictLeastUsedEntries(): void {
        const entries = Array.from(this.cache.entries());
        const sorted = entries.sort((a, b) => {
            // Sort by access count (ascending), then by last accessed (ascending)
            if (a[1].accessCount !== b[1].accessCount) {
                return a[1].accessCount - b[1].accessCount;
            }
            return a[1].lastAccessed - b[1].lastAccessed;
        });

        // Remove 20% of entries
        const evictCount = Math.max(1, Math.floor(sorted.length * 0.2));

        for (let i = 0; i < evictCount; i++) {
            const [key] = sorted[i];
            this.cache.delete(key);
            this.dependencyGraph.delete(key);
            this.stats.evictions++;
        }
    }

    private updateDependencyGraph(key: string, dependencies: string[]): void {
        // Remove old dependencies
        if (this.dependencyGraph.has(key)) {
            this.dependencyGraph.delete(key);
        }

        // Add new dependencies
        if (dependencies.length > 0) {
            this.dependencyGraph.set(key, new Set(dependencies));
        }
    }

    private invalidateDependents(key: string): void {
        // Find all entries that depend on this key
        const dependents = Array.from(this.dependencyGraph.entries())
            .filter(([_, deps]) => deps.has(key))
            .map(([k]) => k);

        // Invalidate dependents recursively
        for (const dependent of dependents) {
            this.delete(dependent);
        }
    }

    private compressData(data: any): any {
        if (!this.config.enableCompression) return data;

        const size = this.estimateDataSize(data);
        if (size < this.config.compressionThreshold) return data;

        try {
            // Simple compression for JSON data
            const jsonString = JSON.stringify(data);
            return {
                __compressed: true,
                data: btoa(jsonString)
            };
        } catch {
            return data;
        }
    }

    private decompressData(data: any): any {
        if (!data?.__compressed) return data;

        try {
            const jsonString = atob(data.data);
            return JSON.parse(jsonString);
        } catch {
            return data;
        }
    }

    private isCompressed(data: any): boolean {
        return data?.__compressed === true;
    }

    private estimateDataSize(data: any): number {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch {
            return 1024; // Default estimate
        }
    }

    private calculateMemoryUsage(): { current: number; limit: number; percentage: number } {
        let totalSize = 0;

        for (const entry of this.cache.values()) {
            totalSize += this.estimateDataSize(entry.data);
        }

        const percentage = (totalSize / this.config.memoryLimit) * 100;

        return {
            current: totalSize,
            limit: this.config.memoryLimit,
            percentage
        };
    }

    private getStaleEntryCount(): number {
        const now = Date.now();
        let staleCount = 0;

        for (const entry of this.cache.values()) {
            if (now - entry.timestamp > entry.ttl) {
                staleCount++;
            }
        }

        return staleCount;
    }

    private updateStats(): void {
        this.stats.totalSize = this.calculateMemoryUsage().current;

        // Calculate average TTL
        const entries = Array.from(this.cache.values());
        if (entries.length > 0) {
            this.stats.averageTTL = entries.reduce((sum, entry) => sum + entry.ttl, 0) / entries.length;
        }
    }
}

// Export singleton instances for different cache types
export const memoryCache = new IntelligentCache({
    maxEntries: 500,
    defaultTTL: 2 * 60 * 1000, // 2 minutes
    memoryLimit: 10 * 1024 * 1024, // 10MB
    enableCompression: true,
    compressionThreshold: 2048
});

export const apiCache = new IntelligentCache({
    maxEntries: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    memoryLimit: 25 * 1024 * 1024, // 25MB
    enableCompression: true,
    compressionThreshold: 1024
});

export const databaseCache = new IntelligentCache({
    maxEntries: 2000,
    defaultTTL: 10 * 60 * 1000, // 10 minutes
    memoryLimit: 50 * 1024 * 1024, // 50MB
    enableCompression: true,
    compressionThreshold: 512
});

// Export types
export type { CacheEntry, CacheStats, CacheConfig };