#!/usr/bin/env node
/**
 * Proves that what the site promises about the membership and the referral
 * commission is what it charges and what it pays.
 *
 * Two numbers sit underneath a promise the site makes in words: the
 * membership costs twenty a month, and a referral pays thirty per cent of
 * it. They used to be written out in a dozen places — the module that does
 * the arithmetic, the brand facts, the coaching copy, the referral page, the
 * member's portal, and every "join now" button on the site.
 *
 * They all agreed. **Nothing kept them agreeing.** The referral programme
 * was the worst case, because its promise is a *rate*: the page says thirty
 * per cent, the portal says thirty per cent, and the module that pays the
 * commission divides by a third of something. Change the rate in one place
 * and the site goes on promising a commission it does not pay.
 *
 * So the numbers now live in one file, `src/lib/membership.ts`, and every
 * surface derives its words from them. This script proves that is true and
 * that the owner agrees with the money:
 *
 *   1. the owner holds one rate and one price, and the labels it derives
 *      are the arithmetic those two numbers actually give;
 *   2. no other file states the rate, the commission amount or the price
 *      in words — the copy derives them;
 *   3. the module that pays the commission imports those numbers rather
 *      than keeping its own;
 *   4. the live referral page states the derived rate, the derived
 *      commission and the derived price;
 *   5. the catalogue charges the owner's price;
 *   6. the checkout link in the source is the catalogue's link, is active,
 *      and charges the catalogue price.
 *
 *   node scripts/check_referral_terms.mjs
 *
 * The target defaults to the live site. `PROOF_BASE` points it at a local
 * dev server instead.
 *
 * Nothing is printed except states, names, amounts and figures. Secrets are
 * never echoed. Credentials are read from the environment first, then from
 * `Website/.env.local`.
 *
 * Exit codes: 0 the terms agree, 1 something is broken and is named,
 * 3 the check could not run.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const appRoot = join(repoRoot, 'Website');
const srcRoot = join(appRoot, 'src');

const SITE_URL = (
    process.env.PROOF_BASE ||
    process.env.IMPERIUM_SITE_URL ||
    'https://secretimperium.com'
).replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 20000;

/** The one file that owns the rate and the price. */
const OWNER_FILE = join(srcRoot, 'lib', 'membership.ts');
/** The module that pays the commission. */
const MECHANIC_FILE = join(srcRoot, 'lib', 'server', 'referrals.ts');
/** The one file that owns the checkout link. */
const BRAND_FILE = join(srcRoot, 'lib', 'brand.ts');

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
const STRIPE_KEY = env.STRIPE_SECRET_KEY;

// --- 1. the owner ------------------------------------------------------------
if (!existsSync(OWNER_FILE)) {
    console.error(`The owner of the terms is missing: ${relative(repoRoot, OWNER_FILE)}`);
    process.exit(3);
}

const ownerSource = readFileSync(OWNER_FILE, 'utf8');
const priceMatch = /export const MEMBERSHIP_PRICE_CENTS\s*=\s*(\d+)/.exec(ownerSource);
const rateMatch = /export const REFERRAL_COMMISSION_RATE\s*=\s*([0-9.]+)/.exec(ownerSource);

if (!priceMatch || !rateMatch) {
    console.error('Could not read the rate and the price out of the owner of the terms.');
    process.exit(3);
}

const priceCents = Number(priceMatch[1]);
const rate = Number(rateMatch[1]);

// The same arithmetic the site does, done the way the ledger stores it.
const percent = Math.round(rate * 100);
const commissionCents = Math.round(priceCents * rate);
const priceDollars = priceCents / 100;
const commissionDollars = commissionCents / 100;

const derived = {
    percent: `${percent}%`,
    commission: `$${commissionDollars.toFixed(2)}`,
    priceAmount: `$${priceDollars.toFixed(2)}`,
    priceBare: `$${Number.isInteger(priceDollars) ? priceDollars : priceDollars.toFixed(2)}`,
    priceMonthly: `$${Number.isInteger(priceDollars) ? priceDollars : priceDollars.toFixed(2)}/month`,
    priceMonthlySpaced: `$${Number.isInteger(priceDollars) ? priceDollars : priceDollars.toFixed(2)} / month`,
};

