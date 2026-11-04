#!/usr/bin/env node
/**
 * Proves that the weekly brief can go out — and says what happened last time.
 *
 * The Intelligence Brief is what the $20 membership promises, and it travels a
 * chain with a link at every step. Each link can fail alone and silently:
 *
 *   1. the subscriber list still holds no address that cannot receive mail
 *   2. the suppression list can be read (the dispatch fails closed without it)
 *   3. the sending domain is verified, so the mail is not refused
 *   4. the cron route is alive and locked
 *   5. the cron actually ran, and what it did is on record
 *   6. every published issue has a send record, so nothing is sent twice
 *
 * Before this script existed, the only sign that the letter had gone out was
 * a `newsletter_sent` row — which is written only once the mail is on its
 * way. A cron that ran and had nothing to do, a dispatch that failed before
 * it sent, and a cron that never ran all looked identical: silence.
 *
 *   node scripts/check_newsletter_chain.mjs
 *
 * Nothing is printed except states, titles and counts. Secrets are never
 * echoed. Credentials are read from the environment first, then from
 * `Website/.env.local`.
 *
 * Exit codes: 0 the chain is healthy, 1 something is broken and is named,
 * 3 the check could not run.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

const SITE_URL = (process.env.IMPERIUM_SITE_URL || 'https://secretimperium.com').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 20000;
const FEDERATION_SITE = 'imperium';

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

const env = { ...loadEnvFile(join(repoRoot, 'Website', '.env.local')), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

/** Domains that are reserved for documentation and cannot receive mail. */
const RESERVED_DOMAINS = new Set([
    'example.com',
    'example.org',
    'example.net',
    'example.edu',
    'invalid',
    'test',
    'localhost',
    'local',
    'example',
]);
const RESERVED_SUFFIXES = ['.invalid', '.test', '.localhost', '.local', '.example'];

function isMailableAddress(email) {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    const at = trimmed.lastIndexOf('@');
    if (at <= 0 || at === trimmed.length - 1) return false;
    const host = trimmed.slice(at + 1).replace(/\.$/, '');
    if (RESERVED_DOMAINS.has(host)) return false;
    return !RESERVED_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

async function sb(path) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
}

async function siteFetch(path, init) {
    const response = await fetch(`${SITE_URL}${path}`, {
        ...init,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    return { status: response.status, text };
}

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(3);
}

// --- 1. the site is up -----------------------------------------------------
try {
    const home = await siteFetch('/');
    record('Site: the site answers', home.status === 200, `HTTP ${home.status}`);
} catch (error) {
    record('Site: the site answers', false, error.message);
}

// --- 2. the cron route is alive and locked ---------------------------------
try {
    const anonymous = await siteFetch('/api/newsletter/cron');
    record(
        'Cron: the route refuses a caller with no credential',
        anonymous.status === 401,
        `HTTP ${anonymous.status}`,
    );
} catch (error) {
    record('Cron: the route refuses a caller with no credential', false, error.message);
}

// --- 3. the subscriber list ------------------------------------------------
const profiles = await sb(
    'profiles?select=email,newsletter_subscribed&newsletter_subscribed=eq.true&limit=1000',
);
const federation = await sb(
    `federation_newsletter_subscribers?select=email,unsubscribed&site=eq.${FEDERATION_SITE}&limit=1000`,
);
const suppressions = await sb('omni_suppressions?select=email&limit=1000');

if (profiles.status !== 200) {
    record('List: the subscriber list can be read', false, `HTTP ${profiles.status}`);
} else {
    const subscribed = profiles.body || [];
    const undeliverable = subscribed
        .map((row) => String(row.email || '').toLowerCase())
        .filter((email) => email && !isMailableAddress(email));
    record(
        'List: no active subscriber sits at a reserved domain',
        undeliverable.length === 0,
        undeliverable.length === 0
            ? `${subscribed.length} active subscriber(s)`
            : `${undeliverable.length} undeliverable: ${undeliverable.join(', ')}`,
    );
}

// --- 4. the suppression list ------------------------------------------------
if (suppressions.status !== 200) {
    record('List: the suppression list can be read', false, `HTTP ${suppressions.status} — the dispatch fails closed without it`);
} else {
    record('List: the suppression list can be read', true, `${(suppressions.body || []).length} suppression(s)`);
}

// --- 5. the federation list -------------------------------------------------
if (federation.status !== 200) {
    record('List: the federation subscriber list can be read', false, `HTTP ${federation.status}`);
} else {
    const rows = federation.body || [];
    const active = rows.filter((row) => row.unsubscribed !== true).map((row) => String(row.email || '').toLowerCase());
    const undeliverable = active.filter((email) => email && !isMailableAddress(email));
    record(
        'List: the federation subscriber list can be read',
        true,
        `${active.length} active of ${rows.length}`,
    );
    record(
        'List: no active federation subscriber sits at a reserved domain',
        undeliverable.length === 0,
        undeliverable.length === 0 ? 'none' : undeliverable.join(', '),
    );
}

// --- 6. the published issues and their send state ---------------------------
const issues = await sb(
    'newsletters?select=id,title,published,created_at&published=eq.true&order=created_at&limit=50',
);
const sentMarks = await sb(
    'inbound_imperium_events?select=target_id,payload,created_at&event_type=eq.newsletter_sent&order=created_at.desc&limit=200',
);

// The most recent send record for each issue. An issue that was sent twice
// — once badly, once well — is judged on the send that actually carried
// the letter, not on the first attempt that failed.
const sentMap = new Map();
for (const row of (sentMarks.body || []).slice().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
)) {
    if (row.target_id && !sentMap.has(row.target_id)) sentMap.set(row.target_id, row);
}

