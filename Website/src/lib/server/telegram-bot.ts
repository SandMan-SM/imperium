/**
 * Who the site's own Telegram token belongs to.
 *
 * The bot's username used to be a second secret: `TELEGRAM_BOT_USERNAME` had
 * to be set by hand, in two environments, and could drift from the token it
 * described. A placeholder was worse than nothing — a deep link that opens a
 * bot nobody can talk to — and a stale username sent members to a bot that had
 * been renamed.
 *
 * But the username is not an independent fact. It is a property of the token:
 * `getMe` asks Telegram which bot a token belongs to, and the answer is the
 * username. So the site derives it instead of being told it, and the two can
 * never disagree.
 *
 * The configured variable is still honoured, because an operator may want to
 * pin a name without a live token, and because a placeholder should not be
 * able to break a working deep link.
 */

const IDENTITY_TTL_MS = 6 * 60 * 60 * 1000;
const FAILURE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

export type TelegramBotIdentity = {
    /** The bot's @username, without the leading @, or null when it is unknown. */
    username: string | null;
    /** The @username Telegram reports for this token, whatever is configured. */
    derivedUsername: string | null;
    /** True when Telegram accepted the token. */
    tokenValid: boolean;
    /** Where the username came from. */
    source: 'configured' | 'derived' | 'none';
};

type TelegramAnswer = { username: string | null; tokenValid: boolean };

let cached: { answer: TelegramAnswer; at: number; token: string } | null = null;
let inFlight: { token: string; promise: Promise<TelegramAnswer> } | null = null;

/** The username the operator configured, if any. */
function configuredUsername(): string | null {
    const value = (process.env.TELEGRAM_BOT_USERNAME ?? '').trim().replace(/^@/, '');
    return value || null;
}

/** Asks Telegram which bot this token belongs to. */
async function askTelegram(token: string): Promise<TelegramAnswer> {
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            cache: 'no-store',
        });
        const body = (await response.json().catch(() => ({}))) as {
            ok?: boolean;
            result?: { username?: string };
        };

        if (!response.ok || body.ok !== true) return { username: null, tokenValid: false };

        const username = typeof body.result?.username === 'string' ? body.result.username : null;
        return { username: username || null, tokenValid: true };
    } catch {
        // Telegram is unreachable. That is not the token's fault, so the
        // answer is "unknown" rather than "invalid".
        return { username: null, tokenValid: false };
    }
}

/** What Telegram says about the token, cached so a click does not cost a call. */
async function telegramAnswer(): Promise<TelegramAnswer> {
    const token = (process.env.TELEGRAM_BOT_TOKEN ?? '').trim();
    if (!token) return { username: null, tokenValid: false };

    const now = Date.now();
    // The cache is keyed on the token: a rotated token must not be answered
    // with the previous token's bot.
    if (cached && cached.token === token) {
        const ttl = cached.answer.tokenValid ? IDENTITY_TTL_MS : FAILURE_TTL_MS;
        if (now - cached.at < ttl) return cached.answer;
    }

    if (!inFlight || inFlight.token !== token) {
        const promise = askTelegram(token);
        inFlight = { token, promise };
        promise
            .catch(() => undefined)
            .then(() => {
                if (inFlight?.promise === promise) inFlight = null;
            });
    }

    const answer = await inFlight.promise;
    cached = { answer, at: Date.now(), token };
    return answer;
}

/**
 * The bot's identity, from the token or from the configured name.
 *
 * The configured name wins for the username, because an operator who pins one
 * means it. Everything else — whether the token works, which bot it belongs to
 * — is asked of Telegram.
 */
export async function getTelegramBotIdentity(): Promise<TelegramBotIdentity> {
    const configured = configuredUsername();
    const answer = await telegramAnswer();

    const username = configured ?? answer.username;
    return {
        username,
        derivedUsername: answer.username,
        tokenValid: answer.tokenValid,
        source: configured ? 'configured' : answer.username ? 'derived' : 'none',
    };
}

/**
 * The @username to put in a deep link, or null when the bot cannot be named.
 *
 * A null answer is not a failure of the bridge: the member copies the code
 * and sends it with `/link`, which works exactly the same way.
 */
export async function getTelegramBotUsername(): Promise<string | null> {
    const identity = await getTelegramBotIdentity();
    return identity.username;
}
