#!/usr/bin/env node
/**
 * Creates the Stripe objects behind Tyrone's coaching offers.
 *
 * The catalogue rows for the three coaching services all pointed at the
 * $20/month membership link. A buyer who clicked "Personal Training — $150"
 * would have been charged $20 a month for a subscription they had not asked
 * for. Price and link have to agree with what the row says.
 *
 * The offers themselves live in `Website/src/lib/coaching-offers.ts`, which
 * is the one place their prices are written down. This script used to keep
 * its own copy of them, which meant the amount that reached Stripe and the
 * amount the page showed were two answers to one question. It reads the
 * owner now, so a price changed in one place reaches the account.
 *
 * It is idempotent. A link that is live, charges the owner's amount and is
 * bound to its catalogue row is left exactly as it is; a row that does not
 * meet that bar is repaired. Running it on a healthy account changes
 * nothing — which matters, because a script that mints a fresh link on every
 * run leaves the site's own link behind and the page selling a checkout
 * Stripe has retired.
 *
 *   node scripts/stripe_tyrone_offers.mjs            # create and write back
 *   node scripts/stripe_tyrone_offers.mjs --dry-run  # print the plan only
 *   node scripts/stripe_tyrone_offers.mjs --cleanup-only
 *
 * Credentials come from `Website/.env.local`. Secrets are never printed.
 *
 * Node 22.6 or newer: the owner is a TypeScript module and is imported
 * directly, so Node has to be able to strip the types.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { COACHING_OFFERS } from '../Website/src/lib/coaching-offers.ts';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const dryRun = process.argv.includes('--dry-run');
const cleanupOnly = process.argv.includes('--cleanup-only');

/** The file the offers are owned by. Its links are kept in step with the account. */
const OWNER_FILE = join(repoRoot, 'Website', 'src', 'lib', 'coaching-offers.ts');

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

/** The offers, in the shape this script needs them. */
const OFFERS = COACHING_OFFERS.map((offer) => ({
    id: offer.id,
    row: offer.catalogueId,
    name: offer.catalogueName,
    amount: offer.amountCents,
    recurring: offer.recurring,
    description: offer.description,
    checkoutUrl: offer.checkoutUrl,
}));

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
        body: method === 'GET' ? undefined : body,
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
    console.log(
        `${offer.name} — $${(offer.amount / 100).toFixed(2)}${offer.recurring ? ` per ${offer.recurring}` : ''}`,
    );
}

if (dryRun) {
    console.log('\nDry run: nothing was created and nothing was written back.');
    process.exit(0);
}

const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
const base = SUPABASE_URL.replace(/\/+$/, '');

// The catalogue rows the offers are sold from.
const catalogueRows = await (
    await fetch(
        `${base}/rest/v1/products?select=id,name,price,stripe_price_id,stripe_product_id,stripe_url,payment_link_url,metadata&id=in.(${OFFERS.map((offer) => offer.row).join(',')})`,
        { headers },
    )
).json();
const rowById = new Map((catalogueRows || []).map((row) => [row.id, row]));

const links = (await stripeRequest('GET', 'payment_links?limit=100')).data || [];
const linkByUrl = new Map(links.map((link) => [link.url, link]));

/** What a payment link charges, and what it is bound to. */
async function inspectLink(link) {
    const items = await stripeRequest('GET', `payment_links/${link.id}/line_items`);
    const priceId = items.data?.[0]?.price?.id || null;
    if (!priceId) return { priceId: null, productId: null, amount: null, productActive: false, recurring: null };

    const price = await stripeRequest('GET', `prices/${priceId}`);
    const product = price.product
        ? await stripeRequest('GET', `products/${price.product}`).catch(() => null)
        : null;

    return {
        priceId,
        productId: price.product || null,
        // Money is compared in cents. `79.99 * 100` is 7998.999999999999 in
        // binary floating point, so two equal prices said they differed.
        amount: price.unit_amount != null ? price.unit_amount : null,
        productActive: product ? product.active !== false : false,
        recurring: price.recurring?.interval || null,
    };
}

/**
 * Is this link the one this offer should be sold through?
 *
 * It has to be live, it has to charge the owner's amount, it has to be bound
 * to its catalogue row, and it has to be the link the owner names — a link
 * the account is happy with but the site does not point at is a checkout
 * nobody can reach.
 */
async function linkIsSound(link, offer) {
    if (!link || link.active !== true) return false;
    if (link.metadata?.product_id !== offer.row) return false;

    const detail = await inspectLink(link);
    if (detail.amount !== offer.amount) return false;
    if (detail.recurring !== offer.recurring) return false;
    if (!detail.productActive) return false;

    return true;
}

const written = [];
const keptLinks = new Set();
const keptProducts = new Set();