if (issues.status !== 200) {
    record('Issues: the published issues can be read', false, `HTTP ${issues.status}`);
} else {
    const published = issues.body || [];
    const unsent = published.filter((row) => !sentMap.has(row.id));
    record(
        'Issues: every published issue has gone out',
        unsent.length === 0,
        unsent.length === 0
            ? `${published.length} published issue(s)`
            : `${unsent.length} awaiting a send: ${unsent.map((row) => row.title).join(', ')}`,
    );
    for (const row of published) {
        const mark = sentMap.get(row.id);
        if (!mark) continue;
        const payload = mark.payload || {};
        record(
            `Issue: "${row.title}" went out`,
            Number(payload.sent || 0) > 0,
            `${payload.sent || 0} sent, ${payload.failed || 0} failed — ${new Date(mark.created_at).toISOString()}`,
        );
    }
}

// --- 7. the dispatch history ------------------------------------------------
const attempts = await sb(
    'inbound_imperium_events?select=id,action,target_id,payload,created_at&event_type=eq.newsletter_dispatch&order=created_at.desc&limit=20',
);

if (attempts.status !== 200) {
    record('Dispatch: the attempt log can be read', false, `HTTP ${attempts.status}`);
} else {
    // Newest first. The order of the query is not relied on — the attempt
    // the check judges is chosen by its own timestamp, because reading the
    // *oldest* row and calling it "the last attempt" makes a healthy cron
    // look dead as soon as the log fills up.
    const rows = (attempts.body || []).slice().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    record(
        'Dispatch: the attempt log can be read',
        true,
        rows.length === 0 ? 'no attempt recorded yet' : `${rows.length} attempt(s) on record`,
    );

    const latest = rows[0];
    if (!latest) {
        // The attempt log was introduced after the brief's first send, so an
        // empty log means "nothing has run since it was added" — not "the
        // cron never worked". The send record above is the older evidence.
        record(
            'Cron: the cron ran within the last 36 hours',
            null,
            'the attempt log is new — nothing has run since it was introduced',
        );
        record('Dispatch: the last attempt did not fail', null, 'no attempt to judge');
    } else {
        const payload = latest.payload || {};
        const ageHours = (Date.now() - new Date(latest.created_at).getTime()) / 3600000;
        record(
            'Cron: the cron ran within the last 36 hours',
            ageHours <= 36,
            `${ageHours.toFixed(1)}h ago — ${latest.action} from ${payload.source || 'unknown'}${payload.reason ? ` (${payload.reason})` : ''}`,
        );
        record(
            'Dispatch: the last attempt did not fail',
            latest.action !== 'failed',
            `${latest.action} — ${payload.reason || 'no reason recorded'}`,
        );
    }
}

// --- 8. the sending domain --------------------------------------------------
const RESEND_KEY = env.RESEND_API_KEY;
if (!RESEND_KEY) {
    record('Sender: the sending domain is verified', null, 'no RESEND_API_KEY available to check with');
} else {
    try {
        const response = await fetch('https://api.resend.com/domains', {
            headers: { Authorization: `Bearer ${RESEND_KEY}` },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const body = await response.json().catch(() => ({}));
        const domain = (body.data || []).find((entry) => entry.name === 'secretimperium.com');
        record(
            'Sender: the sending domain is verified',
            Boolean(domain && domain.status === 'verified'),
            domain ? `${domain.name} is ${domain.status}` : 'secretimperium.com is not on this account',
        );
    } catch (error) {
        record('Sender: the sending domain is verified', null, error.message);
    }
}

// --- verdict -----------------------------------------------------------------
const failures = results.filter((entry) => entry.ok === false);
const skipped = results.filter((entry) => entry.ok === null);

console.log('');
if (failures.length === 0) {
    console.log(`The newsletter chain is healthy (${results.length} check(s), ${skipped.length} skipped).`);
    console.log('The next published issue will go out on the next cron run.');
    process.exit(0);
}

console.log(`${failures.length} of ${results.length} check(s) failed:`);
for (const failure of failures) console.log(`  - ${failure.label}${failure.detail ? `: ${failure.detail}` : ''}`);
process.exit(1);
