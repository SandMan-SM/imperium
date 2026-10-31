export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import type { CartItem } from "@/lib/cart-context";
import { CheckoutError, createCheckoutSession } from "@/lib/server/checkout-session";

/** Shipping details collected by the checkout form. */
interface ShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Request body accepted by the checkout endpoint.
 *
 * The discount is not among them. The promo used to arrive as a dollar
 * amount the browser chose, and the server applied a Stripe coupon whenever
 * that number was above zero — the coupon did not exist, so every checkout
 * that used it failed at the last step and the buyer was left holding a
 * cart. The code is sent instead, and the server decides what it is worth.
 */
interface CheckoutRequestBody {
  items?: CartItem[];
  shipping?: ShippingDetails;
  shippingMethod?: string;
  promoCode?: string;
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
    const { items, shipping, shippingMethod, promoCode, email } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!shipping?.address || !shipping?.city || !shipping?.state || !shipping?.zip) {
      return NextResponse.json({ error: "Shipping details are incomplete." }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const { url, totals } = await createCheckoutSession({
      items,
      shippingMethodId: shippingMethod,
      promoCode,
      email,
      shipping,
    });

    return NextResponse.json({ url, total: totals.total });
  } catch (error: unknown) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: errorMessage(error) || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
