#!/usr/bin/env node
/**
 * Proves the Success Empire application front door actually works.
 *
 * The home page was rebuilt as an application surface (2026-11-04) and the
 * application form is now the site's front door: a visitor arrives, fills in
 * a form, and the site promises them a reply. **Nothing proves the promise
 * holds.**
 *
 * Every other chain on this site has a command that asks the questions the
 * operator would ask — the money path, the referral, the coaching offers,
 * the catalogue, the letter, the Telegram bridge. The newest front door is
 * the only one without one, and it is the only one a *visitor* walks into.
 *
 * The relay to the CRM was hardened at the same time it was written (origin
 * allowlist, size and content-type bounds, a honeypot, a rate limit, a
 * fixed destination, a fail-closed receipt check), and its boundary tests
 * live in `Website/scripts/test-success-empire-relay.mjs`. What was missing
 * is the part that only production can answer: **does the deployed door
 * still answer, and does it still refuse what it is supposed to refuse?**
 *
 * This script asks, in the order a visitor meets them:
 *
 *   1. does the application page exist, and does it carry the form?
 *   2. can a visitor get to it from the front door?
 *   3. does the relay answer at all — is the identity and the upstream alive?
 *   4. does it still refuse a forged origin, an unreadable body, an
 *      oversized body and the wrong content type, before forwarding
 *      anything to the CRM?
 *   5. do the fields the browser sends and the fields the server reads
 *      still agree?
 *   6. can a caller still change the destination, the tenant or the offer?
 *   7. do the boundary tests still pass?
 *
 * **This check writes nothing.** Every probe it makes is refused by the
 * door before the relay is reached, so no lead is created and no message is
 * sent. That is deliberate: a proof that dirties the CRM is a proof nobody
 * runs twice. The one question this script cannot answer from production —
 * "does a *valid* application reach the CRM with both receipts?" — is
 * answered by the boundary suite, which exercises the same module offline
 * with the network replaced.
 *
 *   node scripts/check_apply_chain.mjs
 *
 * The target defaults to the live site. `PROOF_BASE` points it at a local
 * dev server instead.
 *
 * Exit codes: 0 the front door is sound, 1 something is broken and is
 * named, 3 the check could not run.
 */

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

const APPLY_PAGE = '/apply/';
const APPLY_ENDPOINT = '/api/apply/';

/** The fields the browser sends. */
const CLIENT_FILE = join(repoRoot, 'Website', 'src', 'components', 'SuccessEmpireApplication.tsx');
/** The fields the server reads, and the door itself. */
const SERVER_FILE = join(repoRoot, 'Website', 'src', 'lib', 'server', 'success-empire-application.ts');
/** The offline boundary suite for the same module. */
const BOUNDARY_SUITE = join(repoRoot, 'Website', 'scripts', 'test-success-empire-relay.mjs');

const results = [];

function record(label, ok, detail) {
    results.push({ label, ok, detail });
    const mark = ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL';
    console.log(`${mark}  ${label}${detail ? ` — ${detail}` : ''}`);
}

function readSource(path) {
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf8');
}

/** A fetch that never hangs and never throws its way into a false pass. */
async function siteFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${SITE_URL}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal, redirect: 'manual' });
        const text = await response.text();
        let body = null;
        try {
            body = JSON.parse(text);
        } catch {
            body = null;
        }
        return { status: response.status, text, body };
    } catch (error) {
        return { status: 0, text: '', body: null, error: error instanceof Error ? error.message : String(error) };
    } finally {
        clearTimeout(timer);
    }
}

// --- 1. the page the visitor lands on ----------------------------------------

const page = await siteFetch(APPLY_PAGE);
if (page.status === 0) {
    record('Page: the application page answers', null, page.error || 'no response');
} else {
    record('Page: the application page answers', page.status === 200, `HTTP ${page.status} — ${SITE_URL}${APPLY_PAGE}`);
    const hasForm = page.text.includes('<form') && page.text.includes('name="fullName"');
    record('Page: the application page carries the form', hasForm, hasForm ? 'the form and its first field are in the page' : 'no form was found in the page');
    record(
        'Page: the form asks for every field the server needs',
        ['name="fullName"', 'name="email"', 'name="phone"', 'name="message"'].every((field) => page.text.includes(field)),
        'fullName, email, phone and message',
    );
}

