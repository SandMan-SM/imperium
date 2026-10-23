#!/usr/bin/env node
/**
 * Schema drift check.
 *
 * Every `.from('<table>')` call in the app is a claim that the table exists.
 * Every column named in a `.select()`, `.insert()`, `.update()`, `.upsert()`
 * or `.eq()` on that table is a claim that the column exists. This script
 * checks both claims against the live Supabase schema and fails when the code
 * points at something that is not there.
 *
 * The site has shipped code against three tables that never existed
 * (`revenue`, `analytics`, `purchases`), and two more (`client_health`,
 * `newsletter_subscribers`) were still on the books. Every one of them was a
 * silent write failure: the query errored, the error was swallowed, and the
 * feature looked like it worked. The same class of bug happened with
 * columns: `profiles.referral_code`, `profiles.referred_by`,
 * `referrals.email` and `referrals.status` do not exist, and the referral
 * route failed on every call because of them.
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

/** PostgREST builder methods that keep a `.from()` chain alive. */
const CHAIN_METHODS = new Set([
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in',
    'contains', 'containedBy', 'overlaps', 'filter', 'order', 'limit',
    'range', 'single', 'maybeSingle', 'match', 'textSearch', 'not',
    'column', 'explain', 'csv', 'or', 'and',
]);

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

/**
 * Reads a balanced argument list starting at the opening parenthesis.
 * Returns the raw argument text and the index just past the closing paren.
 */
function readBalanced(source, openIndex) {
    let depth = 0;
    let index = openIndex;
    let quote = null;

    while (index < source.length) {
        const char = source[index];

        if (quote) {
            if (char === '\\') {
                index += 2;
                continue;
            }
            if (char === quote) quote = null;
            index += 1;
            continue;
        }

        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            index += 1;
            continue;
        }

        if (char === '(') depth += 1;
        else if (char === ')') {
            depth -= 1;
            if (depth === 0) {
                return { arg: source.slice(openIndex + 1, index), end: index + 1 };
            }
        }
        index += 1;
    }

    return null;
}

/**
 * Splits a comma separated list, ignoring commas nested inside brackets.
 */
function splitTopLevel(text) {
    const parts = [];
    let depth = 0;
    let quote = null;
    let current = '';

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];

        if (quote) {
            current += char;
            if (char === '\\') {
                current += text[index + 1] || '';
                index += 1;
                continue;
            }
            if (char === quote) quote = null;
            continue;
        }

        if (char === '"' || char === "'" || char === '`') {
            quote = char;
            current += char;
            continue;
        }

        if (char === '(' || char === '[' || char === '{') depth += 1;
        if (char === ')' || char === ']' || char === '}') depth -= 1;

        if (char === ',' && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) parts.push(current);
    return parts;
}

/**
 * Normalises a column reference. PostgREST JSON path filters name a column
 * plus a path (`payload->>stripe_event_id`); only the column is a column.
 */
function normalizeColumn(name) {
    const cut = name.indexOf('->');
    const column = (cut < 0 ? name : name.slice(0, cut)).trim();
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column) ? column.toLowerCase() : null;
}

/** Returns the literal string value of an argument, or null if it is dynamic. */
function literalString(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const first = trimmed[0];
    if (first !== "'" && first !== '"' && first !== '`') return null;
    if (trimmed.length < 2 || trimmed[trimmed.length - 1] !== first) return null;
    return trimmed.slice(1, -1);
}

/**
 * Extracts the column names referenced by a PostgREST select string.
 * Embedded resources (`products(name)`), aggregates (`count()`) and `*` are
 * skipped because they do not name a column of the queried table.
 */
function columnsFromSelect(argument) {
    const raw = literalString(argument);
    if (raw === null) return [];

    const columns = [];
    for (const segment of splitTopLevel(raw)) {
        const part = segment.trim();
        if (!part) continue;
        if (part.includes('(')) continue;
        if (part === '*') continue;
        if (part.includes('.')) continue;

        const name = part.split('::')[0].trim();
        const column = normalizeColumn(name);
        if (!column) continue;
        columns.push(column);
    }
    return columns;
}

/**
 * Extracts the column names used as keys of an insert/update/upsert payload.
 */
