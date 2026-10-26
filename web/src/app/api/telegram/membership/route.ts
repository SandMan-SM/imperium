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
 * Two questions are asked:
 *
 *   { token }       — the code the member was given. The bot is linking its
 *                     account for the first time. The code is spent here.
 *   { telegram_id } — the bot is checking an account it has already linked.
 *
 * The address is never sent by the bot and never leaves this site, so the
 * answer is the only thing that crosses the bridge.
 *
 * The request is authenticated with a shared secret (`IMPERIUM_MEMBERSHIP_SECRET`)
 * rather than with a session: the bot has no Supabase account. It is
 * compared in constant time, and the route fails closed when the secret is
 * not configured — an unconfigured bridge must not answer "not a member"
 * for a paying member.
 */

const TELEGRAM_ID_RE = /^-?\d{1,20}$/;

/** Constant-time comparison of the shared secret. */
function secretMatches(provided: string | null): boolean {
    const expected = process.env.IMPERIUM_MEMBERSHIP_SECRET;
    if (!expected || !provided) return false;

    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
}

/**
 * Finds the profile a code was issued to.
 *
 * The code lives in `profiles.metadata.telegram_connect`, the same place the
 * referral code lives, so the lookup only ever sees codes this site issued.
 */
async function findProfileByToken(token: string): Promise<{ id: string; email: string | null; metadata: Record<string, unknown> | null } | null> {
    const admin = getAdminClient();
    if (!admin) return null;

    const { data } = await admin
        .from('profiles')
        .select('id, email, metadata')
        .contains('metadata', { telegram_connect: token })
        .limit(1);

    const row = data?.[0] as { id: string; email: string | null; metadata: Record<string, unknown> | null } | undefined;
    return row ?? null;
}

/** Finds the profile a Telegram account was linked to. */
async function findProfileByTelegramId(telegramId: string): Promise<{ id: string; email: string | null } | null> {
    const admin = getAdminClient();
    if (!admin) return null;

    const { data } = await admin
        .from('profiles')
        .select('id, email')
        .eq('telegram_id', telegramId)
        .limit(1);

    const row = data?.[0] as { id: string; email: string | null } | undefined;
    return row ?? null;
}

/** Spends a code: it is removed from the profile so it cannot be used twice. */
async function spendToken(profileId: string, token: string): Promise<void> {
    const admin = getAdminClient();
    if (!admin) return;

    const { data } = await admin
        .from('profiles')
        .select('metadata')
        .eq('id', profileId)
        .limit(1);

    const current = (data?.[0]?.metadata ?? {}) as Record<string, unknown>;
    if (current.telegram_connect !== token) return;

    const next = { ...current };
    delete next.telegram_connect;
    delete next.telegram_connect_expires_at;

    const { error } = await admin
        .from('profiles')
        .update({ metadata: next, updated_at: new Date().toISOString() })
        .eq('id', profileId);

    if (error) {
        console.error('Telegram membership bridge: could not spend the code:', error.message);
    }
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
            token?: unknown;
            telegram_id?: unknown;
            username?: unknown;
        };

        const token = typeof body.token === 'string' ? body.token.trim() : '';
        const telegramId = typeof body.telegram_id === 'string' ? body.telegram_id.trim() : '';
        const username = typeof body.username === 'string' ? body.username.trim() : '';

        if (!TELEGRAM_ID_RE.test(telegramId)) {
            return NextResponse.json({ error: 'A Telegram id is required' }, { status: 400 });
        }

        const admin = getAdminClient();
        if (!admin) {
            return NextResponse.json({ error: 'The membership bridge is not configured' }, { status: 503 });
        }

        let profileId: string | null = null;
        let email: string | null = null;

        if (token) {
            const profile = await findProfileByToken(token);
            if (!profile) {
                return NextResponse.json({ error: 'That code is not valid' }, { status: 404 });
            }

            const expiresAt = profile.metadata?.telegram_connect_expires_at;
            if (typeof expiresAt !== 'string' || new Date(expiresAt).getTime() < Date.now()) {
                return NextResponse.json({ error: 'That code has expired' }, { status: 410 });
            }

            profileId = profile.id;
            email = profile.email;
        } else {
            const profile = await findProfileByTelegramId(telegramId);
            if (!profile) {
                // A Telegram account that was never linked is simply not a
                // member. There is nothing to refuse.
                return NextResponse.json({
                    ok: true,
                    premium: false,
                    linked: false,
                    freeUnit: CURRICULUM_FREE_UNIT,
                    unitCount: CURRICULUM_UNIT_COUNT,
                });
            }

            profileId = profile.id;
            email = profile.email;
        }

        const membership = email ? await resolveMembership(email) : {
            premium: false,
            source: 'none' as const,
            customerId: null,
            subscriptionStatus: null,
            profileId,
        };

        // The Telegram account is written onto the member's own row so the
        // site can offer "continue in Telegram" later. Only a member's row
        // is written, so a stranger cannot attach a Telegram id to it.
        if (membership.premium && profileId) {
            const patch: Record<string, unknown> = {
                telegram_id: telegramId,
                updated_at: new Date().toISOString(),
            };
            if (username) patch.username = username;

            const { error } = await admin
                .from('profiles')
                .update(patch)
                .eq('id', profileId);

            if (error) {
                console.error('Telegram membership bridge: could not link the Telegram account:', error.message);
            }
        }

        // A code is spent as soon as it is presented, whether or not the
        // address behind it still holds a membership.
        if (token && profileId) {
            await spendToken(profileId, token);
        }

        return NextResponse.json({
            ok: true,
            premium: membership.premium,
            source: membership.source,
            subscriptionStatus: membership.subscriptionStatus,
            linked: membership.premium && Boolean(profileId),
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
