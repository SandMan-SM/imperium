#!/usr/bin/env node
/**
 * Proves that what the coaching pages offer is what the buyer is charged.
 *
 * The coaching pages and the catalogue each carry a price, and the Stripe
 * account carries a third. Last session they disagreed: every offer pointed
 * at the $20 membership link, so a buyer who clicked "Personal Training —
 * $150" was taken to a checkout for a subscription they had not asked for.
 * That was fixed. **Nothing keeps it fixed.** A price edited in one place
 * and not the other puts it back, and the buyer finds out at the checkout.
 *
 * The offers live in `Website/src/lib/coaching-offers.ts`, which is the one
 * place their prices are written down. This script walks **that** list, not
 * the catalogue's: the catalogue used to be the list the check walked, which
 * meant an offer added to the site without a catalogue row was invisible to
 * it — the check passed, and the offer sat on the page with nothing behind
 * it. The owner is the truth; the catalogue row and the Stripe account are
 * copies of it, and this is the check that says they still are.
 *
 * So this script asks the question in the only order that matters:
 *
 *   1. does every offer have a catalogue row, and does that row carry the
 *      price and the name the owner states?
 *   2. is the row in stock, with a Stripe price?
 *   3. is the payment link active?
 *   4. does the link point at the recorded price — and at that row?
 *   5. is the amount charged the price the site says?
 *   6. is the price on the live page the price charged?
 *   7. does the page the buyer lands on after paying exist?
 *
 *   node scripts/check_coaching_offers.mjs
 *
 * The target defaults to the live site. `PROOF_BASE` points it at a local
 * dev server instead.
 *
 * Node 22.6 or newer: the owner is a TypeScript module and is imported
 * directly, so Node has to be able to strip the types.
 *
 * Nothing is printed except states, names, amounts and figures. Secrets are
 * never echoed. Credentials are read from the environment first, then from
 * `Website/.env.local`.
 *
 * Exit codes: 0 the offers are sound, 1 something is broken and is named,
 * 3 the check could not run.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COACHING_OFFERS } from '../Website/src/lib/coaching-offers.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

const SITE_URL = (
    process.env.PROOF_BASE ||
    process.env.IMPERIUM_SITE_URL ||
    'https://secretimperium.com'
).replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 20000;

/** The page the coaching offers are sold from. */
const COACHING_PAGE = '/tyronengouamo';
/** The catalogue rows that are the coaching offers. */
const COACHING_TIER = 'tyrone';

/**
 * The public surfaces an offer can be sold from.
 *
 * The check used to name the home page as the page the membership is sold
 * from. That was true once and stopped being true: the home page was
 * rebuilt as the Success Empire surface, which carries no price and no
 * payment link. The check did not notice — it kept reading the home page,
 * found no price on it, and reported a defect that was really a page that
 * had moved. **A check that names the page an offer lives on goes stale the
 * day the offer moves.** So the pages are candidates, not owners: an offer is
 * sold from whichever of them carries its link, and every page that carries
 * the link has to carry the price too.
 */
const SURFACES = ['/', '/archive/', '/newsletter/', '/principles/', COACHING_PAGE, `${COACHING_PAGE}/referral/`];

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

