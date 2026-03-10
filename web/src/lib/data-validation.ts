/**
 * Data Consistency Validation Layer
 * 
 * This module provides comprehensive data validation to prevent hallucinations
 * from inconsistent or invalid data. It includes schema validation, cross-field
 * validation, and data integrity checks.
 */

interface ValidationResult<T> {
    isValid: boolean;
    data: T | null;
    errors: string[];
    warnings: string[];
    confidence: number; // 0-1
    source: string;
    timestamp: number;
}

interface SchemaField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'email' | 'url';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    items?: SchemaField; // For arrays
    properties?: Record<string, SchemaField>; // For objects
    validator?: (value: any) => boolean | string;
}

interface CrossFieldRule {
    fields: string[];
    validator: (data: any) => boolean | string;
    message: string;
}

class DataValidator {
    private schemas: Map<string, SchemaField[]> = new Map();
    private crossFieldRules: Map<string, CrossFieldRule[]> = new Map();
    private validationCache: Map<string, ValidationResult<any>> = new Map();
    private maxCacheSize = 1000;

    /**
     * Register a schema for validation
     */
    registerSchema(name: string, fields: SchemaField[]): void {
        this.schemas.set(name, fields);
    }

    /**
     * Register cross-field validation rules
     */
    registerCrossFieldRules(schemaName: string, rules: CrossFieldRule[]): void {
        this.crossFieldRules.set(schemaName, rules);
    }

    /**
     * Validate data against a registered schema
     */
    validate<T>(
        data: any,
        schemaName: string,
        options?: {
            source?: string;
            cacheKey?: string;
            strict?: boolean;
        }
    ): ValidationResult<T> {
        const cacheKey = options?.cacheKey || this.generateCacheKey(data, schemaName);

        // Check cache first
        if (options?.cacheKey && this.validationCache.has(cacheKey)) {
            const cached = this.validationCache.get(cacheKey)!;
            return {
                ...cached,
                timestamp: Date.now() // Update timestamp
            };
        }

        const source = options?.source || 'data_validator';
        const errors: string[] = [];
        const warnings: string[] = [];
        let confidence = 1.0;

        // Get schema
        const schema = this.schemas.get(schemaName);
        if (!schema) {
            const result = {
                isValid: false,
                data: null,
                errors: [`Unknown schema: ${schemaName}`],
                warnings: [],
                confidence: 0,
                source,
                timestamp: Date.now()
            };

            if (options?.cacheKey) {
                this.cacheValidationResult(cacheKey, result);
            }

            return result;
        }

        // Validate schema fields
        const fieldResults = this.validateFields(data, schema, errors, warnings);
        confidence = fieldResults.confidence;

        // Validate cross-field rules
        const crossFieldRules = this.crossFieldRules.get(schemaName);
        if (crossFieldRules) {
            for (const rule of crossFieldRules) {
                const validation = rule.validator(data);
                if (validation !== true) {
                    const message = typeof validation === 'string' ? validation : rule.message;
                    errors.push(message);
                    confidence -= 0.1;
                }
            }
        }

        // Additional data integrity checks
        const integrityResult = this.checkDataIntegrity(data, schema, errors, warnings);
        confidence = Math.min(confidence, integrityResult.confidence);

        // Apply strict mode validation if enabled
        if (options?.strict) {
            const strictResult = this.applyStrictValidation(data, schema, errors, warnings);
            confidence = Math.min(confidence, strictResult.confidence);
        }

        // Ensure confidence is within bounds
        confidence = Math.max(0, Math.min(1, confidence));

        const result: ValidationResult<T> = {
            isValid: errors.length === 0 && confidence > 0.5,
            data: errors.length === 0 ? data : null,
            errors,
            warnings,
            confidence,
            source,
            timestamp: Date.now()
        };

        // Cache result if cache key provided
        if (options?.cacheKey) {
            this.cacheValidationResult(cacheKey, result);
        }

        return result;
    }

