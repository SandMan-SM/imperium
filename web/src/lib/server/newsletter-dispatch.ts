import { getAdminClient } from './imperium-capture';
import { isMailableAddress } from './mailable';
import { resendService } from '@/lib/resend';

/**
 * Imperium Intelligence Brief dispatch.
 *
 * The brief has two audiences lists that both need to be honoured:
 *
 *   1. `profiles` where `newsletter_subscribed` is true — written by the
 *      capture pipeline for every form on the site.
 *   2. `federation_newsletter_subscribers` (site = imperium) — the list the
 *      Omni hub fans the brief out to, including addresses captured before
 *      the local subscriber table existed.
 *
 * Anyone on the global `omni_suppressions` list, or flagged unsubscribed on
 * the federation list, is excluded — including by a suppression lookup that
 * fails, because an unreadable suppression list must never become a licence
 * to email someone who asked not to be emailed.
 *
 * The `newsletters` table has no `sent_at` / `recipient_count` columns in
 * the live database (the admin UI and the old send route both assumed it
 * did), so the send record lives in the tenant event log
 * `inbound_imperium_events` instead. That table already exists, is scoped to
 * this tenant, and is readable from the browser client for the admin UI.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://secretimperium.com').replace(/\/+$/, '');
const FEDERATION_SITE = 'imperium';
const SEND_EVENT_TYPE = 'newsletter_sent';
const DISPATCH_EVENT_TYPE = 'newsletter_dispatch';
const SEND_CONCURRENCY = 5;

/**
 * How an attempt ended.
 *
 * `sent`    — every recipient took the mail.
 * `partial` — some took it, some did not.
 * `failed`  — the dispatch did not happen (no key, no recipients, unreadable
 *             send log) or every send failed.
 * `skipped` — there was nothing to do (no published issue, or every published
 *             issue has already gone out).
 */
export type DispatchOutcome = 'sent' | 'partial' | 'failed' | 'skipped';

export type NewsletterRow = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_public: boolean;
  published: boolean;
  created_at: string;
};

export type SendRecord = {
  newsletterId: string;
  sentAt: string;
  recipientCount: number;
  sent: number;
  failed: number;
};

export type DispatchResult = {
  ok: boolean;
  recipientCount: number;
  sent: number;
  failed: number;
  error?: string;
};

/** One row of the dispatch history — every attempt, however it ended. */
export type DispatchAttempt = {
  id: string;
  outcome: DispatchOutcome | string;
  source: string;
  newsletterId: string | null;
  newsletterTitle: string | null;
  recipientCount: number;
  sent: number;
  failed: number;
  reason: string | null;
  at: string;
};

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
}

/**
 * The address a one-click (RFC 8058) POST lands on. It performs the same
 * suppression writes as the landing page.
 */
export function oneClickUnsubscribeUrl(email: string): string {
  return `${SITE_URL}/newsletter/unsubscribe/one-click?email=${encodeURIComponent(email)}`;
}

/**
 * Everyone who should receive the brief right now.
 *
 * Fails closed: if the suppression list cannot be read, nobody is emailed.
 *
 * Addresses at reserved documentation domains are left off as well. They
 * cannot receive mail, so every one of them is a guaranteed bounce, and
 * bounces are counted against the sending domain's reputation — see
 * `lib/server/mailable.ts`.
 */
