// Offline boundary tests. No network, database writes, or messages are sent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Module, { createRequire } from 'node:module';
import ts from 'typescript';

const file = fileURLToPath(new URL('../src/lib/server/success-empire-application.ts', import.meta.url));
const moduleRequire = createRequire(import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const relay = new Module(file);
relay.filename = file;
relay.require = (id) => {
  if (id === '@vercel/oidc') return { getVercelOidcToken: async () => { throw new Error('Unexpected identity access'); } };
  if (id === './rate-limit') return {
    consumeRateWindow: () => { throw new Error('Unexpected real rate limit'); },
    requestIp: () => { throw new Error('Unexpected IP access'); },
  };
  return moduleRequire(id);
};
relay._compile(compiled, file);
const { handleSuccessEmpireApplication: handle, isApplicationLocalBridge } = relay.exports;
const id = '2c415c73-978d-4d05-9e9e-9bfce137b42a';
const input = { fullName: 'Offline Test', email: 'offline@example.invalid', phone: '+12025550123', message: 'An offline test application.', company_website: '', submission_id: id };
const receipt = {
  ok: true, workflow_complete: true, submission_id: id,
  lead_id: '2635c00c-9ebd-4e01-852c-5fded9654943',
  crm_contact_id: '5d70ffdb-3f2f-1a4c-a02b-b59e9a62c3fd',
  analytics_id: '500001',
  receipts: { customer_message_id: 'a99b34db-4b14-4e23-9d87-80f0d601fe73', owner_message_id: 'b23c213a-b3f6-4ad5-b44d-0ccf4753c560' },
};
const bridge = { NODE_ENV: 'development', IMPERIUM_SUCCESS_EMPIRE_LOCAL_INTAKE_ENABLED: '1', IMPERIUM_SUCCESS_EMPIRE_LOCAL_INTAKE_SECRET: 'offline-only-secret-not-for-use-123' };
function request(body = input, { url = 'https://secretimperium.com/api/apply/', origin = 'https://secretimperium.com', method = 'POST', type = 'application/json' } = {}) {
  return new Request(url, { method, headers: { origin, 'content-type': type }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
function deps(response = receipt, status = 200, env = { NODE_ENV: 'production' }) {
  const calls = [];
  return {
    calls, env, token: async () => 'offline-identity', ip: () => '192.0.2.50',
    rateLimit: () => ({ ok: true, retryAfterSeconds: 0 }),
    fetch: async (url, options) => { calls.push({ url, options }); return Response.json(response, { status }); },
  };
}

test('only a fully receipted, matching application becomes visible success', async () => {
  const d = deps();
  const result = await handle(request(), d);
  assert.deepEqual(result, { status: 200, body: { ok: true, workflow_complete: true, submission_id: id } });
  assert.equal(d.calls.length, 1);
  assert.equal(d.calls[0].options.headers.get('authorization'), 'Bearer offline-identity');
  assert.match(d.calls[0].options.headers.get('x-imperium-client-key'), /^[a-f0-9]{64}$/);
});
test('caller cannot change the destination, tenant, offer, or attribution URL', async () => {
  const d = deps(receipt, 200, { ...bridge, NODE_ENV: 'production', VERCEL: '1', IMPERIUM_SUCCESS_EMPIRE_ENDPOINT: 'https://attacker.invalid' });
  await handle(request({ ...input, source: 'other', offer: 'other', page_url: 'https://attacker.invalid' }), d);
  assert.equal(d.calls[0].url, 'https://omnileadsagi.com/api/inbound/imperium/success-empire');
  const body = JSON.parse(d.calls[0].options.body);
  assert.equal(body.source, 'imperium'); assert.equal(body.offer, 'success_empire');
  assert.equal(body.page_url, 'https://secretimperium.com/apply/');
  assert.equal(d.calls[0].options.headers.has('x-imperium-success-empire-local-intake'), false);
});
test('dev bridge only accepts the fixed loopback route and port', async () => {
  for (const url of ['http://127.0.0.1:3037/api/apply/', 'http://localhost:3037/api/apply']) assert.equal(isApplicationLocalBridge(new Request(url), bridge), true);
  for (const url of ['https://127.0.0.1:3037/api/apply/', 'http://127.0.0.1:3001/api/apply/', 'http://example.com:3037/api/apply/', 'http://127.0.0.1:3037/api/apply/?test=1', 'http://127.0.0.1:3037/other']) assert.equal(isApplicationLocalBridge(new Request(url), bridge), false);
  assert.equal(isApplicationLocalBridge(new Request('http://127.0.0.1:3037/api/apply/'), { ...bridge, VERCEL: '1' }), false);
  const d = deps(receipt, 200, bridge);
  d.token = async () => { throw new Error('Bridge must not use production identity'); };
  assert.equal((await handle(request(input, { url: 'http://127.0.0.1:3037/api/apply/', origin: 'http://127.0.0.1:3037' }), d)).status, 200);
  assert.equal(d.calls[0].url, 'http://127.0.0.1:3002/api/inbound/imperium/success-empire');
});
test('identity failure and forged origins never forward', async () => {
  const d = deps();
  d.token = async () => { throw new Error('No identity'); };
  assert.equal((await handle(request(), d)).status, 503);
  assert.equal((await handle(request(input, { origin: 'https://attacker.invalid' }), d)).status, 403);
  assert.equal(d.calls.length, 0);
});
test('bad fields, oversized bodies, wrong content type, and rate limits fail before forwarding', async () => {
  const d = deps();
  for (const patch of [{ fullName: '' }, { email: 'invalid' }, { phone: '123' }, { phone: 'not-a-phone' }, { message: 'short' }, { submission_id: 'invalid' }]) assert.equal((await handle(request({ ...input, ...patch }), d)).status, 422);
  assert.equal((await handle(request('x'.repeat(8193)), d)).status, 413);
  assert.equal((await handle(request('{invalid'), d)).status, 422);
  assert.equal((await handle(request(input, { type: 'text/plain' }), d)).status, 415);
  const blocked = await handle(request(), { ...d, rateLimit: () => ({ ok: false, retryAfterSeconds: 300 }) });
  assert.equal(blocked.status, 429); assert.equal(blocked.retryAfter, 300);
  assert.equal(d.calls.length, 0);
});
test('no-write readiness and honeypot receipts cannot masquerade as an application', async () => {
  for (const method of ['GET', 'POST']) {
    const d = deps({ ok: true, no_write: true, workflow_complete: false });
    const result = await handle(request({ ...input, company_website: 'https://bot.invalid' }, { method }), d);
    assert.deepEqual(result.body, { ok: true, no_write: true, workflow_complete: false });
    assert.equal(d.calls[0].options.method, method);
  }
  assert.equal((await handle(request(undefined, { method: 'GET' }), deps())).body.ok, false);
});
test('any missing durable or notification receipt fails closed', async () => {
  const incomplete = [
    { ...receipt, submission_id: '11111111-1111-4111-8111-111111111111' },
    { ...receipt, workflow_complete: false }, { ...receipt, lead_id: null },
    { ...receipt, crm_contact_id: null }, { ...receipt, analytics_id: receipt.lead_id },
    { ...receipt, analytics_id: 500001 },
    { ...receipt, receipts: { ...receipt.receipts, customer_message_id: null } },
    { ...receipt, receipts: { ...receipt.receipts, owner_message_id: null } },
    { ...receipt, customer_suppressed: true, receipts: { customer_message_id: null, owner_message_id: null } },
  ];
  for (const body of incomplete) {
    const result = await handle(request(), deps(body));
    assert.equal(result.status, 503); assert.equal(result.body.workflow_complete, false);
  }
});
test('confirmed customer suppression still requires owner notification', async () => {
  const body = { ...receipt, customer_suppressed: true, receipts: { ...receipt.receipts, customer_message_id: null } };
  assert.equal((await handle(request(), deps(body))).status, 200);
});
test('upstream conflicts and throttles remain errors; transport and malformed responses are retryable', async () => {
  for (const status of [409, 422, 429]) assert.equal((await handle(request(), deps({ ok: false, retryable: true }, status))).status, status);
  for (const fetch of [async () => { throw new Error('timeout'); }, async () => new Response('not-json')]) {
    const result = await handle(request(), { ...deps(), fetch });
    assert.equal(result.status, 503); assert.equal(result.body.retryable, true);
  }
});