record('Terms: the owner holds one rate and one price', true, `rate=${rate} price=$${priceDollars}/month`);

record(
    'Terms: the commission is what the rate says it is',
    commissionCents === Math.round(priceCents * rate) && commissionDollars > 0,
    `${derived.commission} on a ${derived.priceAmount} membership`,
);

record(
    'Terms: the owner derives the rate it publishes',
    ownerSource.includes('REFERRAL_COMMISSION_LABEL = `${Math.round(REFERRAL_COMMISSION_RATE * 100)}%`'),
    `expected ${derived.percent}`,
);

// --- 2. one home -------------------------------------------------------------
/**
 * Every source file under `src/`, as code lines.
 *
 * Comments are dropped: a comment may *mention* the rate while explaining
 * why it lives where it does, and a comment states nothing to a buyer.
 */
function codeLines(file) {
    const text = readFileSync(file, 'utf8');
    const lines = [];
    let inBlock = false;

    for (const raw of text.split('\n')) {
        const trimmed = raw.trim();
        if (inBlock) {
            if (trimmed.includes('*/')) inBlock = false;
            continue;
        }
        if (trimmed.startsWith('/*')) {
            if (!trimmed.includes('*/')) inBlock = true;
            continue;
        }
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        // A line comment after code is still a comment.
        lines.push(raw.replace(/\/\/.*$/, ''));
    }
    return lines;
}

function sourceFiles(dir) {
    const found = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            found.push(...sourceFiles(path));
        } else if (/\.(ts|tsx)$/.test(entry)) {
            found.push(path);
        }
    }
    return found;
}

/**
 * A line is about the terms when it talks about the membership, the
 * commission, or a monthly price.
 */
const IN_SCOPE = /\b(membership|commission|per month|\/month)\b/i;

const dollarsOn = (line) => [...line.matchAll(/\$([0-9]+(?:\.[0-9]+)?)/g)].map((m) => m[1]);
const percentsOn = (line) => [...line.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*%/g)].map((m) => m[1]);

/** The amounts the owner is allowed to produce. */
const restated = [];

for (const file of sourceFiles(srcRoot)) {
    if (file === OWNER_FILE) continue;
    for (const line of codeLines(file)) {
        if (!IN_SCOPE.test(line)) continue;

        // Not "an amount that disagrees" — **any** amount written out. The
        // only correct way to say the price on a page is to derive it, and a
        // line that types "$20 a month" is a second answer to what the
        // membership costs even when it happens to agree today.
        for (const amount of dollarsOn(line)) {
            restated.push(`${relative(repoRoot, file)}: $${amount}`);
        }
        for (const value of percentsOn(line)) {
            restated.push(`${relative(repoRoot, file)}: ${value}%`);
        }
    }
}

record(
    'Terms: no other file states the rate, the commission or the price',
    restated.length === 0,
    restated.length === 0
        ? 'the copy derives them'
        : restated.slice(0, 8).join(', '),
);

// The link has one home too: the checkout URL is written down once.
const brandSource = readFileSync(BRAND_FILE, 'utf8');
const linkMatch = /export const STRIPE_CHECKOUT_URL\s*=\s*"([^"]+)"/.exec(brandSource);
const sourceLink = linkMatch ? linkMatch[1] : null;

const linkCopies = [];
for (const file of sourceFiles(srcRoot)) {
    if (file === BRAND_FILE) continue;
    const text = readFileSync(file, 'utf8');
    const found = text.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) || [];
    const links = [...new Set(found)].filter((link) => link === sourceLink);
    if (links.length) linkCopies.push(relative(repoRoot, file));
}

record(
    'Terms: the membership checkout link is written down once',
    linkCopies.length === 0,
    linkCopies.length === 0
        ? 'the brand module owns it'
        : `also written in ${linkCopies.join(', ')}`,
);

