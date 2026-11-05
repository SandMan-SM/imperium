#!/usr/bin/env node
/**
 * Proves that every catalogue row that names a payment link can be bought.
 *
 * The coaching check covers the three coaching offers and the membership —
 * the things the site sells today. The merchandise was left out on purpose:
 * the storefront is closed, so its sellability is the operator's decision to
 * make when it reopens. **But a closed storefront is not a reason to leave
 * the catalogue wrong.** Six merchandise rows were wrong while nothing could
 * reach them: three named a link that had been retired, so the checkout
 * refused to take money, and three named a link that charged $44 for a tee
 * the catalogue says is $29.99. The buyer would have found out at the
 * checkout, on the day the shop reopened.
 *
 * So this script asks the question for every row in the catalogue:
 *
 *   1. does the row name a payment link, and does that link exist?
 *   2. is the link active — will it take money?
 *   3. does the link point at the price the row records?
 *   4. is the amount charged the price in the catalogue?
 *   5. does the page the buyer lands on after paying exist?
 *
 *   node scripts/check_catalogue_sellability.mjs
 *
 * The target defaults to the live site. `PROOF_BASE` points it at a local
 * dev server instead.
 *
 * Nothing is printed except states, names and amounts. Secrets are never
 * echoed. Credentials are read from the environment first, then from
 * `Website/.env.local`.
 *
 * Exit codes: 0 every row is sound, 1 something is broken and is named,
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

const results = [];

function record(label, ok, detail) {
    results.push({ label, ok, detail });
    const mark = ok === null ? 'SKIP' : ok ? 'PASS' : 'FAIL';
    console.log(`${mark}  ${label}${detail ? ` — ${detail}` : ''}`);
}

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
const STRIPE_KEY = env.STRIPE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(3);
}

async function siteFetch(path) {
    const target = path.startsWith('http') ? path : `${SITE_URL}${path}`;
    const response = await fetch(target, {
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    return { status: response.status, text };
}

async function sb(path) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${path}`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
}

async function stripeGet(path) {
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
}

// --- 1. the catalogue --------------------------------------------------------
const catalogue = await sb(
    'products?select=id,name,price,in_stock,brand,stripe_price_id,stripe_product_id,stripe_url,payment_link_url,metadata',
);

if (catalogue.status !== 200) {
    record('Catalogue: the products table can be read', false, `HTTP ${catalogue.status}`);
    console.log('\nThe catalogue could not be read, so nothing else can be checked.');
    process.exit(3);
}

const rows = catalogue.body || [];
record('Catalogue: the products table can be read', true, `${rows.length} row(s)`);

const withLink = rows.filter((row) => row.stripe_url || row.payment_link_url);
record(
    'Catalogue: every row that names a payment link can be checked',
    withLink.length === rows.length,
    withLink.length === rows.length
        ? `${withLink.length} row(s)`
        : `${rows.length - withLink.length} row(s) name no link`,
);

// --- 2. the account ----------------------------------------------------------
let linksByUrl = new Map();
if (!STRIPE_KEY) {
    record('Stripe: the account can be read', null, 'no STRIPE_SECRET_KEY available to check with');
} else {
    const list = await stripeGet('/payment_links?limit=100');
    if (list.status !== 200) {
        record('Stripe: the payment links can be read', false, `HTTP ${list.status}`);
    } else {
        linksByUrl = new Map((list.body?.data || []).map((link) => [link.url, link]));
        record(
            'Stripe: the payment links can be read',
            true,
            `${(list.body?.data || []).length} link(s) in the account`,
        );
    }
}

// --- 3. every row against the account ----------------------------------------
for (const row of withLink) {
    const url = row.stripe_url || row.payment_link_url;
    const link = linksByUrl.get(url);

    record(
        `Row: ${row.name} — the payment link exists`,
        Boolean(link),
        link ? link.id : `no link in the account for ${url}`,
    );

    if (!link) continue;

    record(`Row: ${row.name} — the payment link is active`, link.active === true, `active=${link.active}`);

    const items = await stripeGet(`/payment_links/${link.id}/line_items`);
    const linkedPriceId = items.body?.data?.[0]?.price?.id || null;

    record(
        `Row: ${row.name} — the link points at the recorded price`,
        linkedPriceId === row.stripe_price_id,
        `link=${linkedPriceId || 'none'} row=${row.stripe_price_id || 'none'}`,
    );

    const price = await stripeGet(`/prices/${linkedPriceId}`);
    const chargedCents = price.body?.unit_amount ?? null;
    const catalogueCents = Math.round(Number(row.price) * 100);

    record(
        `Row: ${row.name} — the amount charged is the price in the catalogue`,
        chargedCents === catalogueCents,
        `charged=${chargedCents != null ? `$${(chargedCents / 100).toFixed(2)}` : 'unknown'} catalogue=$${row.price}`,
    );

    if (row.in_stock === true) {
        record(
            `Row: ${row.name} — a row marked in stock can actually be bought`,
            link.active === true && chargedCents === catalogueCents,
            link.active === true && chargedCents === catalogueCents
                ? 'the link is live and charges the catalogue price'
                : 'the row says it is in stock, but its link cannot be bought',
        );
    }

    const detail = await stripeGet(`/payment_links/${link.id}`);
    const redirect = detail.body?.after_completion?.redirect?.url || null;
    if (!redirect) {
        record(`Row: ${row.name} — the buyer lands on a page after paying`, null, 'the link has no redirect set');
        continue;
    }

    const landing = redirect.replace('{CHECKOUT_SESSION_ID}', 'probe');
    const target = await siteFetch(landing.startsWith(SITE_URL) ? landing.slice(SITE_URL.length) || '/' : landing);
    record(
        `Row: ${row.name} — the buyer lands on a page after paying`,
        target.status === 200,
        `HTTP ${target.status} — ${landing}`,
    );
}

// --- verdict -----------------------------------------------------------------
const failures = results.filter((entry) => entry.ok === false);
const skipped = results.filter((entry) => entry.ok === null);

console.log('');
if (failures.length === 0) {
    console.log(`Every catalogue row that names a link is sellable (${results.length} check(s), ${skipped.length} skipped).`);
    console.log('Each link is live, charges the catalogue price, and lands the buyer on a page that exists.');
    process.exit(0);
}

console.log(`${failures.length} of ${results.length} check(s) failed:`);
for (const failure of failures) console.log(`  - ${failure.label}${failure.detail ? `: ${failure.detail}` : ''}`);
process.exit(1);
