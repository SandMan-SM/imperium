#!/usr/bin/env node
/**
 * Federation protocol helper.
 *
 * The `federation` schema lives in the shared Supabase project but is not
 * exposed through PostgREST, so it can only be reached through the
 * service-role-only HTTPS wrappers:
 *
 *   hermes_federation_surface(domain)
 *   hermes_federation_acquire_lease(target, agent, kind, session, note, ttl)
 *   hermes_federation_renew_lease(lease_id, agent, ttl)
 *   hermes_federation_release_lease(lease_id, agent, action, detail)
 *   hermes_federation_log_change(agent, target, action, detail, lease_id)
 *
 * Usage:
 *   node scripts/federation.mjs surface <domain>
 *   node scripts/federation.mjs acquire <target> <agent> <kind> <session> <note> [ttl]
 *   node scripts/federation.mjs renew <leaseId> <agent> [ttl]
 *   node scripts/federation.mjs release <leaseId> <agent> <action> '<json detail>'
 *   node scripts/federation.mjs log <agent> <target> <action> '<json detail>' [leaseId]
 *
 * Reads the Supabase URL and service-role key from `Website/.env.local`.
 * Never prints the key.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');

function loadEnv() {
    for (const file of [join(repoRoot, 'Website', '.env.local'), join(repoRoot, '.env.local'), join(repoRoot, '.env')]) {
        if (!existsSync(file)) continue;
        for (const line of readFileSync(file, 'utf8').split('\n')) {
            const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
            if (!match) continue;
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!process.env[match[1]]) process.env[match[1]] = value;
        }
    }
}

loadEnv();

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(2);
}

async function rpc(name, payload) {
    const response = await fetch(`${URL_BASE.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
            apikey: KEY,
            Authorization: `Bearer ${KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        console.error(`${name} failed (${response.status}):`, JSON.stringify(body));
        process.exit(1);
    }
    return body;
}

const [, , command, ...rest] = process.argv;

if (command === 'surface') {
    console.log(JSON.stringify(await rpc('hermes_federation_surface', { p_domain: rest[0] }), null, 2));
} else if (command === 'acquire') {
    const [target, agent, kind, session, note, ttl] = rest;
    const lease = await rpc('hermes_federation_acquire_lease', {
        p_target: target,
        p_agent: agent,
        p_kind: kind,
        p_session_ref: session,
        // A missing note would be dropped from the payload and the call would
        // fail as an unknown function signature, which reads like a broken
        // script rather than a missing argument.
        p_note: note || session || 'no note given',
        p_ttl_minutes: Number(ttl || 45),
    });
    console.log(JSON.stringify(lease, null, 2));

    // A lease that is not granted is not permission, and a helper that
    // answers 0 when the lease is refused invites the caller to carry on.
    // Exit 3 says: somebody else is holding it.
    if (!lease?.granted) process.exit(3);
} else if (command === 'renew') {
    const [leaseId, agent, ttl] = rest;
    console.log(
        JSON.stringify(
            await rpc('hermes_federation_renew_lease', {
                p_lease_id: Number(leaseId),
                p_agent: agent,
                p_ttl_minutes: Number(ttl || 45),
            }),
            null,
            2,
        ),
    );
} else if (command === 'release') {
    const [leaseId, agent, action, detail] = rest;
    console.log(
        JSON.stringify(
            await rpc('hermes_federation_release_lease', {
                p_lease_id: Number(leaseId),
                p_agent: agent,
                p_action: action,
                p_detail: detail ? JSON.parse(detail) : {},
            }),
            null,
            2,
        ),
    );
} else if (command === 'log') {
    const [agent, target, action, detail, leaseId] = rest;
    console.log(
        JSON.stringify(
            await rpc('hermes_federation_log_change', {
                p_agent: agent,
                p_target: target,
                p_action: action,
                p_detail: detail ? JSON.parse(detail) : {},
                p_lease_id: leaseId ? Number(leaseId) : null,
            }),
            null,
            2,
        ),
    );
} else {
    console.error('usage: federation.mjs surface|acquire|renew|release|log ...');
    process.exit(2);
}
