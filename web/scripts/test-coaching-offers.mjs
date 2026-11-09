// Offline boundary tests. No network, database writes, or Stripe calls.
//
// The coaching offers each carried their price in five places: the offer
// itself, the copy on the referral page, the line in llms.txt, the script
// that created the Stripe objects behind it, and the catalogue row the site
// sold from. They all agreed, and nothing kept them agreeing.
//
// The owner is `src/lib/coaching-offers.ts`, and these tests defend it: the
// amount has one home, every other file derives its words, and a restatement
// of a coaching price fails the build rather than waiting for a buyer to
// find it at the checkout.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, '..');
const repoRoot = path.join(appRoot, '..');

/** The one file the coaching prices are owned by. */
const ownerFile = path.join(appRoot, 'src', 'lib', 'coaching-offers.ts');

const moduleRequire = createRequire(import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(ownerFile, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const ownerModule = new Module(ownerFile);
ownerModule.filename = ownerFile;
ownerModule.require = (id) => moduleRequire(id);
ownerModule._compile(compiled, ownerFile);
const { COACHING_OFFERS, PERSONAL_TRAINING, CUSTOM_MEAL_PLAN, MEAL_PLAN_PAYMENT_PLAN } =
  ownerModule.exports;

/** Every file the site is made of, and the scripts that keep it honest. */
function sourceFiles(dir) {
  const found = [];
  // The repository's own tooling directory is not part of a deploy build, so
  // it is scanned when it is there and skipped when it is not.
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...sourceFiles(full));
    } else if (/\.(ts|tsx|mjs)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

/**
 * The code of a file, with its comments dropped.
 *
 * A comment may *mention* a price while explaining why the price lives where
 * it does, and a comment states nothing to a buyer. A rule that cannot tell
 * a comment from a price teaches the reader to ignore it.
 */
function codeOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = [];
  let inBlock = false;

  for (const raw of text.split('\n')) {
    const trimmed = raw.trim();
    if (inBlock) {
      if (trimmed.includes('*/')) inBlock = false;
      continue;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inBlock = true;
      continue;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
    lines.push(raw.replace(/\/\/.*$/, ''));
  }
  return lines.join('\n');
}

/** The files this rule covers: the app's own source, and the scripts beside it. */
const covered = [
  ...sourceFiles(path.join(appRoot, 'src')),
  ...sourceFiles(path.join(repoRoot, 'scripts')).filter((file) => !file.includes('node_modules')),
].filter((file) => file !== ownerFile);

/**
 * A file is about the coaching offers when it says so.
 *
 * The rule is scoped this way on purpose: "$99" is also a perfectly good
 * threshold for a checkout probe, and a check that flagged every number that
 * happens to equal a coaching price would be a check that fires on nothing.
 */
function isAboutCoaching(code) {
  return (
    /tyrone/i.test(code) ||
    /coaching/i.test(code) ||
    /meal plan/i.test(code) ||
    /personal training/i.test(code)
  );
}

test('the owner holds one price per offer and derives the label from it', () => {
  assert.ok(COACHING_OFFERS.length > 0, 'there is at least one coaching offer');

  for (const offer of COACHING_OFFERS) {
    assert.equal(
      Number.isInteger(offer.amountCents) && offer.amountCents > 0,
      true,
      `${offer.name} holds a positive price in cents`,
    );

    const dollars = offer.amountCents / 100;
    const expected = `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
    assert.equal(offer.price, expected, `${offer.name} derives its price label`);
  }
});

test('every offer has a catalogue row and a checkout link', () => {
  const ids = new Set();
  const urls = new Set();

  for (const offer of COACHING_OFFERS) {
    assert.match(
      offer.catalogueId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      `${offer.name} names a catalogue row`,
    );
    assert.match(
      offer.checkoutUrl,
      /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+$/,
      `${offer.name} names a Stripe payment link`,
    );

    assert.equal(ids.has(offer.catalogueId), false, 'the catalogue rows are distinct');
    assert.equal(urls.has(offer.checkoutUrl), false, 'the checkout links are distinct');
    ids.add(offer.catalogueId);
    urls.add(offer.checkoutUrl);
  }
});

test('the named offers are the ones on the list', () => {
  assert.equal(PERSONAL_TRAINING.amountCents, COACHING_OFFERS[0].amountCents);
  assert.equal(CUSTOM_MEAL_PLAN.amountCents, COACHING_OFFERS[1].amountCents);
  assert.equal(MEAL_PLAN_PAYMENT_PLAN.amountCents, COACHING_OFFERS[2].amountCents);
});

test('a name that carries the price carries the derived one', () => {
  for (const offer of COACHING_OFFERS) {
    if (offer.name.includes('$')) {
      assert.ok(
        offer.name.includes(offer.price),
        `${offer.name} states the price the owner holds`,
      );
    }
    if (offer.catalogueName.includes('$')) {
      assert.ok(
        offer.catalogueName.includes(offer.price),
        `${offer.catalogueName} states the price the owner holds`,
      );
    }
  }
});

test('no file outside the owner states a coaching price', () => {
  const restated = [];

  for (const file of covered) {
    const code = codeOf(file);
    if (!isAboutCoaching(code)) continue;

    for (const offer of COACHING_OFFERS) {
      const dollars = offer.price;
      const cents = String(offer.amountCents);

      if (code.includes(dollars)) restated.push(`${path.relative(repoRoot, file)}: ${dollars}`);
      if (code.includes(cents)) restated.push(`${path.relative(repoRoot, file)}: ${cents}`);
    }
  }

  assert.deepEqual(
    restated,
    [],
    `a coaching price is written out outside its owner: ${restated.join(', ')}`,
  );
});

test('no file outside the owner names a coaching checkout link', () => {
  const copied = [];

  for (const file of covered) {
    const code = codeOf(file);
    for (const offer of COACHING_OFFERS) {
      if (code.includes(offer.checkoutUrl)) {
        copied.push(`${path.relative(repoRoot, file)}: ${offer.checkoutUrl}`);
      }
    }
  }

  assert.deepEqual(copied, [], `a coaching checkout link is written out twice: ${copied.join(', ')}`);
});
