export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { resolveCaller } from '@/lib/server/request-user';
import { resolveMembership } from '@/lib/server/membership';
import { createTelegramLinkCode } from '@/lib/server/telegram-link';

/**
 * Mints a Telegram access code for a signed-in member.
 *
 * The code is what the bot needs before it will open the paid phases: the
 * website signs the member's address, the bot verifies the signature. The
 * code is only issued to an address that actually holds a membership, and it
 * says nothing about the address itself.
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

        const minted = createTelegramLinkCode(email);
        if (!minted) {
            console.error('Telegram link code: IMPERIUM_MEMBERSHIP_SECRET is not configured');
            return NextResponse.json({ error: 'The Telegram bridge is not configured' }, { status: 503 });
        }

        // The bot username is optional. With it, the code becomes a link that
        // opens the bot; without it, the member copies the code.
        const botUsername = process.env.TELEGRAM_BOT_USERNAME;
        const telegramUrl = botUsername
            ? `https://t.me/${botUsername.replace(/^@/, '')}?start=${encodeURIComponent(minted.code)}`
            : null;

        return NextResponse.json({
            code: minted.code,
            expiresAt: minted.expiresAt,
            telegramUrl,
        });
    } catch (error) {
        console.error('Telegram link code failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
