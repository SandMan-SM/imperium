export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe-helper';

/**
 * Opens an account for someone who has already paid.
 *
 * Supabase runs this project with `mailer_autoconfirm: false`, so a normal
 * sign-up leaves the account dormant until the confirmation email is clicked —
 * and Supabase's built-in SMTP is rate limited, so on a launch weekend the
 * mail never lands. A member who paid $20 and cannot sign in is the worst
 * outcome the site can produce.
 *
 * The fix is to let the payment stand in for the email: the checkout session
 * id in the URL is an unguessable secret that proves the address was paid
 * for, so the account is created already confirmed and the member signs in
 * immediately with the password they chose.
 *
 * Two rules keep this from becoming an account-takeover hole:
 *   1. The address on the form must match the address Stripe recorded.
 *   2. An account that already exists is never touched — no password reset,
 *      no confirmation flip. The caller is told to sign in instead.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequestBody = {
    email?: unknown;
    password?: unknown;
    firstName?: unknown;
    session_id?: unknown;
};

function isPaidSession(session: {
    status: string | null;
    payment_status: string | null;
    mode: string | null;
}): boolean {
    if (session.status !== 'complete') return false;
    return session.payment_status === 'paid' || session.mode === 'subscription';
}

export async function POST(request: Request) {
    let body: RequestBody;

    try {
        body = (await request.json()) as RequestBody;
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const sessionId = typeof body.session_id === 'string' ? body.session_id.trim() : '';

    if (!email || !EMAIL_PATTERN.test(email)) {
        return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
        return NextResponse.json({ error: 'Use a password of at least 8 characters.' }, { status: 400 });
    }

    if (!sessionId || !sessionId.startsWith('cs_')) {
        return NextResponse.json(
            { error: 'This registration needs the checkout session from your purchase.' },
            { status: 400 },
        );
    }

    try {
        const stripe = getStripe();

        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
        } catch {
            // Stripe throws when the id does not exist. That is a bad link,
            // not a server fault, and the member should be told to retry
            // from the purchase confirmation rather than shown an error.
            return NextResponse.json(
                { error: 'That purchase could not be found. Open the link from your checkout receipt.' },
                { status: 404 },
            );
        }

        if (!isPaidSession(session)) {
            return NextResponse.json({ error: 'That checkout has not been paid.' }, { status: 402 });
        }

        const paidEmail = (session.customer_details?.email ?? session.customer_email ?? '').trim().toLowerCase();

        if (!paidEmail || paidEmail !== email) {
            return NextResponse.json(
                { error: 'That checkout belongs to a different email address.' },
                { status: 403 },
            );
        }

        // An existing account is never modified. Supabase refuses to create a
        // second account for the same address, and that refusal is caught
        // below — the person signs in with the password they already have,
        // or uses the password reset.
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName || null },
        });

        if (error || !data?.user) {
            // Supabase refuses to create a second account for the same
            // address. That is the same situation as an existing account, so
            // the member is told to sign in rather than shown a server fault.
            if (error && /already|registered|exists/i.test(error.message)) {
                return NextResponse.json(
                    { error: 'An account already exists for that address. Sign in, or reset your password.' },
                    { status: 409 },
                );
            }
            console.error('Account creation failed:', error);
            return NextResponse.json({ error: 'The account could not be created. Try again.' }, { status: 500 });
        }

        // The `handle_new_user` trigger writes the profile row. It cannot read
        // auth metadata, so the name is copied across here.
        if (firstName) {
            await supabaseAdmin
                .from('profiles')
                .update({ first_name: firstName })
                .eq('auth_id', data.user.id)
                .is('first_name', null);
        }

        return NextResponse.json({ created: true, email: data.user.email });
    } catch (error) {
        console.error('Registration failed:', error);
        return NextResponse.json({ error: 'The account could not be created. Try again.' }, { status: 500 });
    }
}
