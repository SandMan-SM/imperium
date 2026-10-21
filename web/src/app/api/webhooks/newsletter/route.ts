export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { dispatchNewsletter, type NewsletterRow } from '@/lib/server/newsletter-dispatch';

/**
 * Dispatch trigger for n8n and the admin dashboard.
 *
 * The old implementation read `newsletter_campaigns` and
 * `newsletter_subscribers` — neither table exists in the live database, so
 * the route always threw before sending anything. It also sent through the
 * Gmail API, which has no configured credentials in this deployment.
 *
 * It now dispatches an authored issue through the same Resend path the
 * admin dashboard and the cron use, so suppression and one-click
 * unsubscribe behave identically no matter which trigger fired.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // `campaignId` was the old field name for the issue being dispatched.
    const newsletterId: string | undefined = body.newsletterId ?? body.campaignId;

    if (!newsletterId) {
      return NextResponse.json({ error: 'newsletterId is required' }, { status: 400 });
    }

    const { data: newsletter, error: nlErr } = await supabaseAdmin
      .from('newsletters')
      .select('id, title, content, image_url, is_public, published, created_at')
      .eq('id', newsletterId)
      .single();

    if (nlErr || !newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    const result = await dispatchNewsletter(newsletter as NewsletterRow);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch newsletter' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      dispatchedTo: result.recipientCount,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Newsletter Dispatch Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
