import type { Metadata } from "next";
import { getAdminClient } from "@/lib/server/imperium-capture";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from the Imperium Intelligence Brief.",
  robots: { index: false, follow: false },
};

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
 * `newsletter_subscribers` was the table this page used to write. It does
 * not exist in the live database, so every unsubscribe silently failed and
 * the address kept receiving mail.
 */
async function unsubscribe(email: string): Promise<boolean> {
  const sb = getAdminClient();
  if (!sb) return false;

  const normalized = email.trim().toLowerCase();

  const { error: profileError } = await sb
    .from("profiles")
    .update({ newsletter_subscribed: false, is_subscribed: false })
    .ilike("email", normalized);
  if (profileError) {
    console.error("[unsubscribe] profile update failed:", profileError.message);
    return false;
  }

  const { error: federationError } = await sb
    .from("federation_newsletter_subscribers")
    .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
    .eq("site", "imperium")
    .ilike("email", normalized);
  if (federationError) {
    console.error("[unsubscribe] federation subscriber update failed:", federationError.message);
    return false;
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
    return false;
  }

  return true;
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-2">Invalid Request</h1>
          <p className="text-white/40">No email provided for unsubscription.</p>
        </div>
      </div>
    );
  }

  const ok = await unsubscribe(email);

  if (!ok) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-2">Error</h1>
          <p className="text-white/40 mb-4">Failed to unsubscribe. Please try again.</p>
          <a href="/newsletter" className="text-imperium-gold hover:text-white transition-colors">
            Return to Newsletter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-3xl font-light text-white mb-4">Successfully Unsubscribed</h1>
        <p className="text-white/40 mb-8">
          You have been unsubscribed from the Imperium Intelligence Brief.
          You will no longer receive emails from us.
        </p>

        <div className="space-y-4">
          <a
            href="/newsletter"
            className="block w-full bg-imperium-gold text-imperium-bg py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider text-center hover:bg-white transition-all"
          >
            Return to Newsletter
          </a>

          <a
            href="/"
            className="block w-full border border-imperium-gold/30 text-imperium-gold py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider text-center hover:border-imperium-gold/50 hover:text-white transition-all"
          >
            Return to Home
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-imperium-border/50">
          <p className="text-white/20 text-xs">
            Imperium Strategic Intelligence
            <br />
            <span className="text-white/40">Building sovereign minds, one brief at a time.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
