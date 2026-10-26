export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { resolveCaller } from '@/lib/server/request-user';
import { resolveMembership } from '@/lib/server/membership';
import { getAdminClient } from '@/lib/server/imperium-capture';
import { createTelegramConnectToken, isTelegramSafeToken } from '@/lib/server/telegram-link';

/**
 * Mints a Telegram access code for a signed-in member.
 *
 * The code is what the bot needs before it will open the paid phases: the
 * website issues it, the bot trades it for a yes-or-no answer, and the
 * address never leaves this site. The code is only issued to an address that
 * actually holds a membership.
 *
 * It is kept in `profiles.metadata.telegram_connect`, next to the referral
 * code, and cleared the moment the bot spends it.
 */
export async function GET(request: Request) {
    try {
        const caller = await resolveCaller(request);

        if (!caller) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = caller.user.email;
        if (!email) {
            return NextResponse.json({ error: 'No address on this account' }, { status: 400 });
        }

        const membership = await resolveMembership(email);
        if (!membership.premium) {
            return NextResponse.json({ error: 'Membership required' }, { status: 402 });
        }

        const admin = getAdminClient();
        if (!admin || !membership.profileId) {
            console.error('Telegram link code: the member profile could not be found');
            return NextResponse.json({ error: 'The Telegram bridge is not configured' }, { status: 503 });
        }

        const minted = createTelegramConnectToken();

        // The code is written onto the row that holds the purchase, which is
        // the row the bot will find it on again.
        const { data: rows } = await admin
            .from('profiles')
            .select('metadata')
            .eq('id', membership.profileId)
            .limit(1);

        const current = (rows?.[0]?.metadata ?? {}) as Record<string, unknown>;

        const { error } = await admin
            .from('profiles')
            .update({
                metadata: {
                    ...current,
                    telegram_connect: minted.token,
                    telegram_connect_expires_at: minted.expiresAt,
                },
                updated_at: new Date().toISOString(),
            })
            .eq('id', membership.profileId);

        if (error) {
            console.error('Telegram link code: could not store the code:', error.message);
            return NextResponse.json({ error: 'The access code could not be created' }, { status: 500 });
        }

        // The bot username is optional. With it, the code becomes a link that
        // opens the bot; without it, the member copies the code.
        const botUsername = process.env.TELEGRAM_BOT_USERNAME;
        const telegramUrl =
            botUsername && isTelegramSafeToken(minted.token)
                ? `https://t.me/${botUsername.replace(/^@/, '')}?start=${minted.token}`
                : null;

        return NextResponse.json({
            token: minted.token,
            expiresAt: minted.expiresAt,
            telegramUrl,
        });
    } catch (error) {
        console.error('Telegram link code failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
