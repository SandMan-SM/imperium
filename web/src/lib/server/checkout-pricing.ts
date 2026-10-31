import type Stripe from 'stripe';
import { getAdminClient } from './imperium-capture';
import { BRAND } from '@/lib/brand';
import {
  allocateDiscount,
  computeTotals,
  FREE_SHIPPING_THRESHOLD_CENTS,
  shippingName,
  shippingOption,
  type CheckoutTotals,
} from '@/lib/checkout-totals';

/**
 * Pricing for the merch checkout.
 *
 * The cart lives in the browser, so everything in it is a claim: the name,
 * the price and the quantity are all chosen by whoever made the request.
 * Taking the price from the request meant a caller could ask Stripe for a
 * session that charges one cent for a hoodie and pay it — the order would
 * look paid and the goods would ship.
 *
 * So the price is read from the `products` table, which is the one place the
 * catalogue is written down, and the request's own price is ignored
 * entirely. A line that does not resolve to a catalogue row is refused
 * rather than priced by the caller.
 */

/** The columns of the catalogue the checkout needs. */
export type CatalogueRow = {
  id: string;
  name: string;
  price: number | string;
  image_url: string | null;
};

/** A cart line as the browser sends it. */
export interface PricedItem {
  id: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
}

/** A cart line resolved against the catalogue, with its real price. */
export type PricedLine = {
  item: PricedItem;
  row: CatalogueRow;
  price: number;
  quantity: number;
};

/** The outcome of pricing a cart: either priced lines or the reason it failed. */
export type PricingResult =
  | { ok: true; lines: PricedLine[]; subtotal: number }
  | { ok: false; error: string };

/**
 * The origin Stripe sends the buyer back to.
 *
 * `NEXT_PUBLIC_BASE_URL` is not set in the Vercel environment, so the old
 * fallback sent every completed order to `http://localhost:3000/checkout?success=true`
 * — the buyer landed on a dead address and the order looked lost. The
 * canonical site origin is the fallback.
 *
 * A configured origin is often written without a scheme (`secretimperium.com`),
 * and Stripe rejects a redirect URL that has none — the checkout failed at the
 * last step with "Not a valid URL". The scheme is filled in when it is
 * missing, so the shape of the variable cannot decide whether the buyer can
 * pay.
 *
 * The retired Vercel alias is refused outright: a buyer who pays and is sent
 * to an old deployment sees a stale site and no order.
 */
const RETIRED_ALIAS = 'imperium-green.vercel.app';

export function siteOrigin(): string {
  const configured = (process.env.NEXT_PUBLIC_BASE_URL || process.env.WEBSITE_URL || '').trim();
  if (!configured) return BRAND.siteUrl;

  const candidate = configured.replace(/\/+$/, '');
  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const host = new URL(withScheme).hostname.toLowerCase();
    if (host && host !== RETIRED_ALIAS) return withScheme;
  } catch {
    // An origin that will not parse is not an origin.
  }

  return BRAND.siteUrl;
}

/**
 * An absolute URL for an image Stripe will fetch.
 *
 * The catalogue stores site-relative paths (`/products/hoodie.jpeg`) and
 * Stripe rejects a relative one — the session failed with "Not a valid URL"
 * and no buyer could complete a purchase. A path is resolved against the
 * site's own origin; an absolute URL is left alone.
 */
export function absoluteAssetUrl(value: string | null, origin: string): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

/**
 * Reads the catalogue.
 *
 * Returns an empty map when the admin client is not configured, which the
 * caller refuses as "the shop is unavailable" rather than falling back to
 * prices from the request.
 */
export async function resolveCatalogue(): Promise<Map<string, CatalogueRow>> {
  const admin = getAdminClient();
  const catalogue = new Map<string, CatalogueRow>();

  if (!admin) return catalogue;

  const { data } = await admin
    .from('products')
    .select('id, name, price, image_url')
    .limit(500);

  for (const row of (data ?? []) as CatalogueRow[]) {
    catalogue.set(`id:${row.id}`, row);
    catalogue.set(`name:${row.name.trim().toLowerCase()}`, row);
  }

  return catalogue;
}

/**
 * Prices a cart against the catalogue.
 *
 * A line that names nothing the catalogue knows is refused, as is a line
 * with no price set or an absurd quantity. The refusal names the line, so
 * the buyer is told which item is the problem.
 */
export function priceCart(items: PricedItem[], catalogue: Map<string, CatalogueRow>): PricingResult {
  const lines: PricedLine[] = [];
  let subtotal = 0;

  for (const item of items) {
    // The product detail page builds a composite id
    // (`<uuid>-<size>-<colour>`), so the uuid is the first segment.
    const idSegment = item.id.split('-').slice(0, 5).join('-');
    const row =
      catalogue.get(`id:${idSegment}`) ??
      catalogue.get(`name:${item.name.trim().toLowerCase()}`);

    if (!row) {
      return { ok: false, error: `${item.name} is no longer available.` };
    }

    const price = Number(row.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false, error: `${item.name} has no price set.` };
    }

    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return { ok: false, error: `${item.name} has an invalid quantity.` };
    }

    lines.push({ item, row, price, quantity });
    subtotal += price * quantity;
  }

  return { ok: true, lines, subtotal };
}

