import { createClient } from '@supabase/supabase-js'
import { envValidator } from './env-validation'

/**
 * Enhanced Supabase Client Configuration
 * 
 * This module provides improved Supabase client configuration with:
 * - Environment variable validation
 * - Multiple fallback environment variable support
 * - Better error handling and configuration reporting
 * - Prevention of placeholder value usage in production
 */

// Configuration validation and URL resolution
const resolveSupabaseUrl = (): string => {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE
  ]

  for (const candidate of candidates) {
    if (candidate && candidate !== 'https://placeholder-url.supabase.co') {
      return candidate
    }
  }

  // Return placeholder only if no valid URL found
  return 'https://placeholder-url.supabase.co'
}

const resolveSupabaseAnonKey = (): string => {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY
  ]

  for (const candidate of candidates) {
    if (candidate && candidate !== 'placeholder-anon-key') {
      return candidate
    }
  }

  return 'placeholder-anon-key'
}

const resolveServiceRoleKey = (): string => {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  ]

  for (const candidate of candidates) {
    if (candidate && candidate !== 'placeholder-service-key') {
      return candidate
    }
  }

  return 'placeholder-service-key'
}

// Resolve configuration values
const supabaseUrl = resolveSupabaseUrl()
const supabaseAnonKey = resolveSupabaseAnonKey()
const serviceRoleKey = resolveServiceRoleKey()

// Validate configuration
const validateSupabaseConfig = () => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for placeholder values in production
  if (process.env.NODE_ENV === 'production') {
    if (supabaseUrl === 'https://placeholder-url.supabase.co') {
      errors.push('Supabase URL is using placeholder value in production')
    }
    if (supabaseAnonKey === 'placeholder-anon-key') {
      errors.push('Supabase anon key is using placeholder value in production')
    }
    if (serviceRoleKey === 'placeholder-service-key') {
      errors.push('Supabase service role key is using placeholder value in production')
    }
  }

  // Validate URL format
  try {
    if (supabaseUrl !== 'https://placeholder-url.supabase.co') {
      new URL(supabaseUrl)
    }
  } catch {
    errors.push('Invalid Supabase URL format')
  }

  // Check key formats
  if (supabaseAnonKey !== 'placeholder-anon-key' && supabaseAnonKey.length < 20) {
    errors.push('Supabase anon key appears to be too short')
  }

  if (serviceRoleKey !== 'placeholder-service-key' && serviceRoleKey.length < 50) {
    errors.push('Supabase service role key appears to be too short')
  }

  // Warn about mismatched keys
  if (supabaseAnonKey === serviceRoleKey && supabaseAnonKey !== 'placeholder-anon-key') {
    warnings.push('Supabase anon key and service role key should not be the same')
  }

  if (errors.length > 0) {
    console.error('❌ Supabase Configuration Errors:')
    errors.forEach(error => console.error(`  - ${error}`))
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Supabase Configuration Warnings:')
    warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Supabase configuration is valid')
  }

  return { isValid: errors.length === 0, errors, warnings }
}

// Create standard client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create service role client for protected API operations that bypass RLS
let _adminClient: any = null
let _adminClientError: string | null = null

try {
  if (supabaseUrl && serviceRoleKey &&
    supabaseUrl !== 'https://placeholder-url.supabase.co' &&
    serviceRoleKey !== 'placeholder-service-key') {
    _adminClient = createClient(supabaseUrl, serviceRoleKey)
  } else {
    _adminClientError = 'Supabase admin client not configured - missing valid URL or service role key'
  }
} catch (error) {
  _adminClientError = `Failed to create Supabase admin client: ${error instanceof Error ? error.message : 'Unknown error'}`
}

// Enhanced admin client proxy with better error handling
export const supabaseAdmin: any = new Proxy({}, {
  get(_, prop: string) {
    if (_adminClientError) {
      throw new Error(`Supabase admin client error: ${_adminClientError}`)
    }

    if (!_adminClient) {
      throw new Error(
        'Supabase admin client not configured. Ensure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (or compatible env vars) are set at runtime. ' +
        'Current values: ' +
        `URL: ${supabaseUrl === 'https://placeholder-url.supabase.co' ? 'PLACEHOLDER' : 'SET'}, ` +
        `Service Key: ${serviceRoleKey === 'placeholder-service-key' ? 'PLACEHOLDER' : 'SET'}`
      )
    }

    const v = _adminClient[prop]
    if (typeof v === 'function') return v.bind(_adminClient)
    return v
  },
  set(_, prop: string, val) {
    if (_adminClientError) {
      throw new Error(`Supabase admin client error: ${_adminClientError}`)
    }

    if (!_adminClient) {
      throw new Error('Supabase admin client not configured.')
    }

    _adminClient[prop] = val
    return true
  }
})

// Configuration health check function
export const checkSupabaseHealth = () => {
  const configResult = validateSupabaseConfig()

  const healthReport = {
    isValid: configResult.isValid,
    url: supabaseUrl === 'https://placeholder-url.supabase.co' ? 'PLACEHOLDER' : 'CONFIGURED',
    anonKey: supabaseAnonKey === 'placeholder-anon-key' ? 'PLACEHOLDER' : 'CONFIGURED',
    serviceKey: serviceRoleKey === 'placeholder-service-key' ? 'PLACEHOLDER' : 'CONFIGURED',
    adminClient: _adminClient ? 'READY' : 'NOT_READY',
    errors: configResult.errors,
    warnings: configResult.warnings
  }

  return healthReport
}

// Auto-validate configuration on import
if (process.env.NODE_ENV === 'development') {
  validateSupabaseConfig()
}

// Export configuration values for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  serviceKey: serviceRoleKey,
  isDevelopment: process.env.NODE_ENV === 'development'
}