export async function getBriefRecipients(): Promise<{ emails: string[]; error?: string }> {
  const sb = getAdminClient();
  if (!sb) return { emails: [], error: 'capture backend not configured' };

  const recipients = new Set<string>();
  const blocked = new Set<string>();

  const { data: profileRows, error: profileError } = await sb
    .from('profiles')
    .select('email')
    .eq('newsletter_subscribed', true);
  if (profileError) {
    console.error('[newsletter-dispatch] profile lookup failed:', profileError.message);
    return { emails: [], error: 'failed to read subscribers' };
  }
  for (const row of profileRows ?? []) {
    const email = normalizeEmail((row as { email?: string | null }).email);
    if (email) recipients.add(email);
  }

  const { data: federationRows, error: federationError } = await sb
    .from('federation_newsletter_subscribers')
    .select('email, unsubscribed')
    .eq('site', FEDERATION_SITE);
  if (federationError) {
    console.error('[newsletter-dispatch] federation lookup failed:', federationError.message);
    return { emails: [], error: 'failed to read federation subscribers' };
  }
  for (const row of federationRows ?? []) {
    const email = normalizeEmail((row as { email?: string | null }).email);
    if (!email) continue;
    if ((row as { unsubscribed?: boolean | null }).unsubscribed) blocked.add(email);
    else recipients.add(email);
  }

  const { data: suppressionRows, error: suppressionError } = await sb
    .from('omni_suppressions')
    .select('email');
  if (suppressionError) {
    console.error('[newsletter-dispatch] suppression lookup failed:', suppressionError.message);
    return { emails: [], error: 'failed to read suppression list' };
  }
  for (const row of suppressionRows ?? []) {
    const email = normalizeEmail((row as { email?: string | null }).email);
    if (email) blocked.add(email);
  }

  return {
    emails: Array.from(recipients).filter(
      (email) => !blocked.has(email) && isMailableAddress(email),
    ),
  };
}

export function buildNewsletterHtml(subject: string, content: string, unsubUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #222222;">
                            <h1 style="margin: 0; color: #d4af37; font-size: 24px; font-weight: 600;">IMPERIUM</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 20px; font-weight: 500;">${subject}</h2>
                            <div style="color: #a0a0a0; font-size: 15px; line-height: 1.6;">
                                ${content}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #222222;">
                            <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                                You're receiving this because you subscribed to Imperium newsletters.<br>
                                <a href="${unsubUrl}" style="color: #d4af37; text-decoration: none;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();
}

