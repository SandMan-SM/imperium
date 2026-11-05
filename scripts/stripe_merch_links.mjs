#!/usr/bin/env node
/**
 * Gives every merchandise row a live Stripe link that charges the catalogue
 * price.
 *
 * The catalogue is the one place a merchandise price is written down, and
 * `sync-products` builds the Stripe price *from* the catalogue row. Six rows
 * had drifted away from that:
 *
 *   - three named a payment link that had been retired, so the checkout a
 *     buyer would open refuses to take money;
 *   - three named a live link whose price was not the catalogue price — the
 *     account charged $44 for a tee the catalogue says is $29.99.
 *
 * The storefront is closed, so no buyer has met either defect. That is
 * exactly why nothing kept them fixed, and exactly why reopening the shop
 * with them in place would sell dead checkouts at the wrong price.
 *
 * The direction of truth is the catalogue: it is what the page shows, what
 * the site's own checkout charges, and what the sync builds the Stripe price
 * from. So this script makes the account agree with the catalogue — it does
 * not change what anything costs.
 *
 *   node scripts/stripe_merch_links.mjs            # repair and write back
 *   node scripts/stripe_merch_links.mjs --dry-run  # print the plan only
 *
 * It is idempotent: a row whose link is live and charges the catalogue price
 * is left exactly as it is. Credentials come from `Website/.env.local`;
 * secrets are never printed.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const dryRun = process.argv.includes('--dry-run');

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

/** The merchandising brand. The coaching rows and the membership are not merchandise. */
const MERCH_BRAND = 'imperium';
const OFFERING = 'imperium_merch';

/**
 * Where a buyer lands after paying.
 *
 * The storefront is closed and the merch has no receipt page of its own, so
 * the link lands on the live surface of the site. A link that sends a paying
 * buyer to a 404 is a failed sale at the last step.
 */
const SUCCESS_URL = 'https://secretimperium.com/archive/';

/** The live site, used to turn a relative catalogue image into a Stripe image. */
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://secretimperium.com').replace(/\/+$/, '');

if (!STRIPE_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('STRIPE_SECRET_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(3);
}

async function stripeRequest(method, path, params = {}) {
    const body = new URLSearchParams();
    const flatten = (prefix, value) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach((entry, index) => flatten(`${prefix}[${index}]`, entry));
            return;
        }
        if (typeof value === 'object') {
            for (const [key, nested] of Object.entries(value)) flatten(`${prefix}[${key}]`, nested);
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
        // A GET carries its parameters in the path; a body on a GET is refused.
        body: method === 'GET' ? undefined : body,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = json.error?.message || `HTTP ${response.status}`;
        throw new Error(`${path}: ${message}`);
    }
    return json;
}

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
const base = SUPABASE_URL.replace(/\/+$/, '');

const rows = await (
    await fetch(
        `${base}/rest/v1/products?select=id,name,description,image_url,price,in_stock,brand,stripe_price_id,stripe_product_id,stripe_url,payment_link_url,metadata&brand=eq.${MERCH_BRAND}`,
        { headers },
    )
).json();

const merch = (rows || []).filter((row) => row.metadata?.kind !== 'membership');
if (!merch.length) {
    console.log('No merchandise rows to repair.');
    process.exit(0);
}

const links = (await stripeRequest('GET', 'payment_links?limit=100')).data || [];
const linkByUrl = new Map(links.map((link) => [link.url, link]));

/** The Stripe price a payment link charges, read from its line items. */
async function priceOfLink(link) {
    const items = await stripeRequest('GET', `payment_links/${link.id}/line_items`);
    const priceId = items.data?.[0]?.price?.id || null;
    if (!priceId) return { priceId: null, amount: null };
    const price = await stripeRequest('GET', `prices/${priceId}`);
    return { priceId, amount: price.unit_amount != null ? price.unit_amount / 100 : null };
}

const plan = [];

for (const row of merch) {
    const amount = Math.round(Number(row.price) * 100);
    const url = row.stripe_url || row.payment_link_url;
    const link = url ? linkByUrl.get(url) : null;

    if (link) {
        const charged = await priceOfLink(link);
        // Money is compared in cents. `79.99 * 100` is 7998.999999999999 in
        // binary floating point, so comparing dollars says two equal prices
        // differ.
        if (link.active && Math.round(charged.amount * 100) === amount) {
            plan.push({ row, action: 'keep', link, priceId: charged.priceId });
            continue;
        }
        plan.push({ row, action: 'replace', link, charged });
    } else {
        plan.push({ row, action: 'replace', link: null });
    }
}

