#!/usr/bin/env node
/**
 * Creates the Stripe objects behind Tyrone's coaching offers.
 *
 * The catalogue rows for the three coaching services all pointed at the
 * $20/month membership link. A buyer who clicked "Personal Training — $150"
 * would have been charged $20 a month for a subscription they did not ask
 * for. Price and link have to agree with what the row says.
 *
 * Creates one product, one price and one payment link per offering, then
 * writes the resulting ids back onto the catalogue rows so the admin console
 * and the Stripe webhook can match a purchase to a service.
 *
 *   node scripts/stripe_tyrone_offers.mjs            # create and write back
 *   node scripts/stripe_tyrone_offers.mjs --dry-run  # print the plan only
 *
 * Credentials come from `Website/.env.local`. Secrets are never printed.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const dryRun = process.argv.includes('--dry-run');
const cleanupOnly = process.argv.includes('--cleanup-only');

function loadEnvFile(path) {
    const values = {};
    let text;
    try {
        text = readFileSync(path, 'utf8');
    } catch {
        return values;
    }
    for (const line of text.split('\n')) {
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
const STRIPE_KEY = env.STRIPE_SECRET_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const SUCCESS_URL = 'https://secretimperium.com/tyronengouamo/booked/';

/** The three offers, in the order they appear on the page. */
const OFFERS = [
    {
        row: 'a6a2bf38-4462-44b4-ba6a-0b5d32243e05',
        name: 'Personal Training — 1 Hour with Tyrone',
        amount: 15000,
        recurring: null,
        description:
            '60-minute session with Tyrone Ngouamo. Programming, form, accountability. In-person (Utah) or remote via video. Includes session notes and a follow-up check-in.',
    },
    {
        row: '6159b3d4-71b3-466f-82e1-23447689d8a2',
        name: 'Custom Meal Plan — Full Build-Out',
        amount: 29700,
        recurring: null,
        description:
            'Intake call, macro target, meal-by-meal week, grocery list, swap matrix, and follow-up. Built around your goal, schedule, and budget.',
    },
    {
        row: '69ff6f01-06d8-44d1-8537-0e0cf9a2d7cf',
        name: 'Meal Plan Payment Plan — $99 x 3',
        amount: 9900,
        recurring: { interval: 'month' },
        description:
            'Same Custom Meal Plan build-out, paid in three monthly installments. No long-term commitment after month three.',
    },
];

async function stripe(path, params) {
    return stripeRequest('POST', path, params);
}

