/**
 * Turning a paid Stripe checkout into the purchase records the tenant log keeps.
 *
 * A paid order is a fact about what was bought, and the operator reads it in
 * the admin console. Two things were wrong with the way those facts were
 * made:
 *
 *   - the idempotency key was the checkout session, so only the **first**
 *     line of an order was ever recorded. A buyer who took a hoodie and a
 *     beanie left one record behind and the other was lost — and the record
 *     that survived said one thing while the money said another;
 *   - a line built by the site's own checkout carries a price id minted at
 *     the moment of the sale, so the catalogue lookup found nothing and the
 *     record said "purchased something" with no name and no catalogue row
 *     behind it. The sale was real; the receipt of it was empty.
 *
 * So each line says which catalogue row it is, and each line gets its own
 * key. The tax is a line the site adds and is not a purchase, and it says so
 * too.
 *
 * This module is pure. It takes the lines and the catalogue and returns the
 * records to write; the webhook does the writing. Keeping the decision here
 * means it can be tested without a network, and it means the decision has
 * one home.
 */

/** The metadata key that names the catalogue row a line belongs to. */
export const CATALOGUE_ID_METADATA_KEY = 'imperium_product_id';

/** The metadata key that says what kind of line it is. */
export const LINE_KIND_METADATA_KEY = 'imperium_line';

/** The kind a catalogue line carries. */
export const LINE_KIND_MERCH = 'merch';

/** The kind the site's own tax line carries. */
export const LINE_KIND_TAX = 'tax';

/** The name the site's own tax line is given. */
export const TAX_LINE_NAME = 'Sales tax';

/** A catalogue row, as far as a purchase record is concerned. */
export interface PurchaseCatalogueRow {
  id: string;
  name: string;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
}

/** The price a line was bought at. */
export interface CheckoutLinePrice {
  id?: string | null;
  product?: string | { id?: string | null; name?: string | null; metadata?: Record<string, string> | null } | null;
}

/** One line of a paid checkout session. */
export interface CheckoutLine {
  description?: string | null;
  quantity?: number | null;
  amount_total?: number | null;
  price?: CheckoutLinePrice | null;
}

/** One purchase, ready to be written to the tenant log. */
export interface PurchaseRecord {
  /** The key that makes a replay of the same line a no-op. */
  lineKey: string;
  /** Where the line sat in the session. */
  lineIndex: number;
  /** The catalogue row that was bought, when it could be found. */
  productId: string | null;
  /** The name of that row, when it could be found. */
  productName: string | null;
  /** What the line came to, in cents. */
  amountCents: number;
  /** How many were bought. */
  quantity: number;
}

/**
 * An index of the catalogue, by every way a Stripe line can name a row.
 *
 * A line can name its row three ways: the id the site stamped on it, the
 * price id the account already knows (the payment links), or the product id
 * behind that price. The first one wins, because it is the one the site
 * itself wrote.
 */
export function catalogueIndex(rows: PurchaseCatalogueRow[]): Map<string, PurchaseCatalogueRow> {
  const index = new Map<string, PurchaseCatalogueRow>();

  const add = (key: string | null | undefined, row: PurchaseCatalogueRow) => {
    if (!key) return;
    if (!index.has(key)) index.set(key, row);
  };

  for (const row of rows) {
    add(`id:${row.id}`, row);
    add(`price:${row.stripe_price_id}`, row);
    add(`product:${row.stripe_product_id}`, row);
  }

  return index;
}

/** The product a line was bought at, whether Stripe expanded it or not. */
function productOf(line: CheckoutLine): { id: string | null; name: string | null; metadata: Record<string, string> } {
  const product = line.price?.product;
  const expanded = typeof product === 'object' && product !== null ? product : null;
  const id = expanded ? expanded.id ?? null : typeof product === 'string' ? product : null;
  const metadata: Record<string, string> = {};

  for (const [key, value] of Object.entries(expanded?.metadata ?? {})) {
    if (typeof value === 'string') metadata[key] = value;
  }

  return { id, name: expanded?.name ?? null, metadata };
}

/**
 * The catalogue row a line belongs to, if any.
 */
function resolveRow(
  index: Map<string, PurchaseCatalogueRow>,
  line: CheckoutLine,
  catalogueId: string | undefined,
  productId: string | null,
): PurchaseCatalogueRow | undefined {
  if (catalogueId) {
    const stamped = index.get(`id:${catalogueId}`);
    if (stamped) return stamped;
  }

  const priceId = line.price?.id ?? null;
  if (priceId) {
    const byPrice = index.get(`price:${priceId}`);
    if (byPrice) return byPrice;
  }

  if (productId) {
    const byProduct = index.get(`product:${productId}`);
    if (byProduct) return byProduct;
  }

  return undefined;
}

/**
 * The purchase records for a paid checkout session.
 *
 * The tax line the site adds is not a purchase and is left out. Every other
 * line becomes one record, each with its own key, so a multi-line order
 * leaves a record for every line and a replay of the session leaves no
 * record twice.
 */
export function purchaseRecordsFromLineItems(
  sessionId: string,
  lines: CheckoutLine[],
  catalogue: PurchaseCatalogueRow[],
): PurchaseRecord[] {
  const index = catalogueIndex(catalogue);
  const records: PurchaseRecord[] = [];

  lines.forEach((line, lineIndex) => {
    const product = productOf(line);
    const kind = product.metadata[LINE_KIND_METADATA_KEY];

    if (kind === LINE_KIND_TAX) return;
    // A session made before the tax said what it was is still recognised by
    // its name, so an old order cannot record its tax as a purchase.
    if (!kind && product.name === TAX_LINE_NAME) return;

    const row = resolveRow(index, line, product.metadata[CATALOGUE_ID_METADATA_KEY], product.id);
    const quantity = Number(line.quantity);
    const amount = Number(line.amount_total);

    records.push({
      lineKey: `${sessionId}:${lineIndex}`,
      lineIndex,
      productId: row?.id ?? null,
      productName: row?.name ?? null,
      amountCents: Number.isFinite(amount) ? Math.round(amount) : 0,
      quantity: Number.isFinite(quantity) && quantity >= 1 ? Math.floor(quantity) : 1,
    });
  });

  return records;
}

/**
 * The key a record made before this module existed is filed under.
 *
 * The old code recorded only the first line of a session and filed it under
 * the session id alone, so a replayed event for an old session has to find
 * that row rather than write a second one.
 */
export function legacyLineKey(sessionId: string): string {
  return `${sessionId}:0`;
}
