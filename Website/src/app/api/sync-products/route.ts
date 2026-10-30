export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { getStripe } from "@/lib/stripe-helper";
import { isAdminRequest } from "@/lib/server/admin-auth";

// Use the runtime-friendly admin client from lib/supabase which supports multiple env var names
import { supabaseAdmin as _supabaseAdmin } from '@/lib/supabase';

const supabaseAdmin = _supabaseAdmin;

/**
 * Shape of the product payloads accepted by this endpoint. Only columns that
 * actually exist on the `products` table are modelled here.
 */
interface IncomingProduct {
    id: string;
    name: string;
    description?: string | null;
    price: number | string;
    image_url?: string | null;
    stripe_product_id?: string | null;
    stripe_price_id?: string | null;
    stripe_url?: string | null;
    payment_link_url?: string | null;
    payment_link_id?: string | null;
}

/** Per-product outcome returned to the client. */
interface SyncResult {
    id: string;
    name: string;
    success: boolean;
    skipped?: boolean;
    error?: StripeErrorDetail | string;
    stripe_url?: string | null;
    payment_link_url?: string | null;
    payment_link_id?: string;
    stripe_product_id?: string;
    stripe_price_id?: string;
    image_sent_to_stripe?: string | null;
    stripe_product_images?: string[] | null;
}

/** Error detail echoed back to the client for debugging. */
interface StripeErrorDetail {
    message: string;
    type?: unknown;
    code?: unknown;
    statusCode?: unknown;
    raw?: unknown;
}

/** Narrows an unknown thrown value to a plain object so its fields can be read. */
function asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

/** Reads a `message` property off an unknown error value, mirroring `error?.message`. */
function errorMessage(error: unknown): string | undefined {
    const message = asRecord(error)?.message;
    return typeof message === "string" ? message : undefined;
}

