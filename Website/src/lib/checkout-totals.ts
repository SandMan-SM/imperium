/**
 * The numbers a checkout is made of.
 *
 * The cart page, the checkout page and the two checkout routes each used to
 * work out the total their own way, and they disagreed: the tax was divided
 * by 100 twice (so a $100 order showed $0.06 of tax), the express and
 * overnight shipping tiers were offered on screen but the server always
 * charged the standard rate, and the promo code was a dollar amount the
 * browser chose.
 *
 * One module now owns the arithmetic, so what the buyer is shown and what
 * Stripe charges are the same number. It is imported by both the browser
 * (for the summary) and the server (for the session), so it must stay free
 * of server-only imports.
 */

/** A shipping tier the buyer can pick. */
export interface ShippingOption {
  id: string;
  name: string;
  /** The price of the tier, in cents. */
  price: number;
  /** How long the tier takes, in words. */
  days: string;
  /** The delivery estimate Stripe shows, in business days. */
  minDays: number;
  maxDays: number;
}

/** The shipping tiers the buyer can pick, in cents. */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'standard', name: 'Standard Shipping', price: 0, days: '5-7 business days', minDays: 5, maxDays: 7 },
  { id: 'express', name: 'Express Shipping', price: 1500, days: '2-3 business days', minDays: 2, maxDays: 3 },
  { id: 'overnight', name: 'Overnight Shipping', price: 3000, days: 'Next business day', minDays: 1, maxDays: 1 },
];

/** The sales tax rate, as a fraction of the discounted subtotal. */
export const TAX_RATE = 0.08;

/** Orders over this subtotal (in cents) ship free. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

/**
 * The promo codes the shop honours.
 *
 * The discount used to be a dollar amount the browser sent — "I am worth $20
 * off" — and the server applied a Stripe coupon whenever that number was
 * above zero. It also named a coupon (`IMPERIUM20`) that did not exist in the
 * Stripe account, so every checkout that used the promo code failed at the
 * last step with "No such coupon" and the buyer was left holding a cart.
 *
 * So the code is sent, not the amount, and the code is checked against this
 * table. The discount is what the table says it is.
 */
export const PROMO_CODES: Record<string, { cents: number; label: string }> = {
  IMPERIUM20: { cents: 2000, label: 'IMPERIUM20' },
};

/** The query key the applied promo code is carried in, from the cart to the checkout. */
export const PROMO_QUERY_KEY = 'promo';

/** The discount a promo code is worth, or null when the code is not one we honour. */
export function promoDiscountCents(code: unknown): number | null {
  if (typeof code !== 'string') return null;
  const entry = PROMO_CODES[code.trim().toUpperCase()];
  return entry ? entry.cents : null;
}

/** The shipping tier for a method id, or null when the id names no tier. */
export function shippingOption(methodId: unknown): ShippingOption | null {
  if (typeof methodId !== 'string') return null;
  return SHIPPING_OPTIONS.find((entry) => entry.id === methodId) ?? null;
}

/**
 * The shipping tier for a method id, falling back to standard.
 *
 * An unknown id must not become a free order, so it becomes the standard
 * tier rather than nothing.
 */
export function shippingPriceCents(methodId: unknown): number {
  return shippingOption(methodId)?.price ?? 0;
}

/** The name of the shipping tier for a method id. */
export function shippingName(methodId: unknown): string {
  return shippingOption(methodId)?.name ?? 'Standard Shipping';
}

/** The totals of an order, all in cents. */
export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

/**
 * The totals of an order.
 *
 * `subtotal` and `discount` are in cents. The shipping tier is free above
 * the threshold, and the tax is a share of the discounted subtotal — the
 * amount the buyer actually pays tax on.
 */
export function computeTotals(
  subtotalCents: number,
  discountCents: number,
  shippingMethodId?: unknown,
): CheckoutTotals {
  const discount = Math.max(0, Math.min(discountCents, subtotalCents));
  const taxable = subtotalCents - discount;
  const tier = shippingPriceCents(shippingMethodId);
  const shipping = taxable >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : tier;
  const tax = Math.round(taxable * TAX_RATE);

  return {
    subtotal: subtotalCents,
    discount,
    shipping,
    tax,
    total: taxable + shipping + tax,
  };
}

/** A dollar amount for a number of cents. */
export function usd(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * The discount each line of a cart carries.
 *
 * The discount is a flat amount, so it is taken off the dearest lines first.
 * That keeps the numbers the buyer sees round: a $80 hoodie with a $20 promo
 * is charged $60, not $64.77 with $15.23 left over on a cap.
 *
 * The split adds up to the discount exactly, which is what makes the amount
 * charged the same number as the amount shown.
 */
export function allocateDiscount(grossCents: number[], discountCents: number): number[] {
  const discounts = grossCents.map(() => 0);
  let remaining = Math.max(0, discountCents);

  const order = grossCents
    .map((gross, index) => ({ gross, index }))
    .sort((a, b) => b.gross - a.gross);

  for (const { gross, index } of order) {
    if (remaining <= 0) break;
    const taken = Math.min(remaining, gross);
    discounts[index] = taken;
    remaining -= taken;
  }

  return discounts;
}
