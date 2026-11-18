// Offline boundary tests. No network, database writes, or messages are sent.
//
// A local production env dump sat in the production root: `env.production`,
// the file a `vercel env pull` writes. It carries the live Stripe secret,
// the Supabase service-role key, the Resend key and the Telegram token.
//
// It was ignored only by this machine's `.git/info/exclude` — a file that
// lives in `.git/` and is never committed. On a fresh clone the dump would
// have been an ordinary untracked file, and `git add -A` would have committed
// every secret in it. The mirror made the same risk twice: `web/` is a copy
// of `Website/`, and `web/env.production` is not covered by the repository's
// ignore rules at all.
//
// So the dump is now ignored by rules that are committed, and the mirror is
// told never to carry it. These tests defend that: a rule that ignores a
// local env dump is committed and covers both trees, the mirror excludes
// it, and nothing in the repository is itself an env dump.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(here, '..');
const repoRoot = path.join(appRoot, '..');

/** The name a local production env dump is written under. */
const DUMP = 'env.production';

/** The trees that carry their own ignore rules. */
const ignoreFiles = [
  { tree: 'Website', file: path.join(appRoot, '.gitignore') },
  { tree: 'web', file: path.join(repoRoot, 'web', '.gitignore') },
  { tree: 'repository', file: path.join(repoRoot, '.gitignore') },
].filter((entry) => fs.existsSync(entry.file));

/** The script that copies one tree onto the other. */
const syncScript = path.join(repoRoot, 'scripts', 'sync-trees.sh');

/** Is this a git checkout we may ask questions of? */
const inGitCheckout = (() => {
  try {
    execFileSync('git', ['rev-parse', '--git-dir'], { cwd: repoRoot, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

/** What git says about a path. `null` when git cannot answer. */
function gitCheckIgnore(relative) {
  if (!inGitCheckout) return null;
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', relative], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    return true;
  } catch (error) {
    if (error && error.status === 1) return false;
    return null;
  }
}

/** The rules an ignore file states, without its comments and blanks. */
function rulesOf(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.replace(/^\//, ''));
}

/** Does any stated rule cover a name that is not an env dump? */
function rulesCover(rules, name) {
  return rules.some((rule) => {
    if (rule.endsWith('/')) return false;
    const pattern = rule.replace(/\/+$/, '');
    if (pattern.includes('*')) {
      const expression = pattern
        .split('*')
        .map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
      return new RegExp(`^${expression}$`).test(name);
    }
    return pattern === name;
  });
}

test('every tree that carries ignore rules ignores a local env dump', () => {
  assert.ok(ignoreFiles.length > 0, 'the trees carry ignore rules');

  for (const { tree, file } of ignoreFiles) {
    assert.ok(
      rulesCover(rulesOf(file), DUMP),
      `${tree}/.gitignore states no rule that covers ${DUMP}`,
    );
  }
});

test('the repository ignores a local env dump', () => {
  const checked = gitCheckIgnore(`Website/${DUMP}`);
  if (checked === null) return;

  assert.ok(checked, `the repository does not ignore ${DUMP}`);
});

test('the rules that ignore a dump do not ignore ordinary source', () => {
  const ordinary = 'src/lib/env-validation.ts';

  for (const { tree, file } of ignoreFiles) {
    assert.ok(
      !rulesCover(rulesOf(file), ordinary),
      `${tree}/.gitignore would ignore ${ordinary}`,
    );
  }

  const checked = gitCheckIgnore(`Website/${ordinary}`);
  if (checked !== null) {
    assert.equal(checked, false, `the repository ignores ${ordinary}`);
  }
});

test('no tracked file in the repository is an env dump', () => {
  if (!inGitCheckout) return;

  const tracked = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const dumps = tracked.filter((file) => {
    const name = path.basename(file);
    if (/\.(template|example|sample)$/.test(name)) return false;
    return name.startsWith('.env') || /^env\..+$/.test(name);
  });

  assert.deepEqual(dumps, [], `the repository tracks an env dump: ${dumps.join(', ')}`);
});

test('the mirror is never given a local env dump', () => {
  if (!fs.existsSync(syncScript)) return;

  const script = fs.readFileSync(syncScript, 'utf8');
  const excludes = script
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('--exclude'))
    .map((line) => line.replace(/^.*--exclude\s+/, '').replace(/^['"]|['"]$/g, ''));

  assert.ok(
    excludes.some((pattern) => rulesCover([pattern], DUMP)),
    `the mirror script excludes no rule that covers ${DUMP}: ${excludes.join(', ')}`,
  );
  assert.ok(
    excludes.some((pattern) => rulesCover([pattern], '.env.local')),
    'the mirror script does not exclude .env.local',
  );
});

test('the scan is not vacuous', () => {
  assert.deepEqual(
    rulesCover(['env.*'], DUMP) ? [DUMP] : [],
    [DUMP],
    'the rule matcher does not find a dump',
  );
  assert.deepEqual(
    rulesCover(['env.*'], 'environment.ts') ? ['environment.ts'] : [],
    [],
    'the rule matcher fires on an ordinary file',
  );
  assert.equal(
    rulesCover(['.env*'], DUMP),
    false,
    'the rule matcher does not mistake one rule for another',
  );
});