for (const entry of plan) {
    const { row } = entry;
    const amount = Math.round(Number(row.price) * 100);
    console.log(`${entry.action === 'keep' ? 'keep   ' : 'repair '} ${row.name} — $${row.price}${entry.charged ? ` (link charges $${entry.charged.amount})` : ''}`);
}

if (dryRun) {
    console.log('\nDry run: nothing was created and nothing was written back.');
    process.exit(0);
}

const keptUrls = new Set();

for (const entry of plan) {
    const { row } = entry;
    const amount = Math.round(Number(row.price) * 100);

    if (entry.action === 'keep') {
        keptUrls.add(entry.link.url);
        continue;
    }

    // --- the price ------------------------------------------------------------
    // The price has to sit on a product the account will sell. A price whose
    // product was retired cannot be put in a link at all — Stripe refuses —
    // so an inactive product means a fresh product and a fresh price.
    let priceId = null;
    if (row.stripe_price_id) {
        try {
            const price = await stripeRequest('GET', `prices/${row.stripe_price_id}`);
            if (price.unit_amount === amount) {
                const product = await stripeRequest('GET', `products/${price.product}`);
                if (product.active) priceId = price.id;
            }
        } catch {
            priceId = null;
        }
    }

    if (!priceId) {
        // The catalogue price is the truth; the account has to be brought to it.
        let productId = row.stripe_product_id;
        if (productId) {
            try {
                const product = await stripeRequest('GET', `products/${productId}`);
                if (!product.active) productId = null;
            } catch {
                productId = null;
            }
        }

        if (!productId) {
            const product = await stripeRequest('POST', 'products', {
                name: row.name,
                description: row.description || '',
                images: row.image_url ? [`${SITE_URL}${row.image_url}`] : [],
                metadata: { brand: MERCH_BRAND, offering: OFFERING, product_id: row.id },
            });
            productId = product.id;
            console.log(`  product ${productId}`);
        }

        const price = await stripeRequest('POST', 'prices', {
            product: productId,
            currency: 'usd',
            unit_amount: amount,
            metadata: { brand: MERCH_BRAND, offering: OFFERING, product_id: row.id },
        });
        priceId = price.id;
        row.stripe_product_id = productId;
        console.log(`  price   ${priceId} at $${(amount / 100).toFixed(2)}`);
    }

    // --- the link -------------------------------------------------------------
    const link = await stripeRequest('POST', 'payment_links', {
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { brand: MERCH_BRAND, offering: OFFERING, product_id: row.id },
        payment_intent_data: { metadata: { brand: MERCH_BRAND, offering: OFFERING, product_id: row.id } },
        after_completion: { type: 'redirect', redirect: { url: SUCCESS_URL } },
    });
    keptUrls.add(link.url);
    console.log(`  link    ${link.url}`);

    // --- write back -----------------------------------------------------------
    const response = await fetch(`${base}/rest/v1/products?id=eq.${row.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
            stripe_product_id: row.stripe_product_id,
            stripe_price_id: priceId,
            stripe_url: link.url,
            payment_link_url: link.url,
        }),
    });
    if (!response.ok) {
        console.error(`  catalogue row ${row.id} not updated: HTTP ${response.status} ${await response.text()}`);
        process.exit(1);
    }
    console.log(`  catalogue row ${row.id} updated`);

    // --- retire what this replaces --------------------------------------------
    // A superseded link must be retired, or a buyer with the old URL still
    // reaches a checkout for a product that has been repriced.
    if (entry.link && entry.link.active && entry.link.url !== link.url) {
        await stripeRequest('POST', `payment_links/${entry.link.id}`, { active: false });
        console.log(`  retired superseded link ${entry.link.id}`);
    }
}

// Retire any other live link that still points at a merchandise row we have
// just repriced, so a stale URL cannot outlive the price it was sold at.
for (const link of links) {
    if (!link.active) continue;
    if (keptUrls.has(link.url)) continue;
    const productId = link.metadata?.product_id || link.metadata?.productId;
    if (!productId) continue;
    if (!merch.some((row) => row.id === productId)) continue;
    await stripeRequest('POST', `payment_links/${link.id}`, { active: false });
    console.log(`retired superseded link ${link.id}`);
}

console.log('\nDone. Every merchandise row now names a live link that charges the catalogue price.');
