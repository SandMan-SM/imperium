import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeEmail } from "@/lib/server/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from the Imperium Intelligence Brief.",
  robots: { index: false, follow: false },
};

/**
 * One-click unsubscribe landing page.
 *
 * The suppression writes live in `@/lib/server/unsubscribe` so this page
 * and the RFC 8058 one-click endpoint behave identically.
 */
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

  const result = await unsubscribeEmail(email);

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-white mb-2">Error</h1>
          <p className="text-white/40 mb-4">Failed to unsubscribe. Please try again.</p>
          <Link href="/newsletter" className="text-imperium-gold hover:text-white transition-colors">
            Return to Newsletter
          </Link>
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
          <Link
            href="/newsletter"
            className="block w-full bg-imperium-gold text-imperium-bg py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider text-center hover:bg-white transition-all"
          >
            Return to Newsletter
          </Link>

          <Link
            href="/"
            className="block w-full border border-imperium-gold/30 text-imperium-gold py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider text-center hover:border-imperium-gold/50 hover:text-white transition-all"
          >
            Return to Home
          </Link>
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