async function sendOne(
  email: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const result = await resendService.sendEmail({
    to: email,
    subject,
    html,
    text,
    headers: {
      // RFC 8058 one-click: mail clients can offer a native "unsubscribe"
      // button without opening the landing page.
      'List-Unsubscribe': `<${oneClickUnsubscribeUrl(email)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
  return result.success;
}

/**
 * Send the brief to one address. Used for test sends and for the single
 * recipient case.
 */
export async function sendToAddress(
  email: string,
  subject: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { ok: false, error: 'invalid email' };

  // A test send to an address that cannot receive mail is a bounce, and it
  // costs the sending domain its reputation. Say so rather than pretending
  // to have sent it.
  if (!isMailableAddress(normalized)) {
    return { ok: false, error: 'That address cannot receive mail (reserved documentation domain)' };
  }

  if (!resendService.isConfigured()) {
    return { ok: false, error: 'RESEND_API_KEY is not configured for this deployment' };
  }

  const html = buildNewsletterHtml(subject, content, unsubscribeUrl(normalized));
  const text = `${subject}\n\n${content}\n\n---\nYou're receiving this because you subscribed to Imperium newsletters.\nUnsubscribe: ${unsubscribeUrl(normalized)}`;

  const sent = await sendOne(normalized, subject, html, text);
  return sent ? { ok: true } : { ok: false, error: 'send failed' };
}

/**
 * Send the brief to every eligible subscriber and record the send.
 *
 * Every exit writes a dispatch record, so the operator can tell a cron that
 * did nothing from a cron that never ran. That distinction used to be
 * invisible: the send record was only written once the mail was on its way,
 * so every failure before that point — no API key, no recipients, an
 * unreadable send log — left nothing behind at all.
 */
export async function dispatchNewsletter(
  newsletter: NewsletterRow,
  options: { source?: string } = {},
): Promise<DispatchResult> {
  const source = options.source ?? 'unknown';

  if (!resendService.isConfigured()) {
    const error = 'RESEND_API_KEY is not configured for this deployment';
    await recordDispatch({
      outcome: 'failed',
      source,
      newsletterId: newsletter.id,
      newsletterTitle: newsletter.title,
      recipientCount: 0,
      sent: 0,
      failed: 0,
      reason: error,
    });
    return { ok: false, recipientCount: 0, sent: 0, failed: 0, error };
  }

  const { emails, error: recipientError } = await getBriefRecipients();
  if (recipientError) {
    await recordDispatch({
      outcome: 'failed',
      source,
      newsletterId: newsletter.id,
      newsletterTitle: newsletter.title,
      recipientCount: 0,
      sent: 0,
      failed: 0,
      reason: recipientError,
    });
    return { ok: false, recipientCount: 0, sent: 0, failed: 0, error: recipientError };
  }
  if (emails.length === 0) {
    const error = 'No recipients found';
    await recordDispatch({
      outcome: 'failed',
      source,
      newsletterId: newsletter.id,
      newsletterTitle: newsletter.title,
      recipientCount: 0,
      sent: 0,
      failed: 0,
      reason: error,
    });
    return { ok: false, recipientCount: 0, sent: 0, failed: 0, error };
  }

  const subject = newsletter.title;
  const content = newsletter.content ?? '';
  const text = `${subject}\n\n${content}\n\n---\nYou're receiving this because you subscribed to Imperium newsletters.`;

  let sent = 0;
  let failed = 0;

  // Each recipient gets their own unsubscribe URL, so the sends cannot be
  // batched into a single Resend call.
  for (let i = 0; i < emails.length; i += SEND_CONCURRENCY) {
    const batch = emails.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (email) => {
        const html = buildNewsletterHtml(subject, content, unsubscribeUrl(email));
        return sendOne(email, subject, html, `${text}\nUnsubscribe: ${unsubscribeUrl(email)}`);
      }),
    );
    for (const ok of results) {
      if (ok) sent += 1;
      else failed += 1;
    }
  }

  if (sent === 0) {
    // No recipient took the mail, so the issue has NOT gone out. It must not
    // be marked as sent: the marker is what stops the cron from trying
    // again, and a failed dispatch has to be retried.
    await recordDispatch({
      outcome: 'failed',
      source,
      newsletterId: newsletter.id,
      newsletterTitle: newsletter.title,
      recipientCount: emails.length,
      sent: 0,
      failed,
      reason: 'Every send failed',
    });
    return { ok: false, recipientCount: emails.length, sent: 0, failed, error: 'Every send failed' };
  }

  // The marker is written only once at least one recipient has the mail.
  await recordSend(newsletter.id, { recipientCount: emails.length, sent, failed });
  await recordDispatch({
    outcome: sent === emails.length ? 'sent' : 'partial',
    source,
    newsletterId: newsletter.id,
    newsletterTitle: newsletter.title,
    recipientCount: emails.length,
    sent,
    failed,
    reason: sent === emails.length ? null : `${failed} recipient(s) did not take the mail`,
  });

  return { ok: true, recipientCount: emails.length, sent, failed };
}

async function recordSend(
  newsletterId: string,
  stats: { recipientCount: number; sent: number; failed: number },
): Promise<void> {
  const sb = getAdminClient();
  if (!sb) return;

  const { data: business } = await sb
    .from('omni_businesses')
    .select('id')
    .eq('slug', FEDERATION_SITE)
    .maybeSingle();
  const businessId = (business as { id?: string } | null)?.id ?? null;

  const sentAt = new Date().toISOString();
  const { error } = await sb.from('inbound_imperium_events').insert({
    business_id: businessId,
    event_type: SEND_EVENT_TYPE,
    event_category: 'newsletter',
    action: 'sent',
    target_type: 'newsletter',
    target_id: newsletterId,
    target_area: 'newsletter',
    path: '/newsletter',
    payload: { ...stats, sentAt },
    value_text: newsletterId,
    created_at: sentAt,
  });
  if (error) {
    console.error('[newsletter-dispatch] failed to record send:', error.message);
  }
}

/**
 * Send records for every newsletter that has gone out, newest first.
 */
export async function getSendRecords(): Promise<SendRecord[]> {
  const sb = getAdminClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('inbound_imperium_events')
    .select('target_id, payload, created_at')
    .eq('event_type', SEND_EVENT_TYPE)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    console.error('[newsletter-dispatch] failed to read send records:', error.message);
    return [];
  }

  const records: SendRecord[] = [];
  for (const row of data ?? []) {
    const payload = (row as { payload?: Record<string, unknown> | null }).payload ?? {};
    const newsletterId = (row as { target_id?: string | null }).target_id;
    if (!newsletterId) continue;
    records.push({
      newsletterId,
      sentAt: (row as { created_at?: string | null }).created_at ?? String(payload.sentAt ?? ''),
      recipientCount: Number(payload.recipientCount ?? 0),
      sent: Number(payload.sent ?? 0),
      failed: Number(payload.failed ?? 0),
    });
  }
  return records;
}