    /**
     * Validate a single field against its schema
     */
    private validateField(
        value: any,
        field: SchemaField,
        path: string = field.name
    ): { isValid: boolean; errors: string[]; warnings: string[]; confidence: number } {
        const errors: string[] = [];
        const warnings: string[] = [];
        let confidence = 1.0;

        // Check if required field is present
        if (field.required && (value === undefined || value === null)) {
            errors.push(`${path} is required`);
            return { isValid: false, errors, warnings, confidence: 0 };
        }

        // Skip validation if value is undefined/null and not required
        if (value === undefined || value === null) {
            return { isValid: true, errors, warnings, confidence };
        }

        // Type validation
        const typeCheck = this.validateType(value, field.type, path);
        if (!typeCheck.isValid) {
            errors.push(...typeCheck.errors);
            confidence -= 0.3;
        }

        // Length validation for strings and arrays
        if (field.type === 'string' || field.type === 'array') {
            if (field.minLength !== undefined && value.length < field.minLength) {
                errors.push(`${path} must be at least ${field.minLength} characters long`);
                confidence -= 0.1;
            }
            if (field.maxLength !== undefined && value.length > field.maxLength) {
                errors.push(`${path} must be at most ${field.maxLength} characters long`);
                confidence -= 0.1;
            }
        }

        // Range validation for numbers
        if (field.type === 'number') {
            if (field.min !== undefined && value < field.min) {
                errors.push(`${path} must be at least ${field.min}`);
                confidence -= 0.1;
            }
            if (field.max !== undefined && value > field.max) {
                errors.push(`${path} must be at most ${field.max}`);
                confidence -= 0.1;
            }
        }

        // Pattern validation for strings
        if (field.type === 'string' && field.pattern) {
            if (!field.pattern.test(value)) {
                errors.push(`${path} does not match required pattern`);
                confidence -= 0.1;
            }
        }

        // Enum validation
        if (field.enum && !field.enum.includes(value)) {
            errors.push(`${path} must be one of: ${field.enum.join(', ')}`);
            confidence -= 0.1;
        }

        // Custom validator
        if (field.validator) {
            const validation = field.validator(value);
            if (validation !== true) {
                const message = typeof validation === 'string' ? validation : `${path} failed custom validation`;
                errors.push(message);
                confidence -= 0.1;
            }
        }

        // Recursive validation for objects and arrays
        if (field.type === 'object' && field.properties) {
            const objectResult = this.validateFields(value, Object.values(field.properties), errors, warnings);
            confidence = Math.min(confidence, objectResult.confidence);
        }

        if (field.type === 'array' && field.items) {
            for (let i = 0; i < value.length; i++) {
                const itemResult = this.validateField(value[i], field.items, `${path}[${i}]`);
                if (!itemResult.isValid) {
                    errors.push(...itemResult.errors);
                    warnings.push(...itemResult.warnings);
                    confidence = Math.min(confidence, itemResult.confidence);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            confidence
        };
    }

    /**
     * Validate all fields in a schema
     */
    private validateFields(
        data: any,
        schema: SchemaField[],
        errors: string[],
        warnings: string[]
    ): { confidence: number } {
        let confidence = 1.0;

        for (const field of schema) {
            const result = this.validateField(data[field.name], field);
            if (!result.isValid) {
                errors.push(...result.errors);
                warnings.push(...result.warnings);
                confidence = Math.min(confidence, result.confidence);
            }
        }

        return { confidence };
    }

    /**
     * Validate data type
     */
    private validateType(value: any, expectedType: SchemaField['type'], path: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        switch (expectedType) {
            case 'string':
                if (typeof value !== 'string') {
                    errors.push(`${path} must be a string`);
                    return { isValid: false, errors };
                }
                break;

            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    errors.push(`${path} must be a number`);
                    return { isValid: false, errors };
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push(`${path} must be a boolean`);
                    return { isValid: false, errors };
                }
                break;

            case 'object':
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    errors.push(`${path} must be an object`);
                    return { isValid: false, errors };
                }
                break;

            case 'array':
                if (!Array.isArray(value)) {
                    errors.push(`${path} must be an array`);
                    return { isValid: false, errors };
                }
                break;

            case 'date':
                if (!(value instanceof Date) || isNaN(value.getTime())) {
                    errors.push(`${path} must be a valid date`);
                    return { isValid: false, errors };
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (typeof value !== 'string' || !emailRegex.test(value)) {
                    errors.push(`${path} must be a valid email address`);
                    return { isValid: false, errors };
                }
                break;

            case 'url':
                try {
                    new URL(value);
                } catch {
                    errors.push(`${path} must be a valid URL`);
                    return { isValid: false, errors };
                }
                break;
        }

        return { isValid: true, errors };
    }

    /**
     * Check data integrity
     */
    private checkDataIntegrity(
        data: any,
        schema: SchemaField[],
        errors: string[],
        warnings: string[]
    ): { confidence: number } {
        let confidence = 1.0;

        // Check for unexpected fields (strict mode)
        const schemaFieldNames = new Set(schema.map(field => field.name));
        const dataFieldNames = new Set(Object.keys(data));

        for (const fieldName of dataFieldNames) {
            if (!schemaFieldNames.has(fieldName)) {
                warnings.push(`Unexpected field: ${fieldName}`);
                confidence -= 0.05;
            }
        }

        // Check for missing required fields
        const requiredFields = schema.filter(field => field.required).map(field => field.name);
        for (const field of requiredFields) {
            if (!(field in data)) {
                errors.push(`Missing required field: ${field}`);
                confidence -= 0.2;
            }
        }

        // Check for null/undefined values in non-required fields
        for (const field of schema) {
            if (!field.required && (data[field.name] === null || data[field.name] === undefined)) {
                warnings.push(`Field ${field.name} is null/undefined`);
                confidence -= 0.02;
            }
        }

        return { confidence };
    }

    /**
     * Apply strict validation rules
     */
    private applyStrictValidation(
        data: any,
        schema: SchemaField[],
        errors: string[],
        warnings: string[]
    ): { confidence: number } {
        let confidence = 1.0;

        // In strict mode, warn about any type coercion that might have occurred
        for (const field of schema) {
            const value = data[field.name];
            if (value !== undefined && value !== null) {
                // Check if string numbers are actually numbers
                if (field.type === 'number' && typeof value === 'string') {
                    warnings.push(`Field ${field.name} should be a number, not a string`);
                    confidence -= 0.05;
                }

                // Check for empty strings where they shouldn't be
                if ((field.type === 'string' || field.type === 'email' || field.type === 'url') &&
                    typeof value === 'string' && value.trim() === '') {
                    errors.push(`Field ${field.name} cannot be empty`);
                    confidence -= 0.1;
                }
            }
        }

        return { confidence };
    }

    /**
     * Cache validation result
     */
    private cacheValidationResult(cacheKey: string, result: ValidationResult<any>): void {
        if (this.validationCache.size >= this.maxCacheSize) {
            // Remove oldest entry
            const oldestKey = this.validationCache.keys().next().value;
            this.validationCache.delete(oldestKey);
        }

        this.validationCache.set(cacheKey, result);
    }

    /**
     * Generate cache key for validation
     */
    private generateCacheKey(data: any, schemaName: string): string {
        const dataHash = this.hashData(data);
        return `${schemaName || 'unknown'}:${dataHash}`;
    }

    /**
     * Create hash of data for caching
     */
    private hashData(data: any): string {
        const str = JSON.stringify(data, Object.keys(data).sort());
        let hash = 0;

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash.toString(36);
    }

    /**
     * Clear validation cache
     */
    clearCache(): void {
        this.validationCache.clear();
    }

    /**
     * Get validation statistics
     */
    getStats(): {
        cachedValidations: number;
        cacheHitRate: number;
        averageConfidence: number;
    } {
        const cachedValidations = this.validationCache.size;
        const results = Array.from(this.validationCache.values());

        const averageConfidence = results.length > 0
            ? results.reduce((sum, result) => sum + result.confidence, 0) / results.length
            : 0;

        // Cache hit rate is not tracked in this implementation
        // In a real implementation, you would track hits vs misses

        return {
            cachedValidations,
            cacheHitRate: 0, // Would need additional tracking
            averageConfidence
        };
    }
}

// Common schema definitions
export const schemas = {
    // User schema
    user: [
        { name: 'id', type: 'string' as const, required: true },
        { name: 'email', type: 'email' as const, required: true },
        { name: 'firstName', type: 'string' as const, minLength: 1, maxLength: 50 },
        { name: 'lastName', type: 'string' as const, minLength: 1, maxLength: 50 },
        { name: 'createdAt', type: 'date' as const, required: true },
        { name: 'updatedAt', type: 'date' as const, required: true }
    ],

    // Subscription schema
    subscription: [
        { name: 'id', type: 'string' as const, required: true },
        { name: 'userId', type: 'string' as const, required: true },
        { name: 'tier', type: 'string' as const, enum: ['basic', 'premium', 'enterprise'], required: true },
        { name: 'amount', type: 'number' as const, min: 0, required: true },
        { name: 'status', type: 'string' as const, enum: ['active', 'canceled', 'expired'], required: true },
        { name: 'createdAt', type: 'date' as const, required: true }
    ],

    // Lead schema
    lead: [
        { name: 'id', type: 'string' as const, required: true },
        { name: 'email', type: 'email' as const, required: true },
        { name: 'firstName', type: 'string' as const, maxLength: 100 },
        { name: 'lastName', type: 'string' as const, maxLength: 100 },
        { name: 'source', type: 'string' as const, required: true },
        { name: 'createdAt', type: 'date' as const, required: true }
    ],

    // Revenue schema
    revenue: [
        { name: 'id', type: 'string' as const, required: true },
        { name: 'amount', type: 'number' as const, min: 0, required: true },
        { name: 'currency', type: 'string' as const, enum: ['USD', 'EUR', 'GBP'], required: true },
        { name: 'source', type: 'string' as const, required: true },
        { name: 'date', type: 'date' as const, required: true }
    ]
};

// Common cross-field validation rules
export const crossFieldRules = {
    user: [
        {
            fields: ['firstName', 'lastName'],
            validator: (data) => {
                if (!data.firstName && !data.lastName) {
                    return 'At least one of firstName or lastName must be provided';
                }
                return true;
            },
            message: 'At least one of firstName or lastName must be provided'
        }
    ],

    subscription: [
        {
            fields: ['amount', 'tier'],
            validator: (data) => {
                const tierAmounts = { basic: 20, premium: 50, enterprise: 100 };
                const expectedAmount = tierAmounts[data.tier];
                if (data.amount !== expectedAmount) {
                    return `Amount for ${data.tier} tier should be ${expectedAmount}`;
                }
                return true;
            },
            message: 'Amount does not match expected tier amount'
        }
    ]
};

// Export singleton instance
export const dataValidator = new DataValidator();

// Register common schemas and rules
Object.entries(schemas).forEach(([name, schema]) => {
    dataValidator.registerSchema(name, schema);
});

Object.entries(crossFieldRules).forEach(([schemaName, rules]) => {
    dataValidator.registerCrossFieldRules(schemaName, rules);
});

// Export types
export type { ValidationResult, SchemaField, CrossFieldRule };