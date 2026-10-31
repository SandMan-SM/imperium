export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getTelegramBotIdentity } from '@/lib/server/telegram-bot';

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
 *
 * The username the site puts in a deep link is the one Telegram reports for
 * the token, unless one was configured by hand. `effectiveUsername` is the
 * name that will actually be used; `configuredUsername` is what the operator
 * set, if anything.
 */
export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN ?? '';
    const configuredUsername = (process.env.TELEGRAM_BOT_USERNAME ?? '').replace(/^@/, '');

    const identity = await getTelegramBotIdentity();

    return NextResponse.json({
        tokenConfigured: Boolean(token),
        tokenValid: identity.tokenValid,
        username: identity.derivedUsername,
        configuredUsername: configuredUsername || null,
        effectiveUsername: identity.username,
        usernameSource: identity.source,
        usernameMatches:
            identity.username && configuredUsername
                ? identity.username.toLowerCase() === configuredUsername.toLowerCase()
                : null,
    });
}
