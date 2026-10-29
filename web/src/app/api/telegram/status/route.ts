export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

/**
 * The site's own Telegram health.
 *
 * The bot and the site hold two copies of one token: `telegram-bot/.env` and
 * the Vercel variable. A Vercel variable is write-only, so nobody can read
 * it back to compare the two — and a stale copy fails silently: the site's
 * notifications go to a bot Telegram answers 401 to, and a lead nobody hears
 * about is a lead nobody follows up.
 *
 * This route asks Telegram who the site's token belongs to and answers with
 * the username alone. The token is never returned, and no secret is read by
 * it. The bridge script compares that username with the one the bot's own
 * token reports, so one command can say whether the two halves of the
 * bridge talk to the same bot — the last link that could still fail on its
 * own, and did so silently.
 */
export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
    const configuredUsername = (process.env.TELEGRAM_BOT_USERNAME ?? '').replace(/^@/, '');

    if (!token) {
        return NextResponse.json({
            tokenConfigured: false,
            tokenValid: false,
            username: null,
            configuredUsername: configuredUsername || null,
            usernameMatches: null,
        });
    }

    let username: string | null = null;
    let tokenValid = false;

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
            signal: AbortSignal.timeout(8000),
            cache: 'no-store',
        });
        const body = (await response.json().catch(() => ({}))) as {
            ok?: boolean;
            result?: { username?: string };
        };
        tokenValid = response.ok && body.ok === true;
        username = typeof body.result?.username === 'string' ? body.result.username : null;
    } catch (error) {
        console.error('Telegram status: Telegram could not be reached:', error);
    }

    return NextResponse.json({
        tokenConfigured: true,
        tokenValid,
        username,
        configuredUsername: configuredUsername || null,
        usernameMatches: username
            ? username.toLowerCase() === configuredUsername.toLowerCase()
            : null,
    });
}
