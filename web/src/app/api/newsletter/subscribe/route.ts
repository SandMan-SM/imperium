export const dynamic = 'force-dynamic';

import { handleEmailCaptureRequest } from '@/lib/server/email-capture-route';

/**
 * Intelligence Brief signup.
 *
 * Writes the subscriber to `profiles` (what the Imperium newsletter cron
 * reads) and the tenant lead to `inbound_imperium_leads`, then asks the Omni
 * hub to deliver the welcome email from the verified secretimperium.com
 * sender with a one-click unsubscribe link.
 */
export async function POST(request: Request) {
  return handleEmailCaptureRequest(request, { defaultSource: 'newsletter_optin' });
}
