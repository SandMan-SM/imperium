// Offline boundary tests. No network, database writes, or Stripe calls.
//
// The resource pages' offer prices were written down twice: once as a
// literal in the apply section, once in the solution prose a prospect
// reads. The owner is `src/lib/resource-offers.ts`, and these tests defend
// it: the amount has one home, the prose carries a token instead of a
// number, and a restatement of a resource price fails the build rather than
// waiting for a prospect to find two different prices for the same service.
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

/** The one file the resource offer prices are owned by. */
const ownerFile = path.join(appRoot, 'src', 'lib', 'resource-offers.ts');

/** The content the prices are quoted inside. */
const contentFile = path.join(appRoot, 'src', 'lib', 'portfolio-resources.json');

const moduleRequire = createRequire(import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(ownerFile, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;
const ownerModule = new Module(ownerFile);
ownerModule.filename = ownerFile;
ownerModule.require = (id) => moduleRequire(id);
ownerModule._compile(compiled, ownerFile);
const { resourceOffer, fillText, fillTokens } = ownerModule.exports;

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
    } else if (/\.(ts|tsx|mjs|json)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

/**
 * The code of a file, with its comments dropped.
 *
 * A comment may *mention* a price while explaining why the price lives where
 * it does, and a comment states nothing to a prospect. A rule that cannot
 * tell a comment from a price teaches the reader to ignore it.
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
 * A file is about the resource offers when it says so.
 *
 * The rule is scoped this way on purpose: "$1,500" is also a perfectly good
 * price for somebody else's service, and a check that flagged every number
 * that happened to equal a resource price would be a check that fires on
 * nothing.
 */
function isAboutResources(code) {
  return (
    /resource/i.test(code) ||
    /lead franchise/i.test(code) ||
    /ais empire/i.test(code) ||
    /agentic websites/i.test(code)
  );
}

/** The amounts the owner holds, in the form a reader sees them. */
const ownedPrices = ['$50,000', '$100,000', '$1,500'];

test('every offer carries a name and an amount', () => {
  for (const kind of ['builder', 'utah-growth', 'ai-partner', 'partnership']) {
    const offer = resourceOffer(kind);
    assert.ok(offer.offer.length > 0, `${kind} names its offer`);
    assert.match(offer.price, /^\$[\d,]+$/, `${kind} states its amount`);
  }
});

test('an unknown kind falls back to the builder rather than failing', () => {
  assert.deepEqual(resourceOffer('nothing-like-this'), resourceOffer('builder'));
  assert.deepEqual(resourceOffer(undefined), resourceOffer('builder'));
});

test('the content quotes the prices rather than carrying them', () => {
  const raw = fs.readFileSync(contentFile, 'utf8');

  for (const price of ownedPrices) {
    assert.equal(
      raw.includes(price),
      false,
      `the content file states ${price} instead of a token`,
    );
  }

  assert.ok(raw.includes('{{price:'), 'the content carries a token to fill');
});

test('the tokens resolve to the amounts the owner holds', () => {
  const raw = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
  const filled = fillTokens(raw);

  const partnership = filled.pages.find((page) => page.kind === 'partnership');
  assert.ok(partnership, 'the partnership page is there');

  for (const kind of ['partnership', 'ai-partner']) {
    const offer = resourceOffer(kind);
    assert.ok(
      partnership.solution.includes(offer.offer),
      `the prose names the ${kind} offer the owner holds`,
    );
    assert.ok(
      partnership.solution.includes(offer.price),
      `the prose states the ${kind} price the owner holds`,
    );
  }
});

test('a token that names no offer is a broken build, not a blank sentence', () => {
  assert.throws(
    () => fillText('The offer is {{price:no-such-offer}}.'),
    /names an offer that does not exist/,
  );
});

test('no file outside the owner states a resource offer price', () => {
  const restated = [];

  for (const file of covered) {
    const code = codeOf(file);
    if (!isAboutResources(code)) continue;

    for (const price of ownedPrices) {
      if (code.includes(price)) restated.push(`${path.relative(repoRoot, file)}: ${price}`);
    }
  }

  assert.deepEqual(
    restated,
    [],
    `a resource offer price is written out outside its owner: ${restated.join(', ')}`,
  );
});
