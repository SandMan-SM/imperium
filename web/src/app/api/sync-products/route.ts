import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { products } = await req.json();

        if (!products || !Array.isArray(products)) {
            return NextResponse.json({ error: "Invalid products array" }, { status: 400 });
        }

        const results = [];

        for (const product of products) {
            try {
                // Skip products that already have a payment link
                if (product.stripe_url || product.payment_link_url) {
                    results.push({ id: product.id, name: product.name, success: true, skipped: true });
                    continue;
                }
                let stripeProductId = product.stripe_product_id;
                let stripePriceId = product.stripe_price_id;

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
                    const stripeProduct = await stripe.products.create({
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
                            const existing = await stripe.products.retrieve(String(stripeProductId));
                            const existingImages = Array.isArray((existing as any).images) ? (existing as any).images : [];
                            if (existingImages.length === 0) {
                                await stripe.products.update(String(stripeProductId), { images });
                            }
                        }
                    } catch (err) {
                        // non-fatal: log and continue — we still attempt to create price/payment link
                        console.warn(`Failed to update images for stripe product ${stripeProductId}:`, err);
                    }
                }

                if (!stripePriceId) {
                    const stripePrice = await stripe.prices.create({
                        product: stripeProductId,
                        unit_amount: Math.round(priceNum * 100),
                        currency: "usd",
                    });
                    stripePriceId = stripePrice.id;
                }

                const stripePaymentLink = await stripe.paymentLinks.create({
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

                await supabaseAdmin
                    .from("products")
                    .update({
                        stripe_product_id: stripeProductId,
                        stripe_price_id: stripePriceId,
                        stripe_url: stripePaymentLink.url,
                        payment_link_url: stripePaymentLink.url,
                    })
                    .eq("id", product.id);
                // Retrieve the Stripe product to return images for immediate verification
                let stripeProductRecord: any = null;
                try {
                    stripeProductRecord = await stripe.products.retrieve(String(stripeProductId));
                } catch (err) {
                    console.warn(`Failed to retrieve stripe product ${stripeProductId} after creation:`, err);
                }

                results.push({
                    id: product.id,
                    name: product.name,
                    stripe_url: stripePaymentLink.url,
                    payment_link_url: stripePaymentLink.url,
                    stripe_product_id: stripeProductId,
                    stripe_price_id: stripePriceId,
                    // what we attempted to send to Stripe (first image in images array), for debugging
                    image_sent_to_stripe: images && images.length > 0 ? images[0] : null,
                    stripe_product_images: stripeProductRecord?.images ?? null,
                    success: true,
                });
            } catch (error: any) {
                console.error(`Error creating payment link for ${product.name}:`, error);
                // Build a verbose error object to return to the client for debugging
                const errInfo: any = {
                    message: error?.message ?? String(error),
                };
                if (error?.type) errInfo.type = error.type;
                if (error?.code) errInfo.code = error.code;
                if (error?.statusCode) errInfo.statusCode = error.statusCode;
                if (error?.raw) errInfo.raw = error.raw;

                results.push({
                    id: product.id,
                    name: product.name,
                    error: errInfo,
                    success: false,
                });
            }
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("Stripe sync error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { data: products, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("in_stock", true);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ products });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