function columnsFromPayload(argument) {
    const trimmed = argument.trim();
    if (!trimmed) return [];

    // Unwrap an array of objects: `[ { ... }, { ... } ]`
    let body = trimmed;
    if (body.startsWith('[') && body.endsWith(']')) {
        body = body.slice(1, -1);
    } else if (!body.startsWith('{')) {
        return [];
    }

    const columns = [];
    for (const entry of splitTopLevel(body)) {
        const part = entry.trim();
        if (!part || part.startsWith('...')) continue;

        const colon = part.indexOf(':');
        if (colon < 0) continue;

        const key = part
            .slice(0, colon)
            .trim()
            .replace(/^["'](.*)["']$/, '$1')
            .trim();

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) continue;
        columns.push(key.toLowerCase());
    }
    return columns;
}

/**
 * Extracts the column names referenced by an `.or()` / `.and()` filter string
 * (`email.eq.foo,bio.eq.bar`).
 */
function columnsFromFilterString(argument) {
    const raw = literalString(argument);
    if (raw === null) return [];

    const columns = [];
    for (const segment of splitTopLevel(raw)) {
        const name = segment.trim().split('.')[0].trim();
        const column = normalizeColumn(name);
        if (!column) continue;
        columns.push(column);
    }
    return columns;
}

/**
 * Walks a `.from('<table>')` chain and collects every column it names.
 */
function columnsForChain(source, fromEnd) {
    const columns = new Set();
    let index = fromEnd;

    while (index < source.length) {
        const dot = source.indexOf('.', index);
        if (dot < 0) break;

        let cursor = dot + 1;
        while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;

        let name = '';
        while (cursor < source.length && /[a-zA-Z0-9_]/.test(source[cursor])) {
            name += source[cursor];
            cursor += 1;
        }

        if (!name || !CHAIN_METHODS.has(name)) break;

        while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;
        if (source[cursor] !== '(') break;

        const balanced = readBalanced(source, cursor);
        if (!balanced) break;

        const argument = balanced.arg;
        const split = argument.split(',');

        switch (name) {
            case 'select':
                for (const column of columnsFromSelect(split[0])) columns.add(column);
                break;
            case 'insert':
            case 'update':
            case 'upsert':
                for (const column of columnsFromPayload(argument)) columns.add(column);
                break;
            case 'or':
            case 'and':
                for (const column of columnsFromFilterString(split[0])) columns.add(column);
                break;
            case 'not':
            case 'column':
                for (const column of columnsFromFilterString(split[0])) columns.add(column);
                break;
            case 'match': {
                for (const column of columnsFromPayload(`{${split[0]}}`)) columns.add(column);
                break;
            }
            case 'textSearch':
            case 'filter': {
                const column = normalizeColumn(literalString(split[0]) || '');
                if (column) columns.add(column);
                break;
            }
            case 'eq':
            case 'neq':
            case 'gt':
            case 'gte':
            case 'lt':
            case 'lte':
            case 'like':
            case 'ilike':
            case 'is':
            case 'in':
            case 'contains':
            case 'containedBy':
            case 'overlaps':
            case 'order': {
                const column = normalizeColumn(literalString(split[0]) || '');
                if (column) columns.add(column);
                break;
            }
            default:
                break;
        }

        index = balanced.end;
    }

    return columns;
}

/** Finds every `.from('table')` reference and the columns it names. */
function findTableReferences() {
    const references = new Map();

    for (const file of listSourceFiles(SRC_ROOT)) {
        const source = readFileSync(file, 'utf8');
        const relative = file.replace(APP_ROOT, '');
        const pattern = /\.from\(\s*['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\s*\)/g;
        let match;

        while ((match = pattern.exec(source)) !== null) {
            const table = match[1];
            if (!references.has(table)) {
                references.set(table, { files: new Set(), columns: new Map() });
            }

            const entry = references.get(table);
            entry.files.add(relative);

            for (const column of columnsForChain(source, match.index + match[0].length)) {
                if (!entry.columns.has(column)) entry.columns.set(column, new Set());
                entry.columns.get(column).add(relative);
            }
        }
    }

    return references;
}

/** Fetches the live table names and columns from the PostgREST schema. */
async function fetchLiveSchema(url, key) {
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
    const definitions = spec.definitions || {};

    const tables = new Set();
    const columns = new Map();

    for (const [name, definition] of Object.entries(definitions)) {
        tables.add(name);
        const properties = (definition && definition.properties) || {};
        columns.set(name, new Set(Object.keys(properties).map((key) => key.toLowerCase())));
    }

    return { tables, columns };
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

    const { tables, columns } = await fetchLiveSchema(url, key);
    const references = findTableReferences();

    const missingTables = [];
    const missingColumns = [];

    for (const [table, entry] of references) {
        if (!tables.has(table)) {
            missingTables.push({ table, files: [...entry.files] });
            continue;
        }

        const known = columns.get(table);
        if (!known) continue;

        for (const [column, files] of entry.columns) {
            if (!known.has(column)) {
                missingColumns.push({ table, column, files: [...files] });
            }
        }
    }

    if (missingTables.length === 0 && missingColumns.length === 0) {
        const columnCount = [...references.values()].reduce(
            (total, entry) => total + entry.columns.size,
            0
        );
        console.log(
            `schema refs OK: ${references.size} tables and ${columnCount} column references checked, all present in the live database`
        );
        return;
    }

    if (missingTables.length > 0) {
        console.error(`schema drift: ${missingTables.length} referenced table(s) are missing:\n`);
        for (const { table, files } of missingTables) {
            console.error(`  ${table}`);
            for (const file of files) console.error(`      ${file}`);
        }
        console.error('');
    }

    if (missingColumns.length > 0) {
        console.error(
            `schema drift: ${missingColumns.length} referenced column(s) are missing:\n`
        );
        for (const { table, column, files } of missingColumns) {
            console.error(`  ${table}.${column}`);
            for (const file of files) console.error(`      ${file}`);
        }
        console.error('');
    }

    console.error(
        'These queries fail silently at runtime. Point the code at a table and column that exist.'
    );
    process.exit(1);
}

main().catch((error) => {
    console.error(`schema refs check failed: ${error.message}`);
    process.exit(2);
});