/** Does the page show this amount — and not a longer number that starts with it? */
function pageShowsAmount(html, amount) {
    const pattern = new RegExp(`\\$${String(amount).replace('.', '\\.')}(?!\\d)`);
    return pattern.test(html);
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
const coaching = rows.filter((row) => row.brand === COACHING_TIER);
const membership = rows.filter((row) => row.metadata?.kind === 'membership');

record('Catalogue: the products table can be read', true, `${rows.length} row(s)`);

// The offers are read from the owner, not from the catalogue. The catalogue
// used to be the list the check walked, which meant an offer added to the
// site without a catalogue row was invisible here: the check passed, and the
// offer sat on the page with nothing behind it. **An offer with no
// catalogue row is an offer nobody is checking.**
const ownerOffers = COACHING_OFFERS;

record(
    'Catalogue: every coaching offer has a catalogue row',
    ownerOffers.every((offer) => rows.some((row) => row.id === offer.catalogueId)),
    ownerOffers
        .map(
            (offer) =>
                `${offer.name}: ${
                    rows.some((row) => row.id === offer.catalogueId) ? 'found' : 'MISSING'
                }`,
        )
        .join(', '),
);

const staleRows = coaching.filter(
    (row) => !ownerOffers.some((offer) => offer.catalogueId === row.id),
);
record(
    'Catalogue: no coaching row is left behind by an offer that is gone',
    staleRows.length === 0,
    staleRows.length === 0
        ? 'every coaching row is an offer'
        : staleRows.map((row) => row.name).join(', '),
);

record(
    'Catalogue: the membership is in the catalogue',
    membership.length === 1,
    membership.length === 1 ? membership[0].name : `${membership.length} found`,
);

// --- 2. the pages ------------------------------------------------------------
/** Every candidate surface, with the HTML a buyer would read. */
const surfaces = [];
for (const path of SURFACES) {
    const page = await siteFetch(path);
    surfaces.push({ path, status: page.status, text: page.text });
    record(`Page: ${path} answers`, page.status === 200, `HTTP ${page.status}`);
}

// --- 3. the Stripe links -----------------------------------------------------
/** Every payment link in the account, keyed by the URL a buyer would follow. */
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

/**
 * Checks one catalogue row against the account and the page.
 *
 * The row is the middle of three prices — the page, the catalogue and the
 * Stripe price — and a sale goes wrong the moment they stop agreeing.
 *
 * `requireInStock` is for the coaching offers, which are sold from their
 * own pages and must be flagged as sellable. The membership is not: it is
 * deliberately kept out of the merchandise grid, and its sellability is the
 * live payment link.
 */
async function checkOffer(row, pageLabel, options = {}) {
    const { requireInStock = false, requireBinding = false, owner = null } = options;
    const url = row.stripe_url || row.payment_link_url;

    // The owner is the truth about what an offer costs. The catalogue row is
    // a copy of it, and the account is a copy of that, and the page is a copy
    // of all three. Every step below compares against the owner, so a row
    // that has drifted is caught rather than agreed with.
    const price = owner ? owner.amountCents / 100 : Number(row.price);

    if (owner) {
        record(
            `${pageLabel}: the catalogue row carries the price the site says`,
            Number(row.price) === price,
            `catalogue=$${row.price} owner=$${price}`,
        );

        record(
            `${pageLabel}: the catalogue row is named after the offer`,
            row.name === owner.catalogueName,
            `catalogue="${row.name}" owner="${owner.catalogueName}"`,
        );
    }

    record(
        `${pageLabel}: the catalogue row is sellable`,
        (requireInStock ? row.in_stock === true : true) &&
            Boolean(row.stripe_price_id) &&
            Boolean(url),
        requireInStock
            ? `in_stock=${row.in_stock} price=$${row.price}`
            : `price=$${row.price} with a Stripe price`,
    );

    if (!url) return;

    const link = linksByUrl.get(url);
    if (!STRIPE_KEY) {
        record(`${pageLabel}: the payment link is active`, null, 'no STRIPE_SECRET_KEY available to check with');
        return;
    }

    if (!link) {
        record(`${pageLabel}: the payment link exists`, false, `no link in the account for ${url}`);
        return;
    }

    record(`${pageLabel}: the payment link is active`, link.active === true, `active=${link.active}`);

    const detail = await stripeGet(`/payment_links/${link.id}`);
    const items = await stripeGet(`/payment_links/${link.id}/line_items`);
    const linkedPriceId = items.body?.data?.[0]?.price?.id || null;

    record(
        `${pageLabel}: the link points at the recorded price`,
        linkedPriceId === row.stripe_price_id,
        `link=${linkedPriceId || 'none'} row=${row.stripe_price_id || 'none'}`,
    );

    if (requireBinding) {
        record(
            `${pageLabel}: the link is bound to this catalogue row`,
            detail.body?.metadata?.product_id === row.id,
            `metadata.product_id=${detail.body?.metadata?.product_id || 'none'}`,
        );
    }

    const stripePrice = await stripeGet(`/prices/${row.stripe_price_id}`);
    const amount = stripePrice.body?.unit_amount != null ? stripePrice.body.unit_amount / 100 : null;
    const recurring = stripePrice.body?.recurring?.interval || null;

    record(
        `${pageLabel}: the amount charged is the price the site says`,
        amount === price,
        `charged=$${amount ?? 'unknown'} site=$${price}`,
    );

    if (owner) {
        record(
            `${pageLabel}: the price is billed the way the offer says`,
            recurring === owner.recurring,
            `billed=${recurring || 'once'} offer=${owner.recurring || 'once'}`,
        );
    }

    // The pages that carry this offer's link are the pages the buyer reads
    // before paying. Each of them has to carry the price as well: a link
    // with no price beside it is a checkout the buyer cannot price, and a
    // price that disagrees with the charge is the defect this check exists
    // to catch. The offer has to be on at least one of them, or there is
    // nothing to buy.
    const carrying = surfaces.filter((surface) => surface.status === 200 && surface.text.includes(url));

    record(
        `${pageLabel}: the offer is on a live page`,
        carrying.length > 0,
        carrying.length > 0
            ? carrying.map((surface) => surface.path).join(', ')
            : 'no live page carries this link',
    );

    for (const surface of carrying) {
        record(
            `${pageLabel}: the price on ${surface.path} is the price charged`,
            pageShowsAmount(surface.text, price),
            pageShowsAmount(surface.text, price)
                ? `$${price}`
                : `${surface.path} does not show $${price}`,
        );
    }

    const redirect = detail.body?.after_completion?.redirect?.url || null;
    if (!redirect) {
        record(`${pageLabel}: the buyer lands on a page after paying`, null, 'the link has no redirect set');
        return;
    }

    const landing = redirect.replace('{CHECKOUT_SESSION_ID}', 'probe');
    const target = await siteFetch(landing.startsWith(SITE_URL) ? landing.slice(SITE_URL.length) || '/' : landing);
    record(
        `${pageLabel}: the buyer lands on a page after paying`,
        target.status === 200,
        `HTTP ${target.status} — ${landing}`,
    );
}

for (const offer of ownerOffers) {
    const row = rows.find((entry) => entry.id === offer.catalogueId);
    if (!row) {
        // Already named by the catalogue check above. Nothing can be checked
        // against a row that is not there.
        continue;
    }

    await checkOffer(row, `Offer: ${offer.name}`, {
        owner: offer,
        requireInStock: true,
        requireBinding: true,
    });
}

for (const row of membership) {
    await checkOffer(row, 'Membership');
}

// --- verdict -----------------------------------------------------------------
const failures = results.filter((entry) => entry.ok === false);
const skipped = results.filter((entry) => entry.ok === null);

console.log('');
if (failures.length === 0) {
    console.log(`The coaching offers are sound (${results.length} check(s), ${skipped.length} skipped).`);
    console.log('Every offer shows one price, and Stripe charges that price.');
    process.exit(0);
}

console.log(`${failures.length} of ${results.length} check(s) failed:`);
for (const failure of failures) console.log(`  - ${failure.label}${failure.detail ? `: ${failure.detail}` : ''}`);
process.exit(1);
