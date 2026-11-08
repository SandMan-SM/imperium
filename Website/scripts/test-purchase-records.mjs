// Offline boundary tests. No network, database writes, or Stripe calls.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';

const file = fileURLToPath(new URL('../src/lib/server/purchase-records.ts', import.meta.url));
const moduleRequire = createRequire(import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const records = new Module(file);
records.filename = file;
records.require = (id) => moduleRequire(id);
records._compile(compiled, file);
const {
  catalogueIndex,
  purchaseRecordsFromLineItems,
  legacyLineKey,
  CATALOGUE_ID_METADATA_KEY,
  LINE_KIND_METADATA_KEY,
  LINE_KIND_MERCH,
  LINE_KIND_TAX,
  TAX_LINE_NAME,
} = records.exports;

const catalogue = [
  {
    id: 'row-hoodie',
    name: 'Imperium Command Hoodie',
    stripe_price_id: 'price_hoodie',
    stripe_product_id: 'prod_hoodie',
  },
  {
    id: 'row-beanie',
    name: 'Imperium Beanie',
    stripe_price_id: 'price_beanie',
    stripe_product_id: 'prod_beanie',
  },
];

/** A line the site's own checkout builds: it names its catalogue row. */
function merchLine(rowId, name, amountTotal, quantity = 1) {
  return {
    quantity,
    amount_total: amountTotal,
    price: {
      id: 'price_minted_at_sale',
      product: {
        id: 'prod_minted_at_sale',
        name,
        metadata: {
          [CATALOGUE_ID_METADATA_KEY]: rowId,
          [LINE_KIND_METADATA_KEY]: LINE_KIND_MERCH,
        },
      },
    },
  };
}

/** The tax line the site adds on top. */
function taxLine(amountTotal) {
  return {
    quantity: 1,
    amount_total: amountTotal,
    price: {
      id: 'price_tax',
      product: {
        id: 'prod_tax',
        name: TAX_LINE_NAME,
        metadata: { [LINE_KIND_METADATA_KEY]: LINE_KIND_TAX },
      },
    },
  };
}

test('a line that names its catalogue row is recorded against that row', () => {
  const out = purchaseRecordsFromLineItems('cs_1', [merchLine('row-hoodie', 'Imperium Command Hoodie', 7999)], catalogue);
  assert.equal(out.length, 1);
  assert.equal(out[0].productId, 'row-hoodie');
  assert.equal(out[0].productName, 'Imperium Command Hoodie');
  assert.equal(out[0].amountCents, 7999);
  assert.equal(out[0].quantity, 1);
  assert.equal(out[0].lineKey, 'cs_1:0');
});

test('the tax the site adds is not a purchase', () => {
  const out = purchaseRecordsFromLineItems('cs_2', [merchLine('row-hoodie', 'Imperium Command Hoodie', 7999), taxLine(640)], catalogue);
  assert.equal(out.length, 1);
  assert.equal(out[0].productId, 'row-hoodie');
  assert.equal(out[0].lineIndex, 0);
});

test('a tax line from a session made before it said what it was is still not a purchase', () => {
  const old = {
    quantity: 1,
    amount_total: 640,
    price: { id: 'price_tax', product: { id: 'prod_tax', name: TAX_LINE_NAME } },
  };
  const out = purchaseRecordsFromLineItems('cs_3', [merchLine('row-hoodie', 'Imperium Command Hoodie', 7999), old], catalogue);
  assert.equal(out.length, 1);
});

test('every line of a multi-line order is recorded, each with its own key', () => {
  const out = purchaseRecordsFromLineItems(
    'cs_4',
    [merchLine('row-hoodie', 'Imperium Command Hoodie', 7999), merchLine('row-beanie', 'Imperium Beanie', 2499), taxLine(840)],
    catalogue,
  );
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((r) => r.productId), ['row-hoodie', 'row-beanie']);
  assert.deepEqual(out.map((r) => r.lineKey), ['cs_4:0', 'cs_4:1']);
  assert.deepEqual(out.map((r) => r.amountCents), [7999, 2499]);
});

test('a line bought through a payment link is matched by the price the account knows', () => {
  const line = {
    quantity: 1,
    amount_total: 2000,
    price: { id: 'price_hoodie', product: { id: 'prod_hoodie', name: 'Imperium Command Hoodie' } },
  };
  const out = purchaseRecordsFromLineItems('cs_5', [line], catalogue);
  assert.equal(out.length, 1);
  assert.equal(out[0].productId, 'row-hoodie');
  assert.equal(out[0].productName, 'Imperium Command Hoodie');
});

test('a line that names nothing in the catalogue is still recorded, and says so', () => {
  const line = {
    quantity: 2,
    amount_total: 500,
    price: { id: 'price_unknown', product: { id: 'prod_unknown', name: 'Something Else' } },
  };
  const out = purchaseRecordsFromLineItems('cs_6', [line], catalogue);
  assert.equal(out.length, 1);
  assert.equal(out[0].productId, null);
  assert.equal(out[0].productName, null);
  assert.equal(out[0].quantity, 2);
});

test('a line with no amount or quantity still records a whole unit', () => {
  const out = purchaseRecordsFromLineItems('cs_7', [{ price: { id: 'price_unknown' } }], catalogue);
  assert.equal(out.length, 1);
  assert.equal(out[0].amountCents, 0);
  assert.equal(out[0].quantity, 1);
});

test('the catalogue is indexed by its id, its price and its product', () => {
  const index = catalogueIndex(catalogue);
  assert.equal(index.get('id:row-beanie').name, 'Imperium Beanie');
  assert.equal(index.get('price:price_hoodie').id, 'row-hoodie');
  assert.equal(index.get('product:prod_beanie').id, 'row-beanie');
  assert.equal(index.get('price:price_missing'), undefined);
});

test('a record made before the line key existed is filed under the first line', () => {
  assert.equal(legacyLineKey('cs_8'), 'cs_8:0');
});