/**
 * The gross amount of a line, in cents.
 */
function lineGrossCents(line: PricedLine): number {
  return Math.round(line.price * 100) * line.quantity;
}

/**
 * The discount each line carries.
 *
 * The split is worked out by the shared totals module, so the number the
 * buyer is shown and the number the cart is charged come from the same
 * arithmetic.
 */

/** The Stripe line item for one priced cart line, at a given unit amount. */
function stripeLineItem(
  line: PricedLine,
  unitAmount: number,
  quantity: number,
  origin: string,
): Stripe.Checkout.SessionCreateParams.LineItem {
  const { item, row } = line;
  const image = absoluteAssetUrl(row.image_url, origin);

  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: row.name,
        description: item.size
          ? `Size: ${item.size}${item.color ? `, Color: ${item.color}` : ''}`
          : undefined,
        images: image ? [image] : [],
      },
      unit_amount: unitAmount,
    },
    quantity,
  };
}

/**
 * The Stripe line items for a cart, with the discount already taken off.
 *
 * Stripe cannot take a negative line item, so the discount is not a line of
 * its own — the lines are charged net, and the tax is the one line added
 * on top. The amounts add up to `subtotal - discount`, which is the same
 * taxable amount the summary shows.
 *
 * A line whose net amount does not divide by its quantity is sent as two
 * lines of the same product, so the cents still add up to the penny.
 */
export function stripeLineItems(
  lines: PricedLine[],
  discountCents: number,
  origin: string,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const gross = lines.map(lineGrossCents);
  const discounts = allocateDiscount(gross, discountCents);

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  lines.forEach((line, index) => {
    const net = gross[index] - discounts[index];
    if (net <= 0) return;

    const quantity = line.quantity;
    const unit = Math.floor(net / quantity);
    const remainder = net - unit * quantity;

    if (remainder === 0) {
      items.push(stripeLineItem(line, unit, quantity, origin));
      return;
    }

    if (quantity > 1 && unit > 0) {
      items.push(stripeLineItem(line, unit, quantity - 1, origin));
      items.push(stripeLineItem(line, unit + remainder, 1, origin));
      return;
    }

    items.push(stripeLineItem(line, net, 1, origin));
  });

  return items;
}

/** The options a checkout session is built from. */
export interface SessionOptions {
  lines: PricedLine[];
  /** The shipping tier the buyer chose, if any. */
  shippingMethodId?: string;
  /** The discount in cents, already validated against the promo table. */
  discountCents?: number;
  /** The buyer's email, when the form collected one. */
  email?: string;
  /** The shipping address the form collected, when it collected one. */
  shipping?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

/** The session Stripe was asked for, and the totals it charges. */
export type SessionResult = {
  totals: CheckoutTotals;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
};

/**
 * Builds the Stripe line items and the totals they add up to.
 *
 * The tax is a line item of its own rather than a number Stripe adds, because
 * the account has no Stripe Tax set up. It is added to the session in the
 * same way the buyer was shown it, so the amount on the Stripe page is the
 * amount the cart page quoted.
 */
export function buildCheckout(options: SessionOptions, origin: string): SessionResult {
  const { lines, shippingMethodId, discountCents = 0 } = options;

  const subtotalCents = lines.reduce((sum, line) => sum + lineGrossCents(line), 0);
  const totals = computeTotals(subtotalCents, discountCents, shippingMethodId);

  const lineItems = stripeLineItems(lines, discountCents, origin);

  if (totals.tax > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Sales tax' },
        unit_amount: totals.tax,
      },
      quantity: 1,
    });
  }

  return { totals, lineItems };
}

/**
 * The shipping rate for a session.
 *
 * The free-shipping threshold is applied to the discounted subtotal, which
 * is the amount being shipped.
 */
export function shippingRate(totals: CheckoutTotals, shippingMethodId?: unknown) {
  const amount = totals.shipping;
  const tier = shippingOption(shippingMethodId);

  return {
    type: 'fixed_amount' as const,
    fixed_amount: {
      amount,
      currency: 'usd',
    },
    display_name: tier ? tier.name : shippingName(shippingMethodId),
    delivery_estimate: {
      minimum: { unit: 'business_day' as const, value: tier?.minDays ?? 5 },
      maximum: { unit: 'business_day' as const, value: tier?.maxDays ?? 7 },
    },
  };
}

/** Whether the order qualifies for free shipping. */
export function shippingIsFree(totals: CheckoutTotals): boolean {
  return totals.shipping === 0 && totals.subtotal - totals.discount >= FREE_SHIPPING_THRESHOLD_CENTS;
}
