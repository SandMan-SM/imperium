export const dynamic = 'force-dynamic';

import { handleEmailCaptureRequest } from '@/lib/server/email-capture-route';

/**
 * Public lead capture. Used by the exit-intent popup and the embedded
 * capture widget.
 *
 * The lead is written to the namespaced `inbound_imperium_leads` tenant
 * table and the subscriber to `profiles`; the welcome email is delivered by
 * the Omni hub, which owns Resend, the verified secretimperium.com sender,
 * and the suppression list.
 */
export async function POST(request: Request) {
  return handleEmailCaptureRequest(request, { defaultSource: 'lead_capture' });
}
