import crypto from 'node:crypto';

/**
 * A one-time Telegram access code.
 *
 * The bot cannot ask Supabase who somebody is — it has no account — so it
 * needs the website to vouch for the address. But handing the bot a plain
 * email address would make the email itself the credential: anybody who
 * guessed a member's address could then read the paid sequence in Telegram.
 *
 * So the website signs a code instead. The member signs in, asks for a code,
 * and sends it to the bot with `/link`. The bot verifies the signature with
 * the same shared secret and learns the address without the address ever
 * being guessable, and without the bot being able to guess whose address
 * somebody else holds.
 *
 * The format is `v1.<payload>.<signature>`:
 *   payload   - base64url JSON `{ email, exp }`
 *   signature - base64url HMAC-SHA256 of the payload, keyed with the shared secret
 *
 * The bot mirrors this format in `telegram-bot/membership.py`.
 */

const LINK_CODE_VERSION = 'v1';
const LINK_CODE_TTL_SECONDS = 60 * 60 * 24 * 7;

/** The shared secret. Both sides read it from their own environment. */
function secret(): string | null {
    const value = process.env.IMPERIUM_MEMBERSHIP_SECRET;
    return value && value.length > 0 ? value : null;
}

/** Mints a code for an address. Returns null when the bridge is not configured. */
export function createTelegramLinkCode(email: string): { code: string; expiresAt: string } | null {
    const key = secret();
    if (!key) return null;

    const expiresAt = Math.floor(Date.now() / 1000) + LINK_CODE_TTL_SECONDS;
    const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), exp: expiresAt })).toString('base64url');
    const signature = crypto.createHmac('sha256', key).update(payload).digest('base64url');

    return {
        code: `${LINK_CODE_VERSION}.${payload}.${signature}`,
        expiresAt: new Date(expiresAt * 1000).toISOString(),
    };
}

/**
 * Reads a code back. Used by the bot's own verification path and by the
 * tests. Returns null for a code that is malformed, unsigned, forged or
 * expired.
 */
export function readTelegramLinkCode(code: string): { email: string; expiresAt: string } | null {
    const key = secret();
    if (!key) return null;

    const parts = code.trim().split('.');
    if (parts.length !== 3) return null;

    const [version, payload, signature] = parts;
    if (version !== LINK_CODE_VERSION) return null;

    const expected = crypto.createHmac('sha256', key).update(payload).digest('base64url');

    const provided = Buffer.from(signature);
    const computed = Buffer.from(expected);
    if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) {
        return null;
    }

    try {
        const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
            email?: unknown;
            exp?: unknown;
        };

        if (typeof parsed.email !== 'string' || !parsed.email.includes('@')) return null;
        if (typeof parsed.exp !== 'number' || parsed.exp * 1000 < Date.now()) return null;

        return {
            email: parsed.email.toLowerCase(),
            expiresAt: new Date(parsed.exp * 1000).toISOString(),
        };
    } catch {
        return null;
    }
}
