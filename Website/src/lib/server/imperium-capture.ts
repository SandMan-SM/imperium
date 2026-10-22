import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Imperium email-capture pipeline.
 *
 * Every public form on the site (newsletter opt-in, exit-intent, embedded
 * capture widget) funnels through here so a capture always produces three
 * things:
 *
 *   1. A durable subscriber row in `profiles` — this is what Imperium's own
 *      newsletter cron reads when it sends the Intelligence Brief.
 *   2. A lead row in `inbound_imperium_leads` — the namespaced tenant table
 *      the operator dashboard reads. No generic/shared table is written.
 *   3. A welcome email through the Omni hub, which owns Resend, the verified
 *      sender for secretimperium.com, the suppression list, and the operator
 *      notification. The hub endpoint is the same one the other federation
 *      brands use, so suppression checks and one-click unsubscribe behave
 *      identically everywhere.
 *
 * The capture never fails because the hub is unreachable: the local rows are
 * written first, and the hub call is best-effort with a short timeout.
 */

const HUB_BASE_URL = process.env.OMNI_HUB_URL || 'https://omnileadsagi.com';
const FEDERATION_SITE = 'imperium';
const HUB_TIMEOUT_MS = 8000;
const TENANT_SLUG = 'imperium';

export type CaptureInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  message?: string;
  source: string;
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  visitorId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
};

export type CaptureResult = {
  ok: boolean;
  persisted: boolean;
  emailSent: boolean;
  suppressed: boolean;
  error?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length <= 254 && EMAIL_RE.test(trimmed);
}

export function cleanText(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

async function resolveBusinessId(sb: SupabaseClient): Promise<string | null> {
  const { data } = await sb
    .from('omni_businesses')
    .select('id')
    .eq('slug', TENANT_SLUG)
    .maybeSingle();
  return (data as { id?: string } | null)?.id ?? null;
}

/**
 * A suppressed address still gets a lead row (the operator still wants to
 * know it reached the form) but must never receive an email.
 */
async function isSuppressed(sb: SupabaseClient, email: string): Promise<boolean> {
  const { data, error } = await sb
    .from('omni_suppressions')
    .select('id')
    .ilike('email', email)
    .limit(1);
  if (error) {
    // Fail closed on the email side: an unreadable suppression list must not
    // become a licence to email someone who asked not to be emailed.
    console.error('[imperium-capture] suppression lookup failed:', error.message);
    return true;
  }
  return Array.isArray(data) && data.length > 0;
}

async function upsertSubscriber(
  sb: SupabaseClient,
  input: CaptureInput,
  email: string,
): Promise<boolean> {
  const { data: existing } = await sb
    .from('profiles')
    .select('id, first_name, last_name')
    .ilike('email', email)
    .limit(1);

  const row = existing?.[0] as
    | { id: string; first_name: string | null; last_name: string | null }
    | undefined;

  const patch = {
    newsletter_subscribed: true,
    updated_at: new Date().toISOString(),
    ...(input.firstName ? { first_name: input.firstName } : {}),
    ...(input.lastName ? { last_name: input.lastName } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
  };

  if (row?.id) {
    const { error } = await sb.from('profiles').update(patch).eq('id', row.id);
    if (error) {
      console.error('[imperium-capture] profile update failed:', error.message);
      return false;
    }
    return true;
  }

  const { error } = await sb.from('profiles').insert({
    id: crypto.randomUUID(),
    email,
    first_name: input.firstName || null,
    last_name: input.lastName || null,
    phone: input.phone || null,
    newsletter_subscribed: true,
    is_premium: false,
    is_admin: false,
    is_subscribed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error('[imperium-capture] profile insert failed:', error.message);
    return false;
  }
  return true;
}

async function insertLead(
  sb: SupabaseClient,
  input: CaptureInput,
  email: string,
  businessId: string | null,
): Promise<boolean> {
  if (!businessId) {
    console.warn('[imperium-capture] no omni_businesses row for imperium; lead not recorded');
    return false;
  }

  const { data: duplicate } = await sb
    .from('inbound_imperium_leads')
    .select('id')
    .eq('email', email)
    .eq('source', input.source)
    .limit(1);
  if (Array.isArray(duplicate) && duplicate.length > 0) return true;

  // `full_name` is NOT NULL on the tenant lead table. Email-only captures
  // (newsletter opt-in, exit intent) have no name, so fall back to the
  // mailbox local part — enough for the operator to recognise the row
  // without inventing a fake person.
  const fullName =
    [input.firstName, input.lastName].filter(Boolean).join(' ') ||
    email.split('@')[0] ||
    'Imperium Subscriber';

  const { error } = await sb.from('inbound_imperium_leads').insert({
    business_id: businessId,
    full_name: fullName,
    email,
    phone: input.phone || null,
    message: input.message || null,
    source: input.source,
    status: 'new',
    page_url: input.pageUrl || null,
    page_path: input.pageUrl ? safePath(input.pageUrl) : null,
    referrer: input.referrer || null,
    visitor_id: input.visitorId || null,
    session_id: input.sessionId || null,
    user_agent: input.userAgent || null,
    ip_address: input.ipAddress || null,
    utm_source: input.utmSource || null,
    utm_medium: input.utmMedium || null,
    utm_campaign: input.utmCampaign || null,
    raw_data: { source: input.source, captured_by: 'imperium-web' },
  });
  if (error) {
    console.error('[imperium-capture] lead insert failed:', error.message);
    return false;
  }
  return true;
}

function safePath(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

/**
 * The hub owns Resend, the verified sender for secretimperium.com, the
 * suppression list, and the operator notification. A capture that reaches
 * the hub gets a welcome email with a one-click unsubscribe link.
 */
async function sendHubWelcome(input: CaptureInput, email: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HUB_TIMEOUT_MS);
  try {
    const response = await fetch(`${HUB_BASE_URL}/api/federation-newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
      body: JSON.stringify({
        site: FEDERATION_SITE,
        email,
        first_name: input.firstName || undefined,
        source: input.source,
      }),
    });
    if (!response.ok) {
      console.error(
        `[imperium-capture] hub welcome failed: ${response.status} ${(await response.text().catch(() => '')).slice(0, 200)}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('[imperium-capture] hub welcome error:', error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function captureEmailCapture(input: CaptureInput): Promise<CaptureResult> {
  const email = input.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, persisted: false, emailSent: false, suppressed: false, error: 'invalid email' };
  }

  const sb = getAdminClient();
  if (!sb) {
    return {
      ok: false,
      persisted: false,
      emailSent: false,
      suppressed: false,
      error: 'capture backend not configured',
    };
  }

  const suppressed = await isSuppressed(sb, email);
  const businessId = await resolveBusinessId(sb);

  const subscriberSaved = await upsertSubscriber(sb, input, email);
  const leadSaved = await insertLead(sb, input, email, businessId);
  const persisted = subscriberSaved && leadSaved;

  const emailSent = suppressed ? false : await sendHubWelcome(input, email);

  return { ok: persisted, persisted, emailSent, suppressed };
}
