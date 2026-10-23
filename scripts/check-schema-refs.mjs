#!/usr/bin/env node
/**
 * Schema drift check.
 *
 * Every `.from('<table>')` call in the app is a claim that the table exists.
 * This script checks those claims against the live Supabase schema and fails
 * when the code points at a table that is not there.
 *
 * The site has shipped code against three tables that never existed
 * (`revenue`, `analytics`, `purchases`), and two more (`client_health`,
 * `newsletter_subscribers`) were still on the books. Every one of them was a
 * silent write failure: the query errored, the error was swallowed, and the
 * feature looked like it worked.
 *
 * Usage:
 *   node scripts/check-schema-refs.mjs
 *
 * It reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the
 * app's .env.local. Nothing is written to the database.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = fileURLToPath(new URL('../Website/', import.meta.url));
const ENV_FILE = join(APP_ROOT, '.env.local');
const SRC_ROOT = join(APP_ROOT, 'src');
const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

/** Reads key=value pairs from a .env style file. */
function readEnvFile(path) {
    const env = {};
    let source;
    try {
        source = readFileSync(path, 'utf8');
    } catch {
        return env;
    }
    for (const line of source.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const index = trimmed.indexOf('=');
        if (index < 0) continue;
        const key = trimmed.slice(0, index).trim();
        const value = trimmed
            .slice(index + 1)
            .trim()
            .replace(/^["']|["']$/g, '');
        env[key] = value;
    }
    return env;
}

/** Lists every source file under a directory. */
function listSourceFiles(directory) {
    const files = [];
    for (const entry of readdirSync(directory)) {
        const path = join(directory, entry);
        if (statSync(path).isDirectory()) {
            files.push(...listSourceFiles(path));
        } else if (SCANNED_EXTENSIONS.has(extname(path))) {
            files.push(path);
        }
    }
    return files;
}

/** Finds every `.from('table')` reference in the source tree. */
function findTableReferences() {
    const references = new Map();
    for (const file of listSourceFiles(SRC_ROOT)) {
        const source = readFileSync(file, 'utf8');
        const pattern = /\.from\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\s*\)/g;
        let match;
        while ((match = pattern.exec(source)) !== null) {
            const table = match[1];
            if (!references.has(table)) references.set(table, new Set());
            references.get(table).add(file.replace(APP_ROOT, ''));
        }
    }
    return references;
}

/** Fetches the live table names from the PostgREST schema. */
async function fetchLiveTables(url, key) {
    const response = await fetch(`${url}/rest/v1/`, {
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Accept: 'application/openapi+json',
        },
    });
    if (!response.ok) {
        throw new Error(`Schema request failed with ${response.status}`);
    }
    const spec = await response.json();
    return new Set(Object.keys(spec.definitions || {}));
}

async function main() {
    const env = readEnvFile(ENV_FILE);
    const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Website/.env.local'
        );
        process.exit(2);
    }

    const liveTables = await fetchLiveTables(url, key);
    const references = findTableReferences();

    const missing = [];
    for (const [table, files] of references) {
        if (!liveTables.has(table)) {
            missing.push({ table, files: [...files] });
        }
    }

    if (missing.length === 0) {
        console.log(
            `schema refs OK: ${references.size} tables referenced, all present in the live database`
        );
        return;
    }

    console.error(`schema drift: ${missing.length} referenced table(s) are missing:\n`);
    for (const { table, files } of missing) {
        console.error(`  ${table}`);
        for (const file of files) console.error(`      ${file}`);
    }
    console.error(
        '\nThese queries fail silently at runtime. Point the code at a table that exists.'
    );
    process.exit(1);
}

main().catch((error) => {
    console.error(`schema refs check failed: ${error.message}`);
    process.exit(2);
});
