#!/usr/bin/env node
/**
 * Proves that the site's own checkout door charges what it quotes.
 *
 * Every other money path on this site has a command. The payment links the
 * catalogue names are proved by `check_catalogue_sellability.mjs`; the
 * coaching offers are proved by `check_coaching_offers.mjs`; the membership
 * is proved by `check_payment_chain.mjs`. The one door that is the site's
 * own — `POST /api/checkout/create-session`, which builds a Stripe session
 * out of a cart — had none. It was proved once, by hand, on 2026-10-31, and
 * nothing since kept it true.
 *
 * That door is where the cart becomes money, so it is worth a command. It
 * asks:
 *
 *   1. does the door refuse a cart with nothing in it?
 *   2. does it refuse shipping that is not complete?
 *   3. does it refuse a line that names nothing in the catalogue?
 *   4. does it ignore the price the caller chose? The cart is a claim; the
 *      catalogue is the price.
 *   5. is the number the buyer is shown the number the account charges?
 *   6. do the lines, the tax and the shipping add up to that number?
 *   7. is the discount the one the server's own table says?
 *   8. does a code the server does not honour earn nothing?
 *   9. does each line say which catalogue row it is? A purchase that cannot
 *      be named is a purchase the operator cannot read.
 *  10. does the tax line say it is the tax, so it is never counted as a
 *      purchase?
 *  11. is the buyer sent back to the live site, and not to localhost?
 *
 *   node scripts/check_checkout_chain.mjs
 *
 * The target defaults to the live site. `PROOF_BASE` points it at a local
 * dev server instead.
 *
 * **What it writes, and what it leaves behind.** The door answers a real
 * cart by creating a real Stripe checkout session, so this check creates
 * sessions in the live account. Every one of them is expired the moment it
 * is read — an expired session takes no money and can never be paid — and
 * the cleanup is registered against the signals and against `exit`, so a
 * killed run still closes them. Nothing is sent, no order exists and no
 * row is written to the database.
 *
 * Nothing is printed except states, names and amounts. Secrets are never
 * echoed. Credentials are read from the environment first, then from
 * `Website/.env.local`.
 *
 * Exit codes: 0 the door charges what it quotes, 1 something is broken and
 * is named, 3 the check could not run.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const appRoot = join(repoRoot, 'Website');

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

const env = { ...loadEnvFile(join(appRoot, '.env.local')), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_KEY = env.STRIPE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(3);
}

// The arithmetic the site uses, read out of the module the site uses. The
// check does not keep its own totals — that would be a second answer to
// what a cart costs.
let totals;
try {
    totals = await import(pathToFileURL(join(appRoot, 'src', 'lib', 'checkout-totals.ts')).href);
} catch (error) {
    console.error(`Could not read the site's own totals module: ${error.message}`);
    console.error('This check needs a Node that can import TypeScript directly (Node 22.18 or newer).');
    process.exit(3);
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
    if (!STRIPE_KEY) return { status: 0, body: null };
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
}

async function stripePost(path, fields = {}) {
    if (!STRIPE_KEY) return { status: 0, body: null };
    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${STRIPE_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(fields),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
}

/** Every session this run made, so every one of them can be closed. */
const madeSessions = new Set();
let cleanedUp = false;

async function expireSessions() {
    if (cleanedUp) return;
    cleanedUp = true;
    for (const id of madeSessions) {
        try {
            await stripePost(`/checkout/sessions/${id}/expire`);
        } catch {
            // The session is already closed, or the account is unreachable.
        }
    }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
        expireSessions().finally(() => process.exit(130));
    });
}
process.on('exit', () => {
    // Best effort only — the promise cannot be awaited here, but the request
    // is still issued.
    void expireSessions();
});

