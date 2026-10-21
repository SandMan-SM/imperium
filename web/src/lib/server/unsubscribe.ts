import { getAdminClient } from './imperium-capture';

/**
 * One-click unsubscribe.
 *
 * Three rows are flipped so no send path can reach this address again:
 *
 *   1. `profiles` — Imperium's own subscriber flags.
 *   2. `federation_newsletter_subscribers` (site = imperium) — the
 *      federation list the Omni hub fans the Intelligence Brief out to.
 *   3. `omni_suppressions` — the global suppression list the capture
 *      pipeline checks before any welcome email goes out.
 *
 * `newsletter_subscribers` was the table this used to write. It does not
 * exist in the live database, so every unsubscribe silently failed and the
 * address kept receiving mail.
 *
 * Shared by the landing page and the RFC 8058 one-click endpoint so both
 * paths suppress identically.
 */
export type UnsubscribeResult = { ok: boolean; error?: string };

export async function unsubscribeEmail(email: string): Promise<UnsubscribeResult> {
  const sb = getAdminClient();
  if (!sb) return { ok: false, error: 'unsubscribe backend not configured' };

  const normalized = email.trim().toLowerCase();

  const { error: profileError } = await sb
    .from("profiles")
    .update({ newsletter_subscribed: false, is_subscribed: false })
    .ilike("email", normalized);
  if (profileError) {
    console.error("[unsubscribe] profile update failed:", profileError.message);
    return { ok: false, error: 'profile update failed' };
  }

  const { error: federationError } = await sb
    .from("federation_newsletter_subscribers")
    .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
    .eq("site", "imperium")
    .ilike("email", normalized);
  if (federationError) {
    console.error("[unsubscribe] federation subscriber update failed:", federationError.message);
    return { ok: false, error: 'federation update failed' };
  }

  const { error: suppressionError } = await sb
    .from("omni_suppressions")
    .upsert(
      {
        business_id: null,
        email: normalized,
        reason: "unsubscribe",
        notes: "imperium-one-click",
      },
      { onConflict: "business_id,email", ignoreDuplicates: true },
    );
  if (suppressionError) {
    console.error("[unsubscribe] suppression insert failed:", suppressionError.message);
    return { ok: false, error: 'suppression insert failed' };
  }

  return { ok: true };
}
