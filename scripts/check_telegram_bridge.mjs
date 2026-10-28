#!/usr/bin/env node
/**
 * Proves that the Telegram bridge is wired end to end.
 *
 * The bot is a second front door onto the paid curriculum, and every link
 * between the two surfaces can fail on its own without anything saying so:
 *
 *   1. the bot has a token Telegram still accepts
 *   2. the website carries the same token and the bot's username
 *   3. the access code fits in a Telegram deep link
 *   4. the bot and the website share the membership secret
 *   5. every command the bot advertises is registered
 *   6. every button the bot draws is answered
 *
 * A member who paid, opened the bot and found the paid phases closed is the
 * worst outcome this bridge can produce, and it is invisible until somebody
 * tries. This script answers the question directly: "will the bot open the
 * paid sequence for a paying member?" — one command, no guesswork.
 *
 *   node scripts/check_telegram_bridge.mjs
 *
 * Nothing is printed except states, names and counts. Secrets are never
 * echoed. Credentials are read from the environment first, then from
 * `Website/.env.local` and `telegram-bot/.env`.
 *
 * Exit codes: 0 everything is wired, 1 something is broken and is named,
 * 3 the check could not run.
 */

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

const SITE_URL = (process.env.IMPERIUM_SITE_URL || 'https://secretimperium.com').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 20000;

const results = [];

function record(label, ok, detail) {
    results.push({ label, ok, detail });
    const mark = ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL';
    console.log(`${mark}  ${label}${detail ? ` — ${detail}` : ''}`);
}

/** Reads a `KEY=value` file into a plain object. Missing files are empty. */
function loadEnvFile(path) {
    if (!existsSync(path)) return {};

    const values = {};
    for (const line of readFileSync(path, 'utf8').split('\n')) {
        const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
        if (!match) continue;
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        values[match[1]] = value;
    }
    return values;
}

const siteEnv = { ...loadEnvFile(join(repoRoot, 'Website', '.env.local')), ...process.env };
const botEnv = { ...loadEnvFile(join(repoRoot, 'telegram-bot', '.env')), ...process.env };

/**
 * The Vercel environment variable names, per environment.
 *
 * Only the names and the environments they are set in are read — a sensitive
 * variable's value cannot be read back from Vercel, and does not need to be.
 */
function vercelEnvNames() {
    const vercel = process.env.VERCEL_BIN || 'vercel';
    const projectDir = join(repoRoot, 'Website');

    const output = execFileSync(vercel, ['env', 'ls'], {
        cwd: projectDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 60000,
    });

    const names = new Map();
    for (const line of output.split('\n')) {
        const match = /^\s*([A-Z][A-Z0-9_]*)\s+\S+\s+(.+?)\s{2,}\S/.exec(line);
        if (!match) continue;
        const [, name, environments] = match;
        if (!names.has(name)) names.set(name, new Set());
        for (const environment of environments.split(',')) {
            names.get(name).add(environment.trim().toLowerCase());
        }
    }
    return names;
}

async function telegramGetMe(token) {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
}

