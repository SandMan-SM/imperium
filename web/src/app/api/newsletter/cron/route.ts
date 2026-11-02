export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  dispatchNewsletter,
  getSendState,
  recordDispatch,
  type NewsletterRow,
} from '@/lib/server/newsletter-dispatch';

/**
 * Cron entry that mails the next published, not-yet-sent issue.
 *
 * The old implementation filtered on `newsletters.sent_at`, a column that does
 * not exist, so the query always errored. It also selected newsletters with
 * `published = false` — drafts the operator had not yet approved — and read
 * `profiles.is_subscribed` instead of the flag the capture pipeline writes.
 *
 * The rule now: the oldest *published* issue that has no send record goes
 * out, so publishing is the approval step.
 */
export async function GET(req: Request) {
  // Vercel sends the project cron secret as `Authorization: Bearer <secret>`.
  // That bearer — or the legacy `x-vercel-cron-token` header carrying the same
  // value — is the ONLY accepted credential.
  //
  // This route used to accept the `x-vercel-cron: 1` request header as an
  // alternative, and to skip the check entirely when CRON_SECRET was unset:
  //   `if (expectedSecret && provided !== expectedSecret) return 401`
  // A request header is chosen by the caller, so it proves nothing, and an
  // unset secret made the whole comparison disappear — which would have let
  // anyone trigger a full newsletter send. An unset secret and a wrong secret
  // must both deny, so the two cases are separate statements now: deny when
  // the secret is missing, then compare.
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Cron authentication is not configured' },
      { status: 503 },
    );
  }
  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const provided = req.headers.get('x-vercel-cron-token') || bearer;

  if (provided !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: candidates, error } = await supabaseAdmin
      .from('newsletters')
      .select('id, title, content, image_url, is_public, published, created_at')
      .eq('published', true)
      .order('created_at', { ascending: true })
      .limit(25);

    if (error) {
      console.error('Cron: Error fetching newsletters:', error);
      await recordDispatch({
        outcome: 'failed',
        source: 'cron',
        newsletterId: null,
        recipientCount: 0,
        sent: 0,
        failed: 0,
        reason: `could not read the published issues: ${error.message}`,
      });
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!candidates || candidates.length === 0) {
      // A cron that ran and had nothing to do must leave a trace. Otherwise
      // "the cron fired and correctly did nothing" and "the cron never fired"
      // look identical from the outside.
      await recordDispatch({
        outcome: 'skipped',
        source: 'cron',
        newsletterId: null,
        recipientCount: 0,
        sent: 0,
        failed: 0,
        reason: 'no published issue',
      });
      return NextResponse.json({ message: 'No newsletters to send', processed: 0 });
    }

    let newsletter: NewsletterRow | null = null;
    for (const candidate of candidates) {
      const row = candidate as NewsletterRow;
      const state = await getSendState(row.id);
      if (state.error) {
        // The send log could not be read. The old code treated that as "it
        // has been sent", skipped the issue and answered 200 — so a broken
        // log silently starved the letter of every subscriber. Neither
        // reading sends twice; only one of them tells the operator.
        console.error(`Cron: could not read the send log: ${state.error}`);
        await recordDispatch({
          outcome: 'failed',
          source: 'cron',
          newsletterId: row.id,
          newsletterTitle: row.title,
          recipientCount: 0,
          sent: 0,
          failed: 0,
          reason: `send log unreadable: ${state.error}`,
        });
        return NextResponse.json(
          { error: 'Could not read the send log; refusing to guess' },
          { status: 500 },
        );
      }
      if (!state.sent) {
        newsletter = row;
        break;
      }
    }

    if (!newsletter) {
      await recordDispatch({
        outcome: 'skipped',
        source: 'cron',
        newsletterId: null,
        recipientCount: 0,
        sent: 0,
        failed: 0,
        reason: 'every published issue has already been sent',
      });
      return NextResponse.json({ message: 'No newsletters to send', processed: 0 });
    }

    console.log(`Cron: Sending newsletter "${newsletter.title}" (ID: ${newsletter.id})`);

    const result = await dispatchNewsletter(newsletter, { source: 'cron' });

    if (result.ok) {
      console.log(`Cron: Sent to ${result.sent} recipients (${result.failed} failed)`);
      return NextResponse.json({
        success: true,
        message: 'Newsletter sent',
        newsletterId: newsletter.id,
        recipientCount: result.recipientCount,
      });
    }

    console.error(`Cron: Failed to send newsletter: ${result.error}`);
    return NextResponse.json({ error: result.error || 'Failed to send newsletter' }, { status: 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Cron Error:', error);
    await recordDispatch({
      outcome: 'failed',
      source: 'cron',
      newsletterId: null,
      recipientCount: 0,
      sent: 0,
      failed: 0,
      reason: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
