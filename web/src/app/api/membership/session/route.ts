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
        console.error('Membership session lookup failed:', error);
        return NextResponse.json({ error: 'Could not read the checkout session' }, { status: 500 });
    }
}