/**
 * Write one row of dispatch history. Called for every attempt, whatever it
 * ended as, so "the cron ran and had nothing to do" is distinguishable from
 * "the cron never ran".
 */
export async function recordDispatch(detail: {
  outcome: DispatchOutcome;
  source: string;
  newsletterId: string | null;
  newsletterTitle?: string | null;
  recipientCount: number;
  sent: number;
  failed: number;
  reason?: string | null;
}): Promise<void> {
  const sb = getAdminClient();
  if (!sb) return;

  const { data: business } = await sb
    .from('omni_businesses')
    .select('id')
    .eq('slug', FEDERATION_SITE)
    .maybeSingle();
  const businessId = (business as { id?: string } | null)?.id ?? null;

  const at = new Date().toISOString();
  const { error } = await sb.from('inbound_imperium_events').insert({
    business_id: businessId,
    event_type: DISPATCH_EVENT_TYPE,
    event_category: 'newsletter',
    action: detail.outcome,
    target_type: 'newsletter',
    target_id: detail.newsletterId,
    target_area: 'newsletter',
    path: '/newsletter',
    payload: {
      source: detail.source,
      newsletterTitle: detail.newsletterTitle ?? null,
      recipientCount: detail.recipientCount,
      sent: detail.sent,
      failed: detail.failed,
      reason: detail.reason ?? null,
      at,
    },
    value_text: detail.newsletterId,
    created_at: at,
  });
  if (error) {
    console.error('[newsletter-dispatch] failed to record dispatch:', error.message);
  }
}

/**
 * The dispatch history, newest first.
 */
export async function getDispatchAttempts(limit = 50): Promise<DispatchAttempt[]> {
  const sb = getAdminClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from('inbound_imperium_events')
    .select('id, action, target_id, payload, created_at')
    .eq('event_type', DISPATCH_EVENT_TYPE)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('[newsletter-dispatch] failed to read dispatch attempts:', error.message);
    return [];
  }

  const attempts: DispatchAttempt[] = [];
  for (const row of data ?? []) {
    const payload = (row as { payload?: Record<string, unknown> | null }).payload ?? {};
    attempts.push({
      id: String((row as { id?: string | null }).id ?? ''),
      outcome: String((row as { action?: string | null }).action ?? 'unknown'),
      source: String(payload.source ?? 'unknown'),
      newsletterId: (row as { target_id?: string | null }).target_id ?? null,
      newsletterTitle: (payload.newsletterTitle as string | null) ?? null,
      recipientCount: Number(payload.recipientCount ?? 0),
      sent: Number(payload.sent ?? 0),
      failed: Number(payload.failed ?? 0),
      reason: (payload.reason as string | null) ?? null,
      at: (row as { created_at?: string | null }).created_at ?? String(payload.at ?? ''),
    });
  }
  return attempts;
}

/**
 * Has this newsletter already been sent? Used to stop the cron from
 * sending the same issue twice.
 *
 * The answer now distinguishes "sent" from "could not tell". It used to
 * answer `true` for both, so a send log that could not be read made the
 * cron skip the issue and report success — the brief simply stopped going
 * out, and nothing said so. An unreadable log now stops the cron loudly;
 * neither reading sends the issue twice.
 */
export async function getSendState(
  newsletterId: string,
): Promise<{ sent: boolean; error?: string }> {
  const sb = getAdminClient();
  if (!sb) return { sent: false, error: 'capture backend not configured' };

  const { data, error } = await sb
    .from('inbound_imperium_events')
    .select('id')
    .eq('event_type', SEND_EVENT_TYPE)
    .eq('target_id', newsletterId)
    .limit(1);
  if (error) {
    console.error('[newsletter-dispatch] failed to check send state:', error.message);
    return { sent: false, error: error.message };
  }
  return { sent: Array.isArray(data) && data.length > 0 };
}