async function stripeRequest(method, path, params) {
    const body = new URLSearchParams();
    const flatten = (prefix, value) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach((entry, index) => flatten(`${prefix}[${index}]`, entry));
            return;
        }
        if (typeof value === 'object' && value !== null) {
            for (const [key, nested] of Object.entries(value)) {
                flatten(`${prefix}[${key}]`, nested);
            }
            return;
        }
        body.append(prefix, String(value));
    };
    for (const [key, value] of Object.entries(params)) flatten(key, value);

    const response = await fetch(`https://api.stripe.com/v1/${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${STRIPE_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = json.error?.message || `HTTP ${response.status}`;
        throw new Error(`${path}: ${message}`);
    }
    return json;
}

if (!STRIPE_KEY) {
    console.error('STRIPE_SECRET_KEY not set');
    process.exit(3);
}

for (const offer of OFFERS) {
    console.log(`${offer.name} — $${(offer.amount / 100).toFixed(2)}${offer.recurring ? ` per ${offer.recurring.interval}` : ''}`);
}

if (dryRun) {
    console.log('\nDry run: nothing was created and nothing was written back.');
    process.exit(0);
}

const written = [];

// `--cleanup-only` retires superseded links and products without creating
// anything new. The set of links to keep is read from the catalogue rows, so
// it always matches what the site actually points at.
if (cleanupOnly) {
    const rows = await (
        await fetch(
            `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/products?select=name,payment_link_url,stripe_product_id&id=in.(${OFFERS.map((offer) => offer.row).join(',')})`,
            { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
        )
    ).json();
    for (const row of rows || []) {
        written.push({ url: row.payment_link_url, productId: row.stripe_product_id });
    }
} else {
for (const offer of OFFERS) {
    const product = await stripe('products', {
        name: offer.name,
        description: offer.description,
        metadata: { brand: 'imperium', offering: 'tyrone_coaching' },
    });

    const priceParams = {
        product: product.id,
        currency: 'usd',
        unit_amount: offer.amount,
        metadata: { brand: 'imperium', offering: 'tyrone_coaching' },
    };
    if (offer.recurring) priceParams.recurring = { interval: offer.recurring.interval };

    const price = await stripe('prices', priceParams);

    const linkParams = {
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        metadata: { brand: 'imperium', offering: 'tyrone_coaching', product_id: offer.row },
        after_completion: { type: 'redirect', redirect: { url: SUCCESS_URL } },
        custom_text: {
            submit: { message: 'Payment secures your place. Tyrone follows up to schedule your first session.' },
        },
    };
    // A recurring price cannot carry payment_intent_data — Stripe refuses it.
    if (offer.recurring) {
        linkParams.subscription_data = {
            metadata: { brand: 'imperium', offering: 'tyrone_coaching', product_id: offer.row },
        };
    } else {
        linkParams.payment_intent_data = {
            metadata: { brand: 'imperium', offering: 'tyrone_coaching', product_id: offer.row },
        };
    }

    const link = await stripe('payment_links', linkParams);

    console.log(`  product ${product.id}`);
    console.log(`  price   ${price.id}`);
    console.log(`  link    ${link.url}`);
    written.push({ offer, productId: product.id, priceId: price.id, url: link.url });
}
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\nSupabase credentials are not available — the catalogue rows were not updated.');
    process.exit(3);
}

// The catalogue rows carry a `needs_real_stripe_link` flag from before the
// offers had links of their own. It has been false since this script first
// ran, and a marker that does not mean what it says is worse than no
// marker — so the write-back clears it, and keeps whatever else the row
// keeps in its metadata.
const existingRows = await (
    await fetch(
        `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/products?select=id,metadata&id=in.(${OFFERS.map((offer) => offer.row).join(',')})`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    )
).json();
const metadataByRow = new Map((existingRows || []).map((row) => [row.id, row.metadata || {}]));

for (const entry of written) {
    if (!entry.offer) continue;
    const response = await fetch(
        `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/products?id=eq.${entry.offer.row}`,
        {
            method: 'PATCH',
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({
                stripe_product_id: entry.productId,
                stripe_price_id: entry.priceId,
                stripe_url: entry.url,
                payment_link_url: entry.url,
                metadata: {
                    ...(metadataByRow.get(entry.offer.row) || {}),
                    needs_real_stripe_link: false,
                },
            }),
        },
    );
    if (!response.ok) {
        const text = await response.text();
        console.error(`  catalogue row ${entry.offer.row} not updated: HTTP ${response.status} ${text}`);
        process.exit(1);
    }
    console.log(`  catalogue row ${entry.offer.row} updated`);
}

console.log('\nDone. The coaching offers now carry their own prices and links.');

// --- retire superseded objects -------------------------------------------------
// An earlier run may have created links or products that the catalogue does not
// point at. They stay visible in the Stripe dashboard unless they are switched
// off, so a buyer could still open a stale link.
const keptLinks = new Set(written.map((entry) => entry.url));
const keptProducts = new Set(written.map((entry) => entry.productId));

const allLinks = await (
    await fetch('https://api.stripe.com/v1/payment_links?limit=100', {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
    })
).json();

for (const link of allLinks.data || []) {
    if (link.metadata?.offering !== 'tyrone_coaching') continue;
    if (keptLinks.has(link.url)) continue;
    await stripeRequest('POST', `payment_links/${link.id}`, { active: false });
    console.log(`retired superseded link ${link.id}`);
}

const allProducts = await (
    await fetch('https://api.stripe.com/v1/products?limit=100', {
        headers: { Authorization: `Bearer ${STRIPE_KEY}` },
    })
).json();

for (const product of allProducts.data || []) {
    if (product.metadata?.offering !== 'tyrone_coaching') continue;
    if (keptProducts.has(product.id)) continue;
    await stripeRequest('POST', `products/${product.id}`, { active: false });
    console.log(`retired superseded product ${product.id}`);
}