async function bridgeProbe(secret) {
    const response = await fetch(`${SITE_URL}/api/telegram/membership`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-imperium-secret': secret },
        body: JSON.stringify({ telegram_id: '0' }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    return { status: response.status, text };
}

function readSource(...parts) {
    const path = join(repoRoot, ...parts);
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

console.log('\nImperium Telegram bridge — can the bot open the paid sequence?\n');

// ---------------------------------------------------------------------------
// 1. The bot's token.
// ---------------------------------------------------------------------------
const botToken = botEnv.TELEGRAM_BOT_TOKEN || '';

if (!botToken) {
    record('Bot: a token is configured', false, 'telegram-bot/.env has no TELEGRAM_BOT_TOKEN');
} else {
    try {
        const { status, body } = await telegramGetMe(botToken);
        if (status === 200 && body?.ok) {
            record('Bot: the token is accepted by Telegram', true, `bot @${body.result?.username ?? 'unknown'}`);
        } else {
            record(
                'Bot: the token is accepted by Telegram',
                false,
                `HTTP ${status} — ${body?.description ?? 'unknown error'}. Ask @BotFather for a new token.`,
            );
        }
    } catch (error) {
        record('Bot: the token is accepted by Telegram', null, `Telegram could not be reached: ${error.message}`);
    }
}

// ---------------------------------------------------------------------------
// 2. The website's copy of the token, the admin chat and the bot username.
// ---------------------------------------------------------------------------
let envNames = null;
try {
    envNames = vercelEnvNames();
} catch (error) {
    record('Website: the Vercel environment could be read', null, error.message);
}

if (envNames) {
    const required = [
        ['TELEGRAM_BOT_TOKEN', 'the bot token the site sends notifications with'],
        ['TELEGRAM_ADMIN_CHAT_ID', 'the chat the site sends notifications to'],
        ['IMPERIUM_MEMBERSHIP_SECRET', 'the secret the bot and the site share'],
        ['TELEGRAM_BOT_USERNAME', 'the username that turns an access code into a one-tap link'],
    ];

    for (const [name, why] of required) {
        const environments = envNames.get(name);
        if (!environments) {
            record(`Website: ${name} is set on Vercel`, false, `not set on Vercel — ${why}`);
            continue;
        }
        const missing = ['production', 'preview'].filter((environment) => !environments.has(environment));
        record(
            `Website: ${name} is set on Vercel`,
            missing.length === 0,
            missing.length === 0
                ? 'Production and Preview'
                : `missing from ${missing.join(' and ')}`,
        );
    }
}

// ---------------------------------------------------------------------------
// 3. The access code has to fit in a Telegram deep link.
// ---------------------------------------------------------------------------
const linkSource = readSource('Website', 'src', 'lib', 'server', 'telegram-link.ts');
const lengthMatch = /TOKEN_LENGTH\s*=\s*(\d+)/.exec(linkSource);
const alphabetMatch = /TOKEN_ALPHABET\s*=\s*'([^']*)'/.exec(linkSource);

if (!lengthMatch) {
    record('Code: the access code fits a Telegram deep link', null, 'the code length could not be read from lib/server/telegram-link.ts');
} else {
    const characters = Number(lengthMatch[1]);
    const alphabet = alphabetMatch?.[1] ?? '';
    const safeAlphabet = /^[A-Za-z0-9_-]+$/.test(alphabet);
    record(
        'Code: the access code fits a Telegram deep link',
        characters <= 64 && safeAlphabet,
        `${characters} characters (Telegram allows 64 in a start parameter)${
            safeAlphabet ? '' : ' — the alphabet holds a character Telegram will not carry'
        }`,
    );
}

// ---------------------------------------------------------------------------
// 4. The shared secret.
// ---------------------------------------------------------------------------
const secretFile = join(repoRoot, 'telegram-bot', '.membership-secret');
const localSecret = existsSync(secretFile) ? readFileSync(secretFile, 'utf8').trim() : '';
const botSecret = botEnv.IMPERIUM_MEMBERSHIP_SECRET || localSecret;

record(
    'Bot: the membership secret is on file',
    Boolean(botSecret),
    botSecret ? `${botSecret.length} characters` : 'neither telegram-bot/.env nor .membership-secret carries one',
);

if (botSecret) {
    try {
        const accepted = await bridgeProbe(botSecret);
        record(
            'Bridge: the site accepts the bot secret',
            accepted.status !== 401 && accepted.status !== 503,
            accepted.status === 401
                ? 'the site refused the secret — the two halves do not share one'
                : accepted.status === 503
                  ? 'the site has no membership secret configured'
                  : `HTTP ${accepted.status} — the secret was accepted`,
        );

        const refused = await bridgeProbe('not-the-secret');
        record(
            'Bridge: the site refuses a wrong secret',
            refused.status === 401,
            refused.status === 401 ? 'HTTP 401' : `HTTP ${refused.status} — a wrong secret was not refused`,
        );
    } catch (error) {
        record('Bridge: the site accepts the bot secret', null, `the site could not be reached: ${error.message}`);
    }
}

// ---------------------------------------------------------------------------
// 5. Every command the bot advertises is registered.
// ---------------------------------------------------------------------------
const botSource = readSource('telegram-bot', 'bot.py');
const registered = new Set([...botSource.matchAll(/CommandHandler\(\s*"([^"]+)"/g)].map((match) => match[1]));

const advertised = new Set();
const handlerDir = join(repoRoot, 'telegram-bot', 'handlers');
if (existsSync(handlerDir)) {
    const { readdirSync } = await import('node:fs');
    for (const file of readdirSync(handlerDir)) {
        if (!file.endsWith('.py')) continue;
        const source = readFileSync(join(handlerDir, file), 'utf8');
        // A command is advertised when the bot tells somebody to send it.
        for (const match of source.matchAll(/\/(?:link|resume|start|progress|phases)\b/g)) {
            advertised.add(match[0].slice(1));
        }
    }
}

const missingCommands = [...advertised].filter((command) => !registered.has(command));
record(
    'Bot: every advertised command is registered',
    missingCommands.length === 0,
    missingCommands.length === 0
        ? `${registered.size} command(s) registered: ${[...registered].sort().join(', ')}`
        : `not registered: ${missingCommands.join(', ')}`,
);

// ---------------------------------------------------------------------------
// 6. Every button the bot draws is answered.
// ---------------------------------------------------------------------------
const navigationSource = readSource('telegram-bot', 'handlers', 'navigation.py');
const handled = new Set(
    [...navigationSource.matchAll(/data\s*==\s*"([a-z_]+)"/g)].map((match) => match[1]),
);
for (const match of navigationSource.matchAll(/data\.startswith\("([a-z_]+)_"\)/g)) {
    handled.add(match[1]);
}

const helpersSource = readSource('telegram-bot', 'utils', 'helpers.py');
const drawn = new Set([...helpersSource.matchAll(/callback_data="([^"]+)"/g)].map((match) => match[1]));

const unanswered = [...drawn].filter((data) => {
    if (data.includes('{')) return false; // built at runtime from the unit number
    return ![...handled].some((name) => data === name || data.startsWith(`${name}_`));
});

record(
    'Bot: every button the bot draws is answered',
    unanswered.length === 0,
    unanswered.length === 0
        ? `${drawn.size} button(s) checked`
        : `no handler for: ${unanswered.join(', ')}`,
);

// ---------------------------------------------------------------------------
// 7. The curriculum is the same size on both sides.
// ---------------------------------------------------------------------------
const contentSource = readSource('telegram-bot', 'content', 'phases.py');
const declaredUnits = /TOTAL_UNITS\s*=\s*(\d+)/.exec(contentSource);
record(
    'Curriculum: the bot teaches the whole sequence',
    Boolean(declaredUnits) && declaredUnits[1] === '28',
    declaredUnits ? `${declaredUnits[1]} units` : 'the unit count could not be read',
);

// ---------------------------------------------------------------------------
// 8. The website does not ship paid lessons to an anonymous reader.
// ---------------------------------------------------------------------------
try {
    const response = await fetch(`${SITE_URL}/api/principles`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => ({}));
    const units = Array.isArray(body?.units) ? body.units : [];
    const leaked = units.filter((unit) => unit?.locked && (unit?.body || unit?.content));
    record(
        'Gate: a locked unit ships no lesson to an anonymous reader',
        response.ok && leaked.length === 0,
        response.ok
            ? `${units.length} unit(s) answered, ${leaked.length} with a body`
            : `HTTP ${response.status}`,
    );
} catch (error) {
    record('Gate: a locked unit ships no lesson to an anonymous reader', null, error.message);
}

// ---------------------------------------------------------------------------
// The verdict.
// ---------------------------------------------------------------------------
const failed = results.filter((result) => result.ok === false);
const unknown = results.filter((result) => result.ok === null);

console.log('');
if (failed.length === 0) {
    console.log(`The bridge is wired. ${results.length} check(s) passed.`);
} else {
    console.log(`${failed.length} of ${results.length} check(s) failed:`);
    for (const result of failed) console.log(`  - ${result.label}${result.detail ? ` (${result.detail})` : ''}`);
}
if (unknown.length > 0) console.log(`${unknown.length} check(s) could not run.`);

process.exit(failed.length > 0 ? 1 : unknown.length > 0 ? 3 : 0);