if (cleanupOnly) {
    // Retire what the catalogue does not point at, without creating anything.
    for (const offer of OFFERS) {
        const row = rowById.get(offer.row);
        const url = row?.stripe_url || row?.payment_link_url;
        const link = url ? linkByUrl.get(url) : null;
        if (!link) continue;
        keptLinks.add(link.url);
        const detail = await inspectLink(link);
        if (detail.productId) keptProducts.add(detail.productId);
    }
} else {
    for (const offer of OFFERS) {
        const row = rowById.get(offer.row);
        if (!row) {
            console.error(
                `The catalogue row ${offer.row} is missing — ${offer.name} has nothing to sell from.`,
            );
            process.exit(1);
        }

        const ownerLink = linkByUrl.get(offer.checkoutUrl);
        const rowLink = linkByUrl.get(row.stripe_url || row.payment_link_url || '');

        if (await linkIsSound(ownerLink, offer)) {
            const detail = await inspectLink(ownerLink);
            console.log(`keep    ${offer.name} — $${(offer.amount / 100).toFixed(2)}`);
            keptLinks.add(ownerLink.url);
            if (detail.productId) keptProducts.add(detail.productId);
            written.push({ offer, productId: detail.productId, priceId: detail.priceId, url: ownerLink.url });
            continue;
        }

        const detail = rowLink ? await inspectLink(rowLink) : null;
        console.log(
            `repair  ${offer.name} — $${(offer.amount / 100).toFixed(2)}` +
                (detail && detail.amount != null
                    ? ` (the current link charges $${(detail.amount / 100).toFixed(2)})`
                    : ''),
        );

        const product = await stripe('products', {
            name: offer.name,
            description: offer.description,
            metadata: { brand: 'imperium', offering: 'tyrone_coaching', product_id: offer.row },
        });

        const priceParams = {
            product: product.id,
            currency: 'usd',
            unit_amount: offer.amount,
            metadata: { brand: 'imperium', offering: 'tyrone_coaching', product_id: offer.row },
        };
        if (offer.recurring) priceParams.recurring = { interval: offer.recurring };

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
                submit: {
                    message:
                        'Payment secures your place. Tyrone follows up to schedule your first session.',
                },
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
        keptLinks.add(link.url);
        keptProducts.add(product.id);
        written.push({ offer, productId: product.id, priceId: price.id, url: link.url });
    }
}

if (!cleanupOnly) {
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
            `${base}/rest/v1/products?select=id,metadata&id=in.(${OFFERS.map((offer) => offer.row).join(',')})`,
            { headers },
        )
    ).json();
    const metadataByRow = new Map((existingRows || []).map((row) => [row.id, row.metadata || {}]));

    for (const entry of written) {
        const { offer } = entry;
        const response = await fetch(`${base}/rest/v1/products?id=eq.${offer.row}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({
                name: offer.name,
                price: offer.amount / 100,
                stripe_product_id: entry.productId,
                stripe_price_id: entry.priceId,
                stripe_url: entry.url,
                payment_link_url: entry.url,
                metadata: {
                    ...(metadataByRow.get(offer.row) || {}),
                    needs_real_stripe_link: false,
                },
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            console.error(`  catalogue row ${offer.row} not updated: HTTP ${response.status} ${text}`);
            process.exit(1);
        }
        console.log(`  catalogue row ${offer.row} updated`);
    }

    // The owner names the link the site sells through. When a link had to be
    // minted, the owner has to name the new one, or the page keeps pointing
    // at a link Stripe has retired.
    let owner = readFileSync(OWNER_FILE, 'utf8');
    let changed = false;

    for (const entry of written) {
        if (entry.offer.checkoutUrl === entry.url) continue;

        const marker = `catalogueId: "${entry.offer.row}"`;
        const at = owner.indexOf(marker);
        if (at < 0) {
            console.error(
                `  the owner does not name the row ${entry.offer.row} — the new link was not written into it.`,
            );
            process.exit(1);
        }

        const blockEnd = owner.indexOf('\n});', at);
        const block = owner.slice(at, blockEnd);
        const updated = block.replace(/checkoutUrl: "[^"]*"/, `checkoutUrl: "${entry.url}"`);
        if (updated === block) {
            console.error(
                `  the owner does not carry a checkout link for ${entry.offer.name} — the new link was not written into it.`,
            );
            process.exit(1);
        }

        owner = owner.slice(0, at) + updated + owner.slice(blockEnd);
        changed = true;
        console.log(`  the owner's link for ${entry.offer.name} was updated`);
    }

    if (changed) writeFileSync(OWNER_FILE, owner);

    console.log('\nDone. The coaching offers now carry their own prices and links.');
}

// --- retire superseded objects -------------------------------------------------
// An earlier run may have created links or products that the catalogue does not
// point at. They stay visible in the Stripe dashboard unless they are switched
// off, so a buyer could still open a stale link.
{
    const allLinks = await stripeRequest('GET', 'payment_links?limit=100');

    for (const link of allLinks.data || []) {
        if (link.metadata?.offering !== 'tyrone_coaching') continue;
        if (keptLinks.has(link.url)) continue;
        await stripeRequest('POST', `payment_links/${link.id}`, { active: false });
        console.log(`retired superseded link ${link.id}`);
    }

    const allProducts = await stripeRequest('GET', 'products?limit=100');

    for (const product of allProducts.data || []) {
        if (product.metadata?.offering !== 'tyrone_coaching') continue;
        if (keptProducts.has(product.id)) continue;
        await stripeRequest('POST', `products/${product.id}`, { active: false });
        console.log(`retired superseded product ${product.id}`);
    }
}