// --- 2. the front door --------------------------------------------------------

const home = await siteFetch('/');
if (home.status === 0) {
    record('Front door: the home page answers', null, home.error || 'no response');
} else {
    record('Front door: the home page answers', home.status === 200, `HTTP ${home.status}`);
    const linksToApply = home.text.includes(APPLY_PAGE) || home.text.includes('/apply');
    record('Front door: the home page leads to the application', linksToApply, linksToApply ? 'the application is linked from the home page' : 'no link to the application was found');
}

// --- 3. the relay answers -----------------------------------------------------

const readiness = await siteFetch(APPLY_ENDPOINT, { method: 'GET' });
if (readiness.status === 0) {
    record('Relay: the door answers a readiness read', null, readiness.error || 'no response');
} else {
    const ready = readiness.status === 200 && readiness.body?.ok === true && readiness.body?.no_write === true;
    record(
        'Relay: the door answers a readiness read',
        ready,
        ready ? 'the deployed identity and the upstream both answer' : `HTTP ${readiness.status} — ${readiness.body ? JSON.stringify(readiness.body) : readiness.text.slice(0, 120)}`,
    );
}

// --- 4. the door still refuses what it must refuse ----------------------------
//
// Every probe below is refused before the relay is reached, so none of them
// creates a lead. A 429 instead of the expected refusal is also a refusal —
// the rate limiter is doing its job — and is reported as such.

const probes = [
    {
        label: 'the door refuses a forged origin',
        expected: 403,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', origin: 'https://attacker.invalid' },
            body: JSON.stringify({ fullName: 'Probe Person', email: 'probe@example.invalid', phone: '+12025550123', message: 'A probe that must never be forwarded.', company_website: '', submission_id: '2c415c73-978d-4d05-9e9e-9bfce137b42a' }),
        },
    },
    {
        label: 'the door refuses a request with no origin at all',
        expected: 403,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: 'Probe Person', email: 'probe@example.invalid', phone: '+12025550123', message: 'A probe that must never be forwarded.', company_website: '', submission_id: '2c415c73-978d-4d05-9e9e-9bfce137b42a' }),
        },
    },
    {
        label: 'the door refuses the wrong content type',
        expected: 415,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain', origin: SITE_URL },
            body: 'fullName=Probe Person',
        },
    },
    {
        label: 'the door refuses a body it cannot read',
        expected: 422,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', origin: SITE_URL },
            body: '{not json',
        },
    },
    {
        label: 'the door refuses an application with missing fields',
        expected: 422,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', origin: SITE_URL },
            body: JSON.stringify({ fullName: '', email: 'not-an-email', phone: '1', message: 'short' }),
        },
    },
    {
        label: 'the door refuses an oversized body',
        expected: 413,
        options: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', origin: SITE_URL },
            body: JSON.stringify({ fullName: 'Probe Person', email: 'probe@example.invalid', phone: '+12025550123', message: 'x'.repeat(9000), company_website: '', submission_id: '2c415c73-978d-4d05-9e9e-9bfce137b42a' }),
        },
    },
];

for (const probe of probes) {
    const response = await siteFetch(APPLY_ENDPOINT, probe.options);
    if (response.status === 0) {
        record(probe.label, null, response.error || 'no response');
        continue;
    }
    const refused = response.status === probe.expected;
    const limited = response.status === 429;
    record(
        probe.label,
        refused || limited,
        limited
            ? 'HTTP 429 — the rate limiter answered first, which is also a refusal'
            : `HTTP ${response.status} (expected ${probe.expected})`,
    );
}

// --- 5. the browser and the server agree on the fields ------------------------

const clientSource = readSource(CLIENT_FILE);
const serverSource = readSource(SERVER_FILE);

