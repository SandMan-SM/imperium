// Offline boundary tests. No network, database writes, or messages are sent.
//
// Two contact promises were being made that the site could not keep.
//
// The privacy policy named `privacy@imperium.ai`. imperium.ai is a domain
// parked for sale: it publishes a null MX ("0 ."), its nameservers are
// Afternic's, and it answers on a parking page. Mail sent to that address
// is refused by the domain itself. The terms policy promised "contact us
// at" and then named no channel at all.
//
// The admin console held the operator's personal address in the browser, as
// the recipient of a newsletter test send. The admin page is a client
// component, so that address was written into the page's JavaScript bundle
// and could be downloaded by anybody who asked the site for it.
//
// These tests defend the fix: the legal pages read one owner for the
// contact channel, no public page writes a contact address by hand, the
// operator's private address stays in a server-only module, and the parked
// domain never comes back.
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

/** The one file the public contact channels are owned by. */
const ownerFile = path.join(appRoot, 'src', 'lib', 'contact.ts');

/** The one file the operator's private details are owned by. */
const operatorFile = path.join(appRoot, 'src', 'lib', 'server', 'operator.ts');

/** The two pages that make a legal promise about how to reach a person. */
const legalPages = [
  path.join(appRoot, 'src', 'app', 'privacy', 'page.tsx'),
  path.join(appRoot, 'src', 'app', 'terms', 'page.tsx'),
];

const moduleRequire = createRequire(import.meta.url);
const loaded = new Map();

/**
 * Load a module of the app's own source.
 *
 * The app's imports are written with the `@/` alias, which the bundler
 * resolves and plain node does not, so the alias is resolved here: the
 * file is compiled from TypeScript and its own imports are loaded the same
 * way.
 */
function loadTs(file) {
  const resolved = path.resolve(file);
  if (loaded.has(resolved)) return loaded.get(resolved).exports;

  const compiled = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const instance = new Module(resolved);
  instance.filename = resolved;
  instance.require = (id) => {
    if (id.startsWith('@/')) {
      const target = path.join(appRoot, 'src', id.slice(2));
      return loadTs(fs.existsSync(target) ? target : `${target}.ts`);
    }
    return moduleRequire(id);
  };
  loaded.set(resolved, instance);
  instance._compile(compiled, resolved);
  return instance.exports;
}

/** Every file of a kind, under a directory. */
function filesOf(dir, pattern) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...filesOf(full, pattern));
    else if (pattern.test(entry.name)) found.push(full);
  }
  return found;
}

/**
 * The code of a file, with its comments dropped.
 *
 * A comment may mention a number or an address while explaining why it
 * lives where it does, and a comment states nothing to a reader. A rule
 * that cannot tell a comment from an address teaches the reader to ignore
 * it.
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

/** The digits of a number, with every mark removed. */
function digitsOf(value) {
  return String(value).replace(/\D/g, '');
}

/**
 * The national number, ten digits, without the country code.
 */