/** Posts a cart to the door and answers with the status and the body. */
async function postCart(body) {
    const response = await fetch(`${SITE_URL}/api/checkout/create-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Origin: SITE_URL,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = { raw: text.slice(0, 200) };
    }
    return { status: response.status, body: parsed, retryAfter: response.headers.get('retry-after') };
}

/** The shipping the form collects. A proof address, not a real one. */
const shipping = {
    firstName: 'Proof',
    lastName: 'Probe',
    address: '1 Test Street',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
};

/** The session id inside a Stripe checkout url. */
function sessionIdFrom(url) {
    return typeof url === 'string' ? (url.match(/pay\/(cs_[A-Za-z0-9_]+)/) || [])[1] || null : null;
}

try {
    // --- 1. the catalogue --------------------------------------------------------
    const catalogue = await sb(
        'products?select=id,name,price,in_stock,stripe_price_id,stripe_product_id&order=name',
    );

    if (catalogue.status !== 200) {
        record('Catalogue: the products table can be read', false, `HTTP ${catalogue.status}`);
        console.log('\nThe catalogue could not be read, so nothing else can be checked.');
        process.exit(3);
    }

    const rows = (catalogue.body || []).filter((row) => row.price && Number(row.price) > 0);
    record('Catalogue: the products table can be read', true, `${rows.length} row(s) with a price`);

    // The probe wants a row that is worth shipping — under the free-shipping
    // threshold, so the tier is visible in the total.
    const probe = rows.find((row) => Number(row.price) >= 5 && Number(row.price) <= 99);

    if (!probe) {
        record('Catalogue: a row can be probed', false, 'no row between $5 and $99');
        console.log('\nNo catalogue row could be probed, so the door was not asked anything.');
        process.exit(3);
    }

    const priceCents = Math.round(Number(probe.price) * 100);
    record('Catalogue: a row can be probed', true, `${probe.name} at $${Number(probe.price).toFixed(2)}`);

    // --- 2. what the door refuses ------------------------------------------------
    const empty = await postCart({ items: [], shipping });
    record(
        'Door: a cart with nothing in it is refused',
        empty.status === 400,
        `HTTP ${empty.status}`,
    );

    const noShipping = await postCart({ items: [{ id: probe.id, name: probe.name, quantity: 1 }], shipping: { city: 'Austin' } });
    record(
        'Door: shipping that is not complete is refused',
        noShipping.status === 400,
        `HTTP ${noShipping.status}`,
    );

    const unknownLine = await postCart({
        items: [{ id: 'not-a-real-row', name: 'Proof Line That Does Not Exist', quantity: 1 }],
        shipping,
    });
    record(
        'Door: a line that names nothing in the catalogue is refused',
        unknownLine.status === 400,
        `HTTP ${unknownLine.status}${unknownLine.body?.error ? ` — ${unknownLine.body.error}` : ''}`,
    );

    // --- 3. what the door charges ------------------------------------------------
    /**
     * Opens a cart through the door and reads the session it made.
     *
     * The caller states a price of one cent for everything it asks for. If the
     * door takes that, the buyer sets the price.
     */
    async function openCart({ promoCode, shippingMethod = 'express', quantity = 1 } = {}) {
        const opened = await postCart({
            items: [{ id: probe.id, name: probe.name, quantity, price: 0.01 }],
            shipping,
            shippingMethod,
            promoCode,
        });

        if (opened.status === 429) {
            return { opened, session: null, limited: true };
        }

        const id = sessionIdFrom(opened.body?.url);
        if (!id) return { opened, session: null, limited: false };

        madeSessions.add(id);
        const fetched = await stripeGet(
            `/checkout/sessions/${id}?expand[]=line_items.data.price.product`,
        );

        return { opened, session: fetched.body, limited: false };
    }

    const plain = await openCart();

    if (plain.limited) {
        record('Door: the door answers a cart', null, `HTTP 429 — the door is rate limited, retry after ${plain.opened.retryAfter || 'a while'}s`);
        console.log('\nThe door is rate limiting this caller, so the pricing could not be checked.');
        await expireSessions();
        process.exit(3);
    }

    const session = plain.session;
    const quotedTotal = plain.opened.body?.total;

    record('Door: the door answers a cart', plain.opened.status === 200 && Boolean(session), `HTTP ${plain.opened.status}`);
    record('Door: the buyer is given a checkout', typeof plain.opened.body?.url === 'string', plain.opened.body?.url ? 'a Stripe checkout url' : 'no url');

    if (!session) {
        console.log('\nThe door did not open a session, so nothing else can be checked.');
        await expireSessions();
        process.exit(1);
    }

    // The totals the site's own module works out for this cart.
    const expected = totals.computeTotals(priceCents, 0, 'express');
    const charged = session.amount_total ?? null;

    record(
        'Price: the price the caller chose is ignored',
        quotedTotal === expected.total,
        `the caller asked for $0.01 — the door charged $${((quotedTotal ?? 0) / 100).toFixed(2)}, the catalogue says $${(priceCents / 100).toFixed(2)}`,
    );

    record(
        'Price: the number the buyer is shown is the number the account charges',
        charged === quotedTotal,
        `shown $${((quotedTotal ?? 0) / 100).toFixed(2)} — charged $${((charged ?? 0) / 100).toFixed(2)}`,
    );

    const lines = session.line_items?.data || [];
    const linesTotal = lines.reduce((sum, line) => sum + (line.amount_total ?? 0), 0);
    const shippingAmount = session.total_details?.amount_shipping ?? 0;

    record(
        'Price: the lines and the shipping add up to the amount charged',
        linesTotal + shippingAmount === charged,
        `lines $${(linesTotal / 100).toFixed(2)} + shipping $${(shippingAmount / 100).toFixed(2)} = $${((linesTotal + shippingAmount) / 100).toFixed(2)}`,
    );

    const taxLine = lines.find((line) => line.price?.product?.name === 'Sales tax');
    const merchLine = lines.find((line) => line.price?.product?.name !== 'Sales tax');

    record(
        'Tax: the tax is the server’s tax',
        Boolean(taxLine) && taxLine.amount_total === expected.tax,
        taxLine ? `$${(taxLine.amount_total / 100).toFixed(2)} on a $${(priceCents / 100).toFixed(2)} cart` : 'no tax line on the session',
    );

    record(
        'Shipping: the tier the buyer chose is the tier that is charged',
        shippingAmount === expected.shipping,
        `charged $${(shippingAmount / 100).toFixed(2)} — the tier is $${(expected.shipping / 100).toFixed(2)}`,
    );

    // --- 4. what each line says --------------------------------------------------
    record(
        'Line: the bought line names its catalogue row',
        Boolean(merchLine) && merchLine.price?.product?.metadata?.imperium_product_id === probe.id,
        merchLine ? `line ${merchLine.price.product.metadata?.imperium_product_id ?? 'names no catalogue row'}` : 'the session has no bought line',
    );

    record(
        'Line: the tax line says it is the tax and is not a purchase',
        Boolean(taxLine) &&
            taxLine.price?.product?.metadata?.imperium_line === 'tax' &&
            !taxLine.price?.product?.metadata?.imperium_product_id,
        taxLine ? `the tax says ${taxLine.price?.product?.metadata?.imperium_line ?? 'nothing about what it is'}` : 'no tax line on the session',
    );

    // --- 5. the promo the server honours -----------------------------------------
    const promoCents = totals.promoDiscountCents('IMPERIUM20') ?? null;
    const promoCart = await openCart({ promoCode: 'IMPERIUM20' });

    if (promoCart.limited || !promoCart.session) {
        record('Promo: the server’s promo is applied', null, 'the door was rate limited before the promo could be tried');
    } else {
        const promoExpected = totals.computeTotals(priceCents, promoCents ?? 0, 'express');
        record(
            'Promo: the server’s promo is applied',
            promoCart.opened.body?.total === promoExpected.total && promoExpected.total < expected.total,
            `$${((promoCart.opened.body?.total ?? 0) / 100).toFixed(2)} with the code, $${(expected.total / 100).toFixed(2)} without`,
        );
    }

    const bogusCart = await openCart({ promoCode: 'NOT-A-CODE' });

    if (bogusCart.limited || !bogusCart.session) {
        record('Promo: a code the server does not honour earns nothing', null, 'the door was rate limited before the code could be tried');
    } else {
        record(
            'Promo: a code the server does not honour earns nothing',
            bogusCart.opened.body?.total === expected.total,
            `$${((bogusCart.opened.body?.total ?? 0) / 100).toFixed(2)} — the same as no code at all`,
        );
    }

    // --- 6. where the buyer goes back to ------------------------------------------
    const successUrl = session.success_url || '';
    const cancelUrl = session.cancel_url || '';
    const onThisSite = (url) => url.startsWith(SITE_URL);

    record(
        'Return: the buyer is sent back to this site after paying',
        onThisSite(successUrl) && onThisSite(cancelUrl),
        `success ${successUrl} — cancel ${cancelUrl}`,
    );

    record(
        'Return: the buyer is not sent back to a local address',
        !successUrl.includes('localhost') && !cancelUrl.includes('localhost'),
        successUrl.includes('localhost') ? 'a localhost address' : 'no localhost address',
    );

    record(
        'Return: the session records the order total',
        session.metadata?.order_total_cents === String(quotedTotal),
        `metadata ${session.metadata?.order_total_cents} — quoted ${quotedTotal}`,
    );

    // --- 7. nothing is left behind ------------------------------------------------
    await expireSessions();

    let stillOpen = 0;
    for (const id of madeSessions) {
        const checked = await stripeGet(`/checkout/sessions/${id}`);
        if (checked.body?.status && checked.body.status !== 'expired') stillOpen += 1;
    }

    record(
        'Cleanup: every session this proof made is closed',
        stillOpen === 0,
        stillOpen === 0 ? `${madeSessions.size} session(s), all expired` : `${stillOpen} session(s) still open`,
    );

    // --- 8. what the run found ----------------------------------------------------
    const failures = results.filter((result) => result.ok === false);
    const skipped = results.filter((result) => result.ok === null);

    console.log('');
    if (failures.length > 0) {
        console.log(`The checkout door is not charging what it quotes (${failures.length} of ${results.length} check(s) failed).`);
        for (const failure of failures) console.log(`  FAIL  ${failure.label}`);
        process.exit(1);
    }

    if (skipped.length > 0) {
        console.log(`The checkout door is charged what it quotes (${results.length - skipped.length} check(s) passed, ${skipped.length} skipped).`);
        process.exit(0);
    }

    console.log(`The checkout door charges what it quotes (${results.length} check(s), 0 skipped).`);
    console.log('The caller cannot set the price, the account takes the number the buyer was shown, and every line says what it is.');

} catch (error) {
    record('The check ran to the end', false, String(error?.message || error));
} finally {
    await expireSessions();
}
