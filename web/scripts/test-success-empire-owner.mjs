// Offline boundary tests. No network, database writes, or messages are sent.
//
// The resource pages wrote the contact number out three times: the `sms:`
// link, the `tel:` link, and the contact line under the hero — the first
// two as "+18014581756" and the third in a third spelling, "(801)
// 458-1756". `src/lib/success-empire.ts` already held the number, so the
// page had a copy of a thing that already had an owner, and nothing kept
// the copies agreeing with it.
//
// The owner is `src/lib/success-empire.ts`, and these tests defend it: the
// number has one home, the two spellings the owner holds are the same
// number, the pages read the owner, and a restatement of the contact
// number fails the build rather than waiting for a visitor to ring a
// number nobody is watching.
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

/** The one file the contact number is owned by. */
const ownerFile = path.join(appRoot, 'src', 'lib', 'success-empire.ts');

/** The page that used to carry three copies of the number. */
const resourceViewFile = path.join(appRoot, 'src', 'app', 'resources', 'ResourceView.tsx');

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
const { SUCCESS_EMPIRE } = ownerModule.exports;

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
 * A comment may *mention* the number while explaining why the number lives
 * where it does, and a comment states nothing to a visitor. A rule that
 * cannot tell a comment from a number teaches the reader to ignore it.
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

/** The digits of a number, with the country code and every mark removed. */
function digitsOf(value) {
  return String(value).replace(/\D/g, '');
}

/**
 * The national number, ten digits, without the country code.
 *
 * The owner holds the number twice — once for the links, which need the
 * country code, and once for the words on the page, which do not — and the
 * two have to be the same number.
 */
function nationalNumber(phone) {
  const digits = digitsOf(phone);
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

/**
 * A pattern that finds the number however it is written.
 *
 * "+18014581756", "801-458-1756", "(801) 458-1756", "801.458.1756" and
 * "8014581756" are the same number written five ways, and a rule that
 * only knew one of them would let the other four through.
 */
function numberPattern(national) {
  const groups = [national.slice(0, 3), national.slice(3, 6), national.slice(6)];
  const body = groups.map((group) => group.split('').join('[ \\t.\\-()]*')).join('[ \\t.\\-()]*');
  return new RegExp(`(?<![\\d.])(?:\\+?1)?[ \\t.\\-()]*${body}(?![\\d])`);
}

const national = nationalNumber(SUCCESS_EMPIRE.phone);
const number = numberPattern(national);

/** The number, written out in a file outside its owner. */
function restatements(code) {
  return code.match(number) ?? [];
}

test('the owner holds the contact number', () => {
  assert.match(SUCCESS_EMPIRE.phone, /^\+1\d{10}$/, 'the owner holds a dialable number');
  assert.match(SUCCESS_EMPIRE.displayPhone, /^\d{3}-\d{3}-\d{4}$/, 'the owner holds a readable number');
});

test('the two spellings the owner holds are the same number', () => {
  assert.equal(
    digitsOf(SUCCESS_EMPIRE.displayPhone),
    national,
    'the number the page says is the number the links dial',
  );
});

test('the resource page reads the owner rather than writing the number', () => {
  const code = codeOf(resourceViewFile);

  assert.ok(code.includes('SUCCESS_EMPIRE'), 'the page imports the owner');
  assert.ok(code.includes('SUCCESS_EMPIRE.phone'), 'the page dials the number the owner holds');
  assert.ok(code.includes('SUCCESS_EMPIRE.displayPhone'), 'the page says the number the owner holds');
});

test('no file outside the owner states the contact number', () => {
  const stated = [];

  for (const file of covered) {
    const found = restatements(codeOf(file));
    if (found.length > 0) {
      stated.push(`${path.relative(repoRoot, file)}: ${found.join(', ')}`);
    }
  }

  assert.deepEqual(
    stated,
    [],
    `the contact number is written out outside its owner: ${stated.join(', ')}`,
  );
});

test('the scan is not vacuous — it finds the number in any spelling', () => {
  for (const spelling of [
    '+18014581756',
    '18014581756',
    '801-458-1756',
    '(801) 458-1756',
    '801.458.1756',
    '801 458 1756',
    '8014581756',
  ]) {
    assert.equal(
      restatements(`const tel = "${spelling}";`).length,
      1,
      `the scan finds ${spelling}`,
    );
  }

  assert.deepEqual(
    restatements('const tel = "+12025550123";'),
    [],
    'the scan does not fire on an unrelated number',
  );
});
