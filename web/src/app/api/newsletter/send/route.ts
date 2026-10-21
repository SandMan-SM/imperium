export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  dispatchNewsletter,
  getSendRecords,
  sendToAddress,
  type NewsletterRow,
} from '@/lib/server/newsletter-dispatch';

/**
 * Send an authored Intelligence Brief.
 *
 * The old implementation selected `sent_at`, `resend_batch_id` and
 * `recipient_count` from `newsletters` — none of those columns exist in the
 * live database, so every send failed on the query before a single email
 * went out. It also read `profiles.is_subscribed` (a different flag from the
 * one the capture pipeline sets) and shipped an unsubstituted
 * `{{{unsubscribe}}}` placeholder in the email footer.
 *
 * Send state now lives in the tenant event log, which the admin UI reads
 * to show the sent timestamp and recipient count.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { newsletterId, testMode, testEmail } = body;

    if (!newsletterId && !testMode) {
      return NextResponse.json({ error: 'newsletterId is required' }, { status: 400 });
    }

    if (testMode && !testEmail) {
      return NextResponse.json({ error: 'testEmail is required for test mode' }, { status: 400 });
    }

    let newsletter: NewsletterRow | null = null;

    if (newsletterId) {
      const { data: nl, error: nlErr } = await supabaseAdmin
        .from('newsletters')
        .select('id, title, content, image_url, is_public, published, created_at')
        .eq('id', newsletterId)
        .single();

      if (nlErr || !nl) {
        return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
      }
      newsletter = nl as NewsletterRow;
    }

    if (testMode) {
      const subject = newsletter ? `[TEST] ${newsletter.title}` : '[TEST] Imperium Newsletter';
      const content = newsletter?.content ?? '';
      const result = await sendToAddress(testEmail, subject, content);
      if (!result.ok) {
        return NextResponse.json({ error: result.error || 'Failed to send test' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Test email sent', recipientCount: 1 });
    }

    const result = await dispatchNewsletter(newsletter as NewsletterRow);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to send newsletter' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent',
      recipientCount: result.recipientCount,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Newsletter Send Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const newsletterId = searchParams.get('newsletterId');

    if (!newsletterId) {
      const { data: newsletters, error } = await supabaseAdmin
        .from('newsletters')
        .select('id, title, created_at, is_public, published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return NextResponse.json({ newsletters: newsletters || [] });
    }

    const { data: newsletter, error } = await supabaseAdmin
      .from('newsletters')
      .select('id, title, content, image_url, is_public, published, created_at')
      .eq('id', newsletterId)
      .single();

    if (error) throw error;

    const records = await getSendRecords();
    const stats = records.find((record) => record.newsletterId === newsletterId) ?? null;

    return NextResponse.json({ newsletter, stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Newsletter GET Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