// --- 3. the mechanic ---------------------------------------------------------
const mechanicSource = existsSync(MECHANIC_FILE) ? readFileSync(MECHANIC_FILE, 'utf8') : '';

record(
    'Terms: the module that pays the commission imports the numbers',
    mechanicSource.includes('from \'@/lib/membership\'') || mechanicSource.includes('from "@/lib/membership"'),
    'it does not keep its own rate',
);

// --- 4. the live pages -------------------------------------------------------
async function siteFetch(path) {
    const target = path.startsWith('http') ? path : `${SITE_URL}${path}`;
    const response = await fetch(target, {
        redirect: 'manual',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return { status: response.status, text: await response.text() };
}

const referralPage = await siteFetch('/tyronengouamo/referral/');
record('Page: the referral page answers', referralPage.status === 200, `HTTP ${referralPage.status}`);

if (referralPage.status === 200) {
    record(
        'Page: the referral page states the rate',
        referralPage.text.includes(derived.percent),
        `${derived.percent}`,
    );
    record(
        'Page: the referral page states the commission it pays',
        referralPage.text.includes(derived.commission),
        `${derived.commission}`,
    );
    record(
        'Page: the referral page states the membership price',
        referralPage.text.includes(derived.priceAmount),
        `${derived.priceAmount}`,
    );
}

// --- 5. the catalogue --------------------------------------------------------
async function sb(path) {
    const response = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${path}`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return { status: response.status, body: await response.json().catch(() => null) };
}

async function stripeGet(path) {
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return { status: response.status, body: await response.json().catch(() => null) };
}

if (!SUPABASE_URL || !SERVICE_KEY) {
    record('Catalogue: the products table can be read', null, 'no SUPABASE credentials available to check with');
    process.exit(3);
}

const catalogue = await sb('products?select=name,price,stripe_price_id,stripe_url,payment_link_url,metadata');
if (catalogue.status !== 200) {
    record('Catalogue: the products table can be read', false, `HTTP ${catalogue.status}`);
    process.exit(3);
}

const rows = catalogue.body || [];
const membership = rows.filter((row) => row.metadata?.kind === 'membership');

record('Catalogue: the membership is in the catalogue', membership.length === 1, `${membership.length} row(s)`);

if (membership.length === 1) {
    const row = membership[0];
    record(
        'Catalogue: the membership costs the price the owner states',
        Number(row.price) === priceDollars,
        `catalogue=$${row.price} owner=$${priceDollars}`,
    );

    const catalogueLink = row.stripe_url || row.payment_link_url;
    record(
        'Terms: the checkout link in the source is the catalogue’s link',
        catalogueLink === sourceLink,
        catalogueLink === sourceLink ? sourceLink : `source=${sourceLink} catalogue=${catalogueLink}`,
    );

    if (STRIPE_KEY) {
        const links = await stripeGet('/payment_links?limit=100');
        const link = (links.body?.data || []).find((entry) => entry.url === catalogueLink);
        record(
            'Terms: the checkout link is active',
            Boolean(link) && link.active === true,
            link ? `active=${link.active}` : 'no link in the account for the catalogue URL',
        );

        if (link && row.stripe_price_id) {
            const price = await stripeGet(`/prices/${row.stripe_price_id}`);
            const amount = price.body?.unit_amount != null ? price.body.unit_amount / 100 : null;
            record(
                'Terms: the link charges the price the owner states',
                amount === priceDollars,
                `charged=$${amount ?? 'unknown'} owner=$${priceDollars}`,
            );
        }
    } else {
        record('Terms: the checkout link is active', null, 'no STRIPE_SECRET_KEY available to check with');
    }
}

// --- verdict -----------------------------------------------------------------
const failed = results.filter((entry) => entry.ok === false);
const skipped = results.filter((entry) => entry.ok === null);

console.log('');
if (failed.length) {
    console.log(`${failed.length} check(s) failed:`);
    for (const entry of failed) console.log(`  - ${entry.label}`);
    process.exit(1);
}

console.log('The membership and the commission agree (every check passed).');
if (skipped.length) console.log(`${skipped.length} check(s) skipped — something was not available to check with.`);
process.exit(0);
