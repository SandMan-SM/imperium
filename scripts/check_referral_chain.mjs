#!/usr/bin/env node
/**
 * Proves that the referral programme works, end to end, against the live
 * database — and that it cleans up after itself.
 *
 * The referral chain has a link at every step, and each link can fail alone
 * and silently:
 *
 *   1. the member is issued a code, and a link built from it
 *   2. the link resolves, sets the cookie, and asks not to be indexed
 *   3. the referred member claims it
 *   4. the referrer sees the referral
 *   5. the commission is earned when the membership is paid for
 *   6. the commission is not earned twice
 *   7. an anonymous caller cannot claim a referral onto somebody
 *   8. a member cannot refer themselves
 *
 * This script walks that whole journey with two throwaway accounts, then
 * removes every trace of them — including the accounts a previous run left
 * behind, which are swept before the run starts.
 *
 *   node scripts/check_referral_chain.mjs
 *
 * The target defaults to the live site. `PROOF_BASE` points it at a local
 * dev server instead:
 *
 *   PROOF_BASE=http://localhost:3100 node scripts/check_referral_chain.mjs
 *
 * Nothing is printed except states, codes and figures. Secrets are never
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

const SITE_URL = (
    process.env.PROOF_BASE ||
    process.env.IMPERIUM_SITE_URL ||
    'https://secretimperium.com'
).replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 20000;

/** Every account this script creates is named with this prefix. */
const PROBE_PREFIX = 'ref-probe-';
/** A reserved domain — these addresses can never receive mail. */
const PROBE_DOMAIN = 'example.invalid';

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
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The commission rate and the membership price live in
 * `src/lib/server/referrals.ts` and nowhere else. This script reads them
 * from there rather than restating them, so a change to the rate does not
 * turn this check into a lie about the rate.
 */
function readCommissionNumbers() {
    const source = join(repoRoot, 'Website', 'src', 'lib', 'server', 'referrals.ts');
    if (!existsSync(source)) return null;

    const text = readFileSync(source, 'utf8');
    const rate = /export const REFERRAL_COMMISSION_RATE\s*=\s*([0-9.]+)/.exec(text);
    const price = /export const MEMBERSHIP_PRICE_CENTS\s*=\s*([0-9]+)/.exec(text);
    if (!rate || !price) return null;

    return {
        rate: Number(rate[1]),
        priceCents: Number(price[1]),
        commission: Math.round(Number(price[1]) * Number(rate[1])) / 100,
    };
}

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
    process.exit(3);
}

const numbers = readCommissionNumbers();
if (!numbers) {
    console.error('Could not read the commission rate and membership price from src/lib/server/referrals.ts');
    process.exit(3);
}

const adminHeaders = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};
const anonHeaders = { apikey: ANON_KEY, 'Content-Type': 'application/json' };

async function rest(path, init = {}) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${path}`, {
        ...init,
        headers: { ...adminHeaders, ...(init.headers || {}) },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
}

async function siteFetch(path, init = {}) {
    const response = await fetch(`${SITE_URL}${path}`, {
        ...init,
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    return {
        status: response.status,
        text,
        headers: response.headers,
        setCookie: response.headers.get('set-cookie') || '',
        location: response.headers.get('location') || '',
    };
}

async function createUser(email, password) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/admin/users`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ email, password, email_confirm: true }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`could not create the account: ${JSON.stringify(body)}`);
    return body.id;
}

async function signIn(email, password) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: anonHeaders,
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`could not sign in: ${JSON.stringify(body)}`);
    return body.access_token;
}

/** Every probe account this script has ever created. */
async function listProbeAccounts() {
    const response = await fetch(
        `${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/admin/users?page=1&per_page=1000`,
        { headers: adminHeaders, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok) return [];
    return (body?.users || []).filter((user) =>
        String(user?.email || '').toLowerCase().startsWith(PROBE_PREFIX),
    );
}

/**
 * Removes one probe account and everything that hangs off it.
 *
 * Order matters: the referral rows point at `profiles(id)`, so they go
 * first, then the profile rows, then the auth user. A profile left behind
 * is a row that still says somebody was referred.
 */
async function removeProbeAccount(userId, email) {
    const profiles = await rest(`profiles?select=id,auth_id,email&email=like.${PROBE_PREFIX}*`);
    const mine = (profiles.body || []).filter(
        (row) => row.auth_id === userId || String(row.email || '').toLowerCase() === email.toLowerCase(),
    );

    for (const row of mine) {
        await rest(`referrals?referred_id=eq.${row.id}`, { method: 'DELETE' });
        await rest(`referrals?referrer_id=eq.${row.id}`, { method: 'DELETE' });
    }

    for (const row of mine) {
        await rest(`profiles?id=eq.${row.id}`, { method: 'DELETE' });
    }

    await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: adminHeaders,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }).catch(() => null);

    return mine.length;
}

