export const dynamic = 'force-dynamic';

import { handleEmailCaptureRequest } from '@/lib/server/email-capture-route';

/**
 * Welcome email for a subscriber.
 *
 * Kept as its own route because it is called by name, but it now shares the
 * capture pipeline: the subscriber row and the tenant lead are upserted (so a
 * repeat call never duplicates a lead) and the hub sends the welcome email
 * from the verified secretimperium.com sender with a one-click unsubscribe
 * link.
 */
export async function POST(request: Request) {
  return handleEmailCaptureRequest(request, { defaultSource: 'newsletter_optin' });
}
