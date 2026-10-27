export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe-helper';

/**
 * Confirms a completed checkout.
 *
 * After paying, Stripe sends the member back to
 * `/principles/?activated=1&session_id=cs_...`. This route reads that
 * session so the page can tell the member exactly which address their
 * membership is attached to, and where to sign in.
 *
 * The session id is the secret in the URL — it is the same token Stripe puts
 * in its own success redirect, and it is not guessable. Nothing is written
 * here: the webhook already granted the membership.
 */
export async function GET(request: Request) {
    try {
        const sessionId = new URL(request.url).searchParams.get('session_id');

        if (!sessionId || !sessionId.startsWith('cs_')) {
            return NextResponse.json({ error: 'Unknown session' }, { status: 400 });
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        const email = session.customer_details?.email ?? session.customer_email ?? null;
        const paid = session.status === 'complete' && (session.payment_status === 'paid' || session.mode === 'subscription');

        if (!paid) {
            return NextResponse.json({ paid: false, email, status: session.status }, { status: 200 });
        }

        return NextResponse.json({
            paid: true,
            email,
            mode: session.mode,
            status: session.status,
        });
    } catch (error) {
        // An unknown or expired session id is a wrong link, not a broken
        // site. Stripe answers 404 for it, and that must not read as a
        // server fault — the member who followed a stale link is told the
        // session is not there, not that something failed.
        if (isUnknownSession(error)) {
            return NextResponse.json({ error: 'Unknown session' }, { status: 404 });
        }

        console.error('Membership session lookup failed:', error);
        return NextResponse.json({ error: 'Could not read the checkout session' }, { status: 500 });
    }
}

/** Stripe reports a session it cannot find as an invalid request for a missing resource. */
function isUnknownSession(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const candidate = error as { statusCode?: unknown; code?: unknown; type?: unknown };
    if (candidate.statusCode === 404) return true;
    if (candidate.code === 'resource_missing') return true;
    return candidate.type === 'StripeInvalidRequestError' && candidate.statusCode === 404;
}