export async function POST(req: NextRequest) {
    try {
        // This route creates live Stripe products, prices and payment links and
        // writes to `products` with the service-role key. The dashboard is
        // gated in the browser, which is a client-side gate: this handler was
        // reachable by anyone who knew the URL, so a stranger could mint
        // payment links in the live account and write rows to the catalogue.
        if (!(await isAdminRequest(req))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { products } = (await req.json()) as { products?: unknown };

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ error: "Invalid products array" }, { status: 400 });
        }

        const productList = products as IncomingProduct[];
        const results: SyncResult[] = [];

        for (const product of productList) {
            try {
                // Skip products that already have a payment link (only skip when payment_link_url exists)
                if (product.payment_link_url) {
                    results.push({ id: product.id, name: product.name, success: true, skipped: true });
                    continue;
                }
                let stripeProductId: string | undefined = product.stripe_product_id ?? undefined;
                let stripePriceId: string | undefined = product.stripe_price_id ?? undefined;

                // If product has a payment link URL already but missing Stripe ids, try to resolve them
                if (!stripeProductId && product.stripe_url) {
                    try {
                        // list payment links and find matching url (fall back to scanning recent links)
                        const list = await getStripe().paymentLinks.list({ limit: 100 });
                        const match = list.data.find((pl) => pl.url === product.stripe_url || pl.url === product.payment_link_url);
                        if (match) {
                            // retrieve full payment link to access line items
                            const full = await getStripe().paymentLinks.retrieve(match.id, { expand: ['line_items'] });
                            const li = full.line_items?.data?.[0];
                            if (li) {
                                const price = li.price;
                                stripePriceId = price?.id ?? undefined;
                                const priceProduct = price?.product;
                                stripeProductId = typeof priceProduct === 'string' ? priceProduct : undefined;
                            }
                        }
                    } catch (err) {
                        console.warn(`Failed to resolve stripe ids from existing payment link for product ${product.id}:`, err);
                    }
                }

                // Ensure we have a valid numeric price
                const priceNum = Number(product.price);
                if (!Number.isFinite(priceNum) || priceNum <= 0) {
                    results.push({ id: product.id, name: product.name, success: false, error: 'Invalid price' });
                    continue;
                }

                // Normalize images: Stripe requires absolute URLs. If image_url is relative, prefix with WEBSITE_URL when available.
                // If WEBSITE_URL is not set, try to derive from the incoming request so images can be made absolute.
                const envSite = process.env.WEBSITE_URL ? String(process.env.WEBSITE_URL).replace(/\/$/, '') : '';
                let siteUrl = envSite;
                if (!siteUrl) {
                    const host = req.headers.get('host') || '';
                    // Prefer forwarded proto when present. If not, assume https except for localhost/127.0.0.1 where http is required in dev.
                    let proto = req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol') || '';
                    if (!proto) {
                        proto = /localhost|127\.0\.0\.1/.test(host) ? 'http' : 'https';
                    }
                    if (host) siteUrl = `${proto}://${host}`;
                }
                let images: string[] = [];
                if (product.image_url) {
                    const img = String(product.image_url);
                    if (img.startsWith('http://') || img.startsWith('https://')) {
                        images = [img];
                    } else if (siteUrl) {
                        // ensure leading slash
                        const normalized = `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`;
                        images = [normalized];
                        console.log(`Normalized product image for ${product.id}: ${normalized}`);
                    } else {
                        // omit images when we can't form an absolute URL
                        images = [];
                        console.log(`No site URL available; skipping images for product ${product.id}`);
                    }
                }

                if (!stripeProductId) {
                    const stripeProduct = await getStripe().products.create({
                        name: product.name,
                        description: product.description || "",
                        images,
                        metadata: {
                            productId: product.id,
                        },
                    });
                    stripeProductId = stripeProduct.id;
                } else {
                    // If a Stripe product already exists, ensure it has images set (Stripe only accepts absolute URLs)
                    try {
                        if (images && images.length > 0) {
                            const existing = await getStripe().products.retrieve(String(stripeProductId));
                            const existingImages = Array.isArray(existing.images) ? existing.images : [];
                            if (existingImages.length === 0) {
                                await getStripe().products.update(String(stripeProductId), { images });
                            }
                        }
                    } catch (err) {
                        // non-fatal: log and continue — we still attempt to create price/payment link
                        console.warn(`Failed to update images for stripe product ${stripeProductId}:`, err);
                    }
                }

                if (!stripePriceId) {
                    const stripePrice = await getStripe().prices.create({
                        product: stripeProductId,
                        unit_amount: Math.round(priceNum * 100),
                        currency: "usd",
                    });
                    stripePriceId = stripePrice.id;
                }

                const stripePaymentLink = await getStripe().paymentLinks.create({
                    line_items: [
                        {
                            price: stripePriceId,
                            quantity: 1,
                        },
                    ],
                    metadata: {
                        productId: product.id,
                    },
                });

                // Try to persist the payment link id as well if the DB schema supports it.
                // Some deployments may not have `payment_link_id` column yet; fall back gracefully.
                try {
                    await supabaseAdmin
                        .from("products")
                        .update({
                            stripe_product_id: stripeProductId,
                            stripe_price_id: stripePriceId,
                            stripe_url: stripePaymentLink.url,
                            payment_link_url: stripePaymentLink.url,
                            payment_link_id: stripePaymentLink.id,
                        })
                        .eq("id", product.id);
                } catch (dbErr) {
                    console.warn(`Failed to write payment_link_id for product ${product.id}, retrying without it:`, dbErr);
                    try {
                        await supabaseAdmin
                            .from("products")
                            .update({
                                stripe_product_id: stripeProductId,
                                stripe_price_id: stripePriceId,
                                stripe_url: stripePaymentLink.url,
                                payment_link_url: stripePaymentLink.url,
                            })
                            .eq("id", product.id);
                    } catch (dbErr2) {
                        console.error(`Failed to update product ${product.id} after creating payment link:`, dbErr2);
                    }
                }
                // Retrieve the Stripe product to return images for immediate verification
                let stripeProductRecord: Stripe.Product | null = null;
                try {
                    stripeProductRecord = await getStripe().products.retrieve(String(stripeProductId));
                } catch (err) {
                    console.warn(`Failed to retrieve stripe product ${stripeProductId} after creation:`, err);
                }

                results.push({
                    id: product.id,
                    name: product.name,
                    stripe_url: stripePaymentLink.url,
                    payment_link_url: stripePaymentLink.url,
                    payment_link_id: stripePaymentLink.id,
                    stripe_product_id: stripeProductId,
                    stripe_price_id: stripePriceId,
                    // what we attempted to send to Stripe (first image in images array), for debugging
                    image_sent_to_stripe: images && images.length > 0 ? images[0] : null,
                    stripe_product_images: stripeProductRecord?.images ?? null,
                    success: true,
                });
            } catch (error: unknown) {
                console.error(`Error creating payment link for ${product.name}:`, error);
                // Build a verbose error object to return to the client for debugging
                const details = asRecord(error);
                const errInfo: StripeErrorDetail = {
                    message: errorMessage(error) ?? String(error),
                };
                if (details?.type) errInfo.type = details.type;
                if (details?.code) errInfo.code = details.code;
                if (details?.statusCode) errInfo.statusCode = details.statusCode;
                if (details?.raw) errInfo.raw = details.raw;

                results.push({
                    id: product.id,
                    name: product.name,
                    error: errInfo,
                    success: false,
                });
            }
        }

        return NextResponse.json({ results });
    } catch (error: unknown) {
        console.error("Stripe sync error:", error);
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Operator-only for the same reason as the POST above: this reads the
        // catalogue with the service-role key, which bypasses the fleet's RLS
        // policies and returns every column, not the public product list.
        if (!(await isAdminRequest(req))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: products, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("in_stock", true);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ products });
    } catch (error: unknown) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