const stamp = Date.now();
const emailA = `${PROBE_PREFIX}referrer-${stamp}@${PROBE_DOMAIN}`;
const emailB = `${PROBE_PREFIX}referred-${stamp}@${PROBE_DOMAIN}`;
const password = 'Probe-Password-2026!';

const created = [];

async function cleanup() {
    if (created.length === 0) return;
    for (const { id, email } of created.splice(0, created.length)) {
        await removeProbeAccount(id, email).catch(() => null);
    }
}

// A script that dies between creating an account and reaching its `finally`
// block leaves a live account behind. The signal handlers and the exit hook
// close that window: the accounts are removed however this process ends.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
        cleanup().finally(() => process.exit(130));
    });
}
process.on('exit', () => {
    // Best effort only — the promise cannot be awaited here, but the request
    // is still issued.
    void cleanup();
});

try {
    // --- 0. the site answers -------------------------------------------------
    {
        const home = await siteFetch('/');
        record('Site: the site answers', home.status === 200, `HTTP ${home.status}`);
    }

    // --- 0b. sweep the accounts a previous run left behind -------------------
    {
        const stale = await listProbeAccounts();
        for (const user of stale) {
            await removeProbeAccount(user.id, user.email);
        }
        record(
            'Cleanup: no probe account was left behind by an earlier run',
            stale.length === 0,
            stale.length === 0 ? 'none' : `${stale.length} swept`,
        );
    }

    // --- 1. two throwaway accounts -------------------------------------------
    const userA = await createUser(emailA, password);
    created.push({ id: userA, email: emailA });
    const userB = await createUser(emailB, password);
    created.push({ id: userB, email: emailB });

    const tokenA = await signIn(emailA, password);
    const tokenB = await signIn(emailB, password);
    record('Account: two throwaway accounts created and signed in', true, `${emailA} / ${emailB}`);

    // --- 2. the referrer is issued a code and a link -------------------------
    const mineResponse = await siteFetch('/api/referrals/mine', {
        headers: { Authorization: `Bearer ${tokenA}` },
    });
    let summary = {};
    try {
        summary = JSON.parse(mineResponse.text);
    } catch {
        summary = {};
    }
    record(
        'Code: the member is issued a referral code',
        mineResponse.status === 200 && typeof summary.code === 'string' && summary.code.length === 8,
        `code=${summary.code || 'none'}`,
    );
    record(
        'Link: the link is built from that code',
        typeof summary.link === 'string' && summary.link.includes(`/ref/${summary.code}`),
        summary.link || 'no link',
    );

    // --- 3. the link resolves, sets the cookie, and is not indexable ---------
    const refResponse = await siteFetch(`/ref/${summary.code}`);
    const cookie = refResponse.setCookie.split(';')[0];
    record(
        'Link: the link redirects and sets the cookie',
        refResponse.status === 302 && cookie.includes('imperium_ref='),
        `HTTP ${refResponse.status} ${cookie || 'no cookie'}`,
    );
    record(
        'Link: the link asks not to be indexed',
        (refResponse.headers.get('x-robots-tag') || '').toLowerCase().includes('noindex'),
        `X-Robots-Tag: ${refResponse.headers.get('x-robots-tag') || 'absent'}`,
    );
    record(
        'Link: the redirect carries no body for a crawler to index',
        refResponse.text.trim().length === 0,
        refResponse.text.trim().length === 0 ? 'empty body' : `${refResponse.text.trim().length} bytes`,
    );

    // --- 4. the referred member claims it -----------------------------------
    const claim = await siteFetch('/api/referrals/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenB}`, Cookie: cookie },
    });
    const claimBody = JSON.parse(claim.text || '{}');
    record(
        'Claim: the referral is claimed against the second account',
        claim.status === 200 && claimBody.claimed === true,
        `claimed=${claimBody.claimed} reason=${claimBody.reason || 'none'}`,
    );

    // --- 5. the referrer sees the referral ----------------------------------
    {
        const after = JSON.parse((await siteFetch('/api/referrals/mine', {
            headers: { Authorization: `Bearer ${tokenA}` },
        })).text || '{}');
        record(
            'Referral: the referrer sees the referral',
            after.referralCount === 1,
            `count=${after.referralCount}`,
        );
    }

    // --- 6. the membership is paid for, and the commission is earned ---------
    //
    // The membership is stood in for by the flag the webhook would write, on
    // a throwaway account. Stripe is the real ledger, but the commission is
    // earned by the flag path too — which is the path a member who paid
    // before they had an account takes.
    const profiles = await rest(`profiles?select=id,email&email=like.${PROBE_PREFIX}*`);
    const profileB = (profiles.body || []).find(
        (row) => String(row.email || '').toLowerCase() === emailB,
    );
    const profileA = (profiles.body || []).find(
        (row) => String(row.email || '').toLowerCase() === emailA,
    );

    if (!profileB) {
        record('Membership: the probe profiles exist', false, 'no profile row for the referred account');
    } else {
        await rest(`profiles?id=eq.${profileB.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_premium: true, subscription_status: 'active' }),
        });

        await siteFetch('/api/referrals/claim', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenB}`, Cookie: cookie },
        });

        const afterPay = JSON.parse((await siteFetch('/api/referrals/mine', {
            headers: { Authorization: `Bearer ${tokenA}` },
        })).text || '{}');
        record(
            'Commission: the commission is earned on the paid membership',
            Number(afterPay.commissionUnpaid) === numbers.commission,
            `unpaid=$${afterPay.commissionUnpaid} (${numbers.rate * 100}% of $${(numbers.priceCents / 100).toFixed(2)})`,
        );
    }

    // --- 7. the commission is not earned twice -------------------------------
    {
        await siteFetch('/api/referrals/claim', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenB}`, Cookie: cookie },
        });
        const afterAgain = JSON.parse((await siteFetch('/api/referrals/mine', {
            headers: { Authorization: `Bearer ${tokenA}` },
        })).text || '{}');
        record(
            'Commission: the commission is not earned twice',
            Number(afterAgain.commissionUnpaid) === numbers.commission && afterAgain.referralCount === 1,
            `unpaid=$${afterAgain.commissionUnpaid} count=${afterAgain.referralCount}`,
        );
    }

    // --- 8. an anonymous caller cannot claim --------------------------------
    {
        const noAuth = await siteFetch('/api/referrals/claim', { method: 'POST' });
        record(
            'Claim: an unauthenticated claim is refused',
            noAuth.status === 401,
            `HTTP ${noAuth.status}`,
        );
    }

    // --- 9. a member cannot refer themselves --------------------------------
    {
        const selfRef = await siteFetch('/api/referrals/claim', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenA}`, Cookie: `imperium_ref=${summary.code}` },
        });
        const body = JSON.parse(selfRef.text || '{}');
        record(
            'Claim: a self referral is refused',
            selfRef.status === 200 && body.claimed === false && body.reason === 'self referral',
            `reason=${body.reason || 'none'}`,
        );
    }
} catch (error) {
    record('The journey ran to the end', false, String(error?.message || error));
} finally {
    await cleanup();
}

// --- 10. the probes are gone -------------------------------------------------
{
    const stale = await listProbeAccounts();
    const remaining = await rest(`profiles?select=id,email&email=like.${PROBE_PREFIX}*`);
    const rows = remaining.body || [];
    record(
        'Cleanup: every probe account and profile was removed',
        stale.length === 0 && rows.length === 0,
        stale.length === 0 && rows.length === 0
            ? 'the database is clean'
            : `${stale.length} account(s), ${rows.length} profile(s) left`,
    );
}

// --- verdict ------------------------------------------------------------------
const failures = results.filter((entry) => entry.ok === false);
const skipped = results.filter((entry) => entry.ok === null);

console.log('');
if (failures.length === 0) {
    console.log(`The referral chain is healthy (${results.length} check(s), ${skipped.length} skipped).`);
    console.log(`A member's code, link, referral and commission ($${numbers.commission.toFixed(2)}) all work.`);
    process.exit(0);
}

console.log(`${failures.length} of ${results.length} check(s) failed:`);
for (const failure of failures) console.log(`  - ${failure.label}${failure.detail ? `: ${failure.detail}` : ''}`);
process.exit(1);
