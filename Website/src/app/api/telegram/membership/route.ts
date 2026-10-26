export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { resolveMembership } from '@/lib/server/membership';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { CURRICULUM_FREE_UNIT, CURRICULUM_UNIT_COUNT } from '@/lib/curriculum';

/**
 * The membership bridge for the Telegram bot.
 *
 * The bot used to keep its own `is_premium` flag in a local SQLite file, so
 * a member who paid on the website got nothing in Telegram and a flag could
 * never be turned off by a cancellation. The ledger is Stripe, and the
 * website already holds it — so the bot asks here, and this route answers
 * with the same resolver the site itself uses.
 *
 * The request is authenticated with a shared secret (`IMPERIUM_MEMBERSHIP_SECRET`)
 * rather than with a session: the bot has no Supabase account. It is
 * compared in constant time, and the route fails closed when the secret is
 * not configured — an unconfigured bridge must not answer "not a member"
 * for a paying member.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Constant-time comparison of the shared secret. */
function secretMatches(provided: string | null): boolean {
    const expected = process.env.IMPERIUM_MEMBERSHIP_SECRET;
    if (!expected || !provided) return false;

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
    try {
        if (!process.env.IMPERIUM_MEMBERSHIP_SECRET) {
            console.error('Telegram membership bridge: IMPERIUM_MEMBERSHIP_SECRET is not configured');
            return NextResponse.json({ error: 'The membership bridge is not configured' }, { status: 503 });
        }

        if (!secretMatches(request.headers.get('x-imperium-secret'))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
            email?: unknown;
            telegram_id?: unknown;
            username?: unknown;
        };

        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
        }

        const membership = await resolveMembership(email);

        // The Telegram account is written onto the member's own row so the
        // site can offer "continue in Telegram" later. Only a member's row
        // is written, so a stranger cannot attach a Telegram id to it.
        const telegramId = typeof body.telegram_id === 'string' ? body.telegram_id.trim() : '';
        const username = typeof body.username === 'string' ? body.username.trim() : '';

        if (membership.premium && membership.profileId && telegramId) {
            const admin = getAdminClient();
            if (admin) {
                const patch: Record<string, unknown> = {
                    telegram_id: telegramId,
                    updated_at: new Date().toISOString(),
                };
                if (username) patch.username = username;

                const { error } = await admin
                    .from('profiles')
                    .update(patch)
                    .eq('id', membership.profileId);

                if (error) {
                    console.error('Telegram membership bridge: could not link the Telegram account:', error.message);
                }
            }
        }

        return NextResponse.json({
            ok: true,
            email,
            premium: membership.premium,
            source: membership.source,
            subscriptionStatus: membership.subscriptionStatus,
            linked: membership.premium && Boolean(membership.profileId),
            // The site decides how much of the curriculum is free, so the
            // bot's allowance follows it instead of keeping its own number.
            freeUnit: CURRICULUM_FREE_UNIT,
            unitCount: CURRICULUM_UNIT_COUNT,
        });
    } catch (error) {
        console.error('Telegram membership bridge failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
