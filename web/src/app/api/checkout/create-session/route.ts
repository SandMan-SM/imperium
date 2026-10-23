export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import type { CartItem } from "@/lib/cart-context";
import { getStripe } from "@/lib/stripe-helper";

/** Shipping details collected by the checkout form. */
interface ShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

/** Request body accepted by the checkout endpoint. */
interface CheckoutRequestBody {
  items?: CartItem[];
  shipping: ShippingDetails;
  discount: number;
  email?: string;
}

/** Narrows an unknown thrown value to a plain object so its fields can be read. */
function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/** Reads a `message` property off an unknown error value, mirroring `error?.message`. */
function errorMessage(error: unknown): string | undefined {
  const message = asRecord(error)?.message;
  return typeof message === 'string' ? message : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const { items, shipping, discount, email } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.size ? `Size: ${item.size}${item.color ? `, Color: ${item.color}` : ""}` : undefined,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    let discountAmount = 0;
    if (discount > 0) {
      discountAmount = Math.round(discount * 100);
    }

    const shippingCost = 0;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cart`,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingCost,
              currency: "usd",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],
      metadata: {
        shipping_name: `${shipping.firstName} ${shipping.lastName}`,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip,
        discount: discount.toString(),
      },
      discounts: discountAmount > 0 ? [{ coupon: "IMPERIUM20" }] : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: errorMessage(error) || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
