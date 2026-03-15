export const dynamic = 'force-static';

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-helper";

export async function POST(req: NextRequest) {
    try {
        const { items } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in cart" }, { status: 400 });
        }

        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.image_url ? [item.image_url] : [],
                    metadata: {
                        productId: item.id,
                    },
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.WEBSITE_URL || "https://imperium-green.vercel.app"}/shop?success=true`,
            cancel_url: `${process.env.WEBSITE_URL || "https://imperium-green.vercel.app"}/shop?canceled=true`,
            shipping_address_collection: {
                allowed_countries: ["US", "CA", "GB", "AU"],
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error:", error);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}