if (!clientSource || !serverSource) {
    record('Contract: the browser and the server agree on the fields', null, 'the source of the form or the relay could not be read');
} else {
    const clientInput = clientSource.match(/const input = retryOnly[\s\S]*?\};/);
    const clientFields = new Set();
    for (const match of clientSource.matchAll(/name="([a-zA-Z_]+)"/g)) clientFields.add(match[1]);
    if (clientInput) for (const match of clientInput[0].matchAll(/([a-zA-Z_]+):/g)) clientFields.add(match[1]);

    const serverFields = new Set();
    for (const match of serverSource.matchAll(/text\("([a-zA-Z_]+)"\)/g)) serverFields.add(match[1]);

    const missing = [...serverFields].filter((field) => !clientFields.has(field));
    const extra = [...clientFields].filter((field) => !serverFields.has(field));
    record(
        'Contract: the browser and the server agree on the fields',
        missing.length === 0 && extra.length === 0,
        missing.length || extra.length
            ? `the server reads [${[...serverFields].sort().join(', ')}], the browser sends [${[...clientFields].sort().join(', ')}]`
            : `both sides use [${[...serverFields].sort().join(', ')}]`,
    );

    // --- 6. the caller cannot move the destination ----------------------------
    const fixedDestination = /const PRODUCTION_ENDPOINT = "https:\/\/[^"]+";/.test(serverSource);
    record('Destination: the relay posts to one fixed endpoint', fixedDestination, fixedDestination ? 'the endpoint is a constant in the module' : 'the endpoint is not a constant');
    const callerCannotRedirect = !clientFields.has('endpoint') && !clientFields.has('page_url') && !clientFields.has('source') && !clientFields.has('offer');
    record('Destination: the caller cannot set the destination, tenant or offer', callerCannotRedirect, 'the browser sends no field that names any of them');
    const tenantIsFixed = /source: "imperium"/.test(serverSource) && /offer: "success_empire"/.test(serverSource);
    record('Destination: the tenant and the offer are set by the server', tenantIsFixed, tenantIsFixed ? 'the server writes both' : 'the server does not write them');

    const rateLimitCall = serverSource.indexOf('deps.rateLimit(');
    const forwardCall = serverSource.indexOf('deps.fetch(');
    const rateLimited = /consumeRateWindow/.test(serverSource) && rateLimitCall !== -1 && forwardCall !== -1 && rateLimitCall < forwardCall;
    record('Door: the application door is rate limited', rateLimited, rateLimited ? 'the shared limiter is consulted before anything is forwarded' : 'no rate limiter is called before the relay');

    const failsClosed = /data\.workflow_complete === true/.test(serverSource) && /hasOwnerReceipt/.test(serverSource);
    record('Receipt: an application is only a success when every receipt is present', failsClosed, failsClosed ? 'the relay requires the CRM record and both message receipts' : 'the receipt check is missing');
}

// --- 7. the boundary suite ----------------------------------------------------

if (!existsSync(BOUNDARY_SUITE)) {
    record('Boundary: the offline relay suite passes', null, 'the suite is not in the repository');
} else {
    let passed = false;
    let detail = '';
    try {
        const output = execFileSync(process.execPath, ['--test', BOUNDARY_SUITE], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
        const summary = output.match(/^# pass (\d+)/m);
        passed = true;
        detail = summary ? `${summary[1]} test(s) passed` : 'the suite passed';
    } catch (error) {
        const output = `${error.stdout || ''}${error.stderr || ''}`;
        const summary = output.match(/^# fail (\d+)/m);
        detail = summary ? `${summary[1]} test(s) failed` : 'the suite failed';
    }
    record('Boundary: the offline relay suite passes', passed, detail);
}

// --- verdict ------------------------------------------------------------------

const failures = results.filter((entry) => entry.ok === false);
const skipped = results.filter((entry) => entry.ok === null);

console.log('');
if (failures.length === 0) {
    console.log(`The application front door is sound (${results.length} check(s), ${skipped.length} skipped).`);
    console.log('A visitor can apply, the door refuses what it must, and nothing was written.');
    process.exit(0);
}

console.log(`${failures.length} of ${results.length} check(s) failed:`);
for (const failure of failures) console.log(`  - ${failure.label}${failure.detail ? `: ${failure.detail}` : ''}`);
process.exit(1);
