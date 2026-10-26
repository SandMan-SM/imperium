import crypto from 'node:crypto';

/**
 * The access code that links a Telegram account to a membership.
 *
 * The bot cannot ask Supabase who somebody is — it has no account — so it
 * needs the website to vouch for the address. But handing the bot a plain
 * email address would make the email itself the credential: anybody who
 * guessed a member's address could then read the paid sequence in Telegram.
 *
 * So the website issues an opaque code instead. The member signs in, asks for
 * a code, and sends it to the bot with `/link` (or opens the deep link, which
 * arrives as `/start <code>`). The bot trades the code for a yes-or-no
 * answer, and never learns the address at all.
 *
 * The code is short and uses only `A-Z a-z 0-9 _ -` because Telegram allows
 * nothing else in the `start` parameter of a deep link, and allows at most
 * 64 characters of it. It is random rather than derived, so it says nothing
 * about the member even to whoever reads it.
 *
 * The code is kept in `profiles.metadata.telegram_connect`, the same place the
 * referral code lives, and is cleared the moment it is used.
 */

const TOKEN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_';
const TOKEN_LENGTH = 24;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Telegram allows these characters in a deep-link start parameter, and no more than 64 of them. */
const TELEGRAM_SAFE = /^[A-Za-z0-9_-]{1,64}$/;

/** Mints a code for a member. */
export function createTelegramConnectToken(): { token: string; expiresAt: string } {
    const bytes = crypto.randomBytes(TOKEN_LENGTH);
    let token = '';
    for (const byte of bytes) {
        token += TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length];
    }

    const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();
    return { token, expiresAt };
}

/**
 * True when a code can be carried in a Telegram deep link.
 *
 * A code that cannot is still perfectly good — the member can copy it and
 * send it with `/link` — so this decides whether to offer the one-tap link,
 * not whether the code works.
 */
export function isTelegramSafeToken(token: string): boolean {
    return TELEGRAM_SAFE.test(token);
}
