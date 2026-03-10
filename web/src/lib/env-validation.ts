/**
 * Environment Variable Validation System
 * 
 * This module provides comprehensive validation for all environment variables
 * used throughout the application, preventing configuration-related hallucinations
 * and ensuring consistent behavior across different environments.
 */

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    environment: string;
}

interface EnvVariable {
    name: string;
    required: boolean;
    defaultValue?: string;
    validator?: (value: string) => boolean | string;
    description: string;
}

class EnvironmentValidator {
    private variables: EnvVariable[] = [];
    private validationResults: ValidationResult | null = null;
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.initializeVariables();
    }

    /**
     * Initialize all expected environment variables
     */
    private initializeVariables(): void {
        this.variables = [
            {
                name: 'NEXT_PUBLIC_SUPABASE_URL',
                required: true,
                validator: (value) => {
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return 'Must be a valid URL';
                    }
                },
                description: 'Supabase project URL'
            },
            {
                name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                required: true,
                validator: (value) => {
                    // Basic validation for JWT-like structure
                    return value.length > 20 && !value.includes(' ');
                },
                description: 'Supabase anonymous public key'
            },
            {
                name: 'SUPABASE_SERVICE_ROLE_KEY',
                required: true,
                validator: (value) => {
                    // Service role keys are typically longer than anon keys
                    return value.length > 50 && !value.includes(' ');
                },
                description: 'Supabase service role key for server-side operations'
            },
            {
                name: 'STRIPE_SECRET_KEY',
                required: false,
                validator: (value) => {
                    return value.startsWith('sk_') && value.length > 20;
                },
                description: 'Stripe secret key for payment processing'
            },
            {
                name: 'STRIPE_WEBHOOK_SECRET',
                required: false,
                validator: (value) => {
                    return value.startsWith('whsec_') && value.length > 20;
                },
                description: 'Stripe webhook secret for payment verification'
            },
            {
                name: 'RESEND_API_KEY',
                required: false,
                validator: (value) => {
                    return value.startsWith('re_') && value.length > 20;
                },
                description: 'Resend API key for email sending'
            },
            {
                name: 'NEXT_PUBLIC_GMAIL_CLIENT_ID',
                required: false,
                validator: (value) => {
                    return value.includes('.apps.googleusercontent.com');
                },
                description: 'Gmail OAuth client ID for email sending'
            },
            {
                name: 'NEXT_PUBLIC_GMAIL_CLIENT_SECRET',
                required: false,
                validator: (value) => {
                    return value.length > 10 && !value.includes(' ');
                },
                description: 'Gmail OAuth client secret for email sending'
            },
            {
                name: 'NEXT_PUBLIC_GMAIL_REFRESH_TOKEN',
                required: false,
                validator: (value) => {
                    return value.startsWith('1//') && value.length > 50;
                },
                description: 'Gmail OAuth refresh token for email sending'
            },
            {
                name: 'NEXT_PUBLIC_GMAIL_FROM_EMAIL',
                required: false,
                validator: (value) => {
                    return value.includes('@') && value.includes('.');
                },
                description: 'Gmail email address for sending newsletters'
            },
            {
                name: 'NODE_ENV',
                required: true,
                defaultValue: 'production',
                validator: (value) => ['development', 'production', 'test'].includes(value),
                description: 'Node.js environment mode'
            }
        ];
    }

    /**
     * Validate all environment variables
     */
    validate(): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const environment = process.env.NODE_ENV || 'production';

        for (const variable of this.variables) {
            const value = process.env[variable.name];

            // Check if required variable is present
            if (variable.required && !value) {
                errors.push(`Missing required environment variable: ${variable.name} (${variable.description})`);
                continue;
            }

            // Skip validation if variable is not set and not required
            if (!value && !variable.required) {
                continue;
            }

            // Apply custom validator if provided
            if (variable.validator && value) {
                const validation = variable.validator(value);
                if (validation !== true) {
                    const errorMessage = typeof validation === 'string' ? validation : `Invalid value for ${variable.name}`;
                    errors.push(`${variable.name}: ${errorMessage}`);
                }
            }

            // Check for placeholder values in production
            if (environment === 'production' && value && this.isPlaceholderValue(value)) {
                errors.push(`${variable.name}: Using placeholder value in production environment`);
            }

            // Warn about development values in production
            if (environment === 'production' && value && this.isDevelopmentValue(value)) {
                warnings.push(`${variable.name}: Using development value in production environment`);
            }
        }

        // Additional cross-validation checks
        this.performCrossValidation(errors, warnings);

        this.validationResults = {
            isValid: errors.length === 0,
            errors,
            warnings,
            environment
        };

        return this.validationResults;
    }

    /**
     * Perform cross-validation between related variables
     */
    private performCrossValidation(errors: string[], warnings: string[]): void {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Check if Supabase credentials are from the same project
        if (supabaseUrl && anonKey && serviceKey) {
            try {
                const url = new URL(supabaseUrl);
                const projectId = url.hostname.split('.')[0];

                // Basic check - service key should be different from anon key
                if (anonKey === serviceKey) {
                    errors.push('Supabase anon key and service role key cannot be the same');
                }

                // Check if keys appear to be from the same project (basic heuristic)
                if (!anonKey.includes(projectId) && projectId.length > 5) {
                    warnings.push('Supabase anon key may not match the configured project URL');
                }
            } catch {
                errors.push('Invalid Supabase URL format');
            }
        }

        // Check for development/staging URLs in production
        if (process.env.NODE_ENV === 'production') {
            if (supabaseUrl && (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'))) {
                errors.push('Using localhost Supabase URL in production environment');
            }
        }
    }

    /**
     * Check if a value appears to be a placeholder
     */
    private isPlaceholderValue(value: string): boolean {
        const placeholders = [
            'placeholder',
            'your-',
            'example-',
            'test-',
            'dev-',
            'localhost',
            '127.0.0.1',
            'https://your-project.supabase.co',
            'sk_test_',
            'pk_test_',
            're_test_'
        ];

        return placeholders.some(placeholder =>
            value.toLowerCase().includes(placeholder)
        );
    }

    /**
     * Check if a value appears to be a development value
     */
    private isDevelopmentValue(value: string): boolean {
        return value.includes('dev') || value.includes('test') || value.includes('localhost');
    }

    /**
     * Get validation results
     */
    getValidationResults(): ValidationResult | null {
        return this.validationResults;
    }

    /**
     * Log validation results to console
     */
    logResults(): void {
        const results = this.validate();

        console.log('\n=== Environment Validation Results ===');
        console.log(`Environment: ${results.environment}`);
        console.log(`Status: ${results.isValid ? '✅ VALID' : '❌ INVALID'}`);

        if (results.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            results.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (results.isValid) {
            console.log('\n✅ All environment variables are properly configured');
        } else {
            console.log('\n❌ Environment configuration issues detected');
            if (this.isDevelopment) {
                console.log('💡 In development mode, some errors may be acceptable');
            }
        }

        console.log('=====================================\n');
    }

    /**
     * Get a validated environment variable with fallback
     */
    getEnvVar(name: string, defaultValue?: string): string | undefined {
        const value = process.env[name];

        if (value) {
            return value;
        }

        if (defaultValue) {
            return defaultValue;
        }

        // If no value and no default, check if it's required
        const variable = this.variables.find(v => v.name === name);
        if (variable?.required) {
            console.warn(`Warning: Required environment variable ${name} is not set`);
        }

        return undefined;
    }

    /**
     * Check if the application can start safely
     */
    canStartSafely(): boolean {
        const results = this.validate();

        // In development, allow startup with warnings
        if (this.isDevelopment) {
            return results.errors.length === 0;
        }

        // In production, require all validations to pass
        return results.isValid;
    }

    /**
     * Get environment health report
     */
    getHealthReport(): {
        isValid: boolean;
        errorCount: number;
        warningCount: number;
        environment: string;
        missingVariables: string[];
        placeholderVariables: string[];
    } {
        const results = this.validate();

        const missingVariables = this.variables
            .filter(v => v.required && !process.env[v.name])
            .map(v => v.name);

        const placeholderVariables = this.variables
            .filter(v => process.env[v.name] && this.isPlaceholderValue(process.env[v.name]!))
            .map(v => v.name);

        return {
            isValid: results.isValid,
            errorCount: results.errors.length,
            warningCount: results.warnings.length,
            environment: results.environment,
            missingVariables,
            placeholderVariables
        };
    }
}

// Export singleton instance
export const envValidator = new EnvironmentValidator();

// Export types
export type { ValidationResult };

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development') {
    envValidator.logResults();
}