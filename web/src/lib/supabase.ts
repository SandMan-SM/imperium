import { createClient } from '@supabase/supabase-js'

// Support multiple possible environment variable names (Vercel / different deploy setups)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE ||
  'https://placeholder-url.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'placeholder-anon-key'

// Standard client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for protected API operations that bypass RLS
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  'placeholder-service-key'

// Service role client for protected API operations that bypass RLS
// NOTE: keep a direct client here for places that import it directly in server code.
// Some server entry points import { supabaseAdmin } and expect a client. We attempt to
// create it now if envs are present; otherwise provide a proxy that will error at runtime
// when accessed so build-time doesn't fail.
let _adminClient: any = null
if (supabaseUrl && serviceRoleKey) {
  _adminClient = createClient(supabaseUrl, serviceRoleKey)
}

export const supabaseAdmin: any = new Proxy({}, {
  get(_, prop: string) {
    if (!_adminClient) {
      // prefer throwing a clear runtime error if envs are missing
      throw new Error('Supabase admin client not configured. Ensure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (or compatible env vars) are set at runtime.')
    }
    const v = _adminClient[prop]
    if (typeof v === 'function') return v.bind(_adminClient)
    return v
  },
  set(_, prop: string, val) {
    if (!_adminClient) {
      throw new Error('Supabase admin client not configured.');
    }
    _adminClient[prop] = val
    return true
  }
})
