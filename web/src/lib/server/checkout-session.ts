import { getStripe } from '@/lib/stripe-helper';
import { promoDiscountCents, type CheckoutTotals } from '@/lib/checkout-totals';
import {
  buildCheckout,
  priceCart,
  resolveCatalogue,
  shippingRate,
  siteOrigin,
  type PricedItem,
} from './checkout-pricing';

/**
 * The one place a Stripe checkout session is built.
 *
 * There used to be two routes that each built their own session: one that
 * priced the cart against the catalogue and one that took the price from the
 * request. A second door is a second price, so the second route is gone and
 * this module is what both the checkout page and any future caller go
 * through.
 */

/** A failure the buyer can be told about, with the status it deserves. */
export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.status = status;
  }
}

/** What a caller asks for. */
export interface CheckoutSessionRequest {
  /** The cart lines the browser sent. Their prices are ignored. */
  items: PricedItem[];
  /** The shipping tier the buyer picked. */
  shippingMethodId?: string;
  /** The promo code the buyer typed. It is checked against the promo table. */
  promoCode?: string;
  /** The buyer's email. */
  email?: string;
  /** The shipping address the form collected. */
  shipping?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

/** The session that was created. */
export interface CheckoutSession {
  url: string;
  totals: CheckoutTotals;
}

/**
 * Creates a checkout session for a cart.
 *
 * The cart is priced against the catalogue, the promo code is checked against
 * the promo table, and the totals are worked out once, here, so the session
 * charges exactly what the summary quoted.
 */
export async function createCheckoutSession(
  request: CheckoutSessionRequest,
): Promise<CheckoutSession> {
  const { items, shippingMethodId, promoCode, email, shipping } = request;

  if (!items || items.length === 0) {
    throw new CheckoutError('No items in cart');
  }

  const catalogue = await resolveCatalogue();
  if (catalogue.size === 0) {
    throw new CheckoutError('The shop is unavailable. Please try again shortly.', 503);
  }

  const priced = priceCart(items, catalogue);
  if (!priced.ok) {
    throw new CheckoutError(priced.error);
  }

  const discountCents = promoDiscountCents(promoCode) ?? 0;
  const origin = siteOrigin();
  const { totals, lineItems } = buildCheckout(
    { lines: priced.lines, shippingMethodId, discountCents, email, shipping },
    origin,
  );

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/checkout?success=true`,
    cancel_url: `${origin}/cart`,
    customer_email: email,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU'],
    },
    shipping_options: [
      {
        shipping_rate_data: shippingRate(totals, shippingMethodId),
      },
    ],
    metadata: {
      shipping_name: `${shipping?.firstName ?? ''} ${shipping?.lastName ?? ''}`.trim(),
      shipping_address: shipping?.address ?? '',
      shipping_city: shipping?.city ?? '',
      shipping_state: shipping?.state ?? '',
      shipping_zip: shipping?.zip ?? '',
      shipping_method: shippingMethodId ?? 'standard',
      promo_code: typeof promoCode === 'string' ? promoCode.trim().toUpperCase() : '',
      order_total_cents: String(totals.total),
    },
  });

  if (!session.url) {
    throw new CheckoutError('Failed to create checkout session', 500);
  }

  return { url: session.url, totals };
}