function nationalNumber(phone) {
  const digits = digitsOf(phone);
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

/** The domain the parked address was written on. */
const PARKED_DOMAIN = 'imperium.ai';

/** An address that is written out, in any file. */
const ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * Placeholders are not contact addresses.
 *
 * A form that says "you@example.com" is telling the reader what to type.
 * It is not the site publishing a mailbox, and a rule that fired on it
 * would be a rule that fires on nothing.
 */
function isPlaceholder(address) {
  return /^(your|you|test|someone|example|name|email)@/i.test(address) ||
    /@(example|email|test)\.(com|org|net)$/i.test(address);
}

/** The site's public surface: the pages a reader can open, and the parts. */
const publicSurface = [
  ...filesOf(path.join(appRoot, 'src', 'app'), /\.tsx?$/),
  ...filesOf(path.join(appRoot, 'src', 'components'), /\.tsx?$/),
].filter((file) => !file.includes(`${path.sep}admin${path.sep}`));

/** Every source file of the app, and the scripts beside it. */
const allSource = [
  ...filesOf(path.join(appRoot, 'src'), /\.(ts|tsx|mjs|json)$/),
  ...filesOf(path.join(repoRoot, 'scripts'), /\.(ts|tsx|mjs)$/).filter((file) => !file.includes('node_modules')),
];

const { CONTACT } = loadTs(ownerFile);
const { OPERATOR } = loadTs(operatorFile);

test('the owner holds a contact channel a reader can use', () => {
  assert.match(CONTACT.phone, /^\+1\d{10}$/, 'the owner holds a dialable number');
  assert.match(CONTACT.displayPhone, /^\d{3}-\d{3}-\d{4}$/, 'the owner holds a readable number');
  assert.equal(CONTACT.tel, `tel:${CONTACT.phone}`, 'the link dials the number the owner holds');
  assert.ok(CONTACT.organisation.length > 0, 'the owner names who is being contacted');
});

test('the two spellings the owner holds are the same number', () => {
  assert.equal(
    digitsOf(CONTACT.displayPhone),
    nationalNumber(CONTACT.phone),
    'the number the page says is the number the link dials',
  );
});

test('the legal pages read the owner rather than writing the channel', () => {
  for (const page of legalPages) {
    const code = codeOf(page);

    assert.ok(code.includes('CONTACT'), `${path.relative(repoRoot, page)} imports the owner`);
    assert.ok(code.includes('CONTACT.displayPhone'), `${path.relative(repoRoot, page)} states the number the owner holds`);
    assert.ok(code.includes('CONTACT.tel'), `${path.relative(repoRoot, page)} links the number the owner holds`);
  }
});

test('no public page writes a contact address by hand', () => {
  const written = [];

  for (const file of publicSurface) {
    const found = (codeOf(file).match(ADDRESS) ?? []).filter((address) => !isPlaceholder(address));
    if (found.length > 0) written.push(`${path.relative(repoRoot, file)}: ${found.join(', ')}`);
  }

  assert.deepEqual(
    written,
    [],
    `a public page writes a contact address by hand: ${written.join(', ')}`,
  );
});

test('the mail the site sends can be answered', () => {
  const resend = codeOf(path.join(appRoot, 'src', 'lib', 'resend.ts'));
  const route = codeOf(path.join(appRoot, 'src', 'app', 'api', 'newsletter', 'send', 'route.ts'));
  const admin = codeOf(path.join(appRoot, 'src', 'app', 'admin', 'page.tsx'));

  assert.ok(resend.includes('replyTo'), 'the mail carries a reply address');
  assert.ok(resend.includes('OPERATOR.email'), 'the reply address is the operator’s own mailbox');
  assert.ok(route.includes('OPERATOR.email'), 'the server chooses where a test send goes');
  assert.ok(!admin.includes('testEmail'), 'the browser does not carry the recipient');
});

test('the operator’s private address stays in a server-only module', () => {
  const exposed = [];

  for (const file of allSource) {
    if (file === operatorFile) continue;
    if (file.includes(`${path.sep}lib${path.sep}server${path.sep}`)) continue;
    if (codeOf(file).includes(OPERATOR.email)) {
      exposed.push(path.relative(repoRoot, file));
    }
  }

  assert.deepEqual(
    exposed,
    [],
    `the operator’s address is outside the server module: ${exposed.join(', ')}`,
  );
});

test('the parked domain never comes back', () => {
  const named = [];

  for (const file of allSource) {
    if (codeOf(file).includes(PARKED_DOMAIN)) named.push(path.relative(repoRoot, file));
  }

  assert.deepEqual(
    named,
    [],
    `${PARKED_DOMAIN} is named again: ${named.join(', ')}`,
  );
});

test('the scans are not vacuous', () => {
  const addresses = (code) => (code.match(ADDRESS) ?? []).filter((address) => !isPlaceholder(address));

  assert.deepEqual(
    addresses('const email = "privacy@imperium.com";'),
    ['privacy@imperium.com'],
    'the scan finds a written address',
  );
  assert.deepEqual(
    addresses('const email = "you@example.com";'),
    [],
    'the scan does not fire on a placeholder',
  );
  assert.ok(
    'const email = "privacy@imperium.ai";'.includes(PARKED_DOMAIN),
    'the parked-domain scan finds the parked domain',
  );
});
