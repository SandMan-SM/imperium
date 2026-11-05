import { createHash } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";
import { consumeRateWindow, requestIp } from "./rate-limit";

const PRODUCTION_ENDPOINT = "https://omnileadsagi.com/api/inbound/imperium/success-empire";
const LOCAL_ENDPOINT = "http://127.0.0.1:3002/api/inbound/imperium/success-empire";
const APPLICATION_URL = "https://secretimperium.com/apply/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RECORD_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE = "We couldn’t confirm your application. Please retry with the same details, or text us using Learn more.";

type Payload = { fullName: string; email: string; phone: string; message: string; submission_id: string; company_website: string; source: "imperium"; offer: "success_empire"; page_url: typeof APPLICATION_URL };
type Environment = Record<string, string | undefined>;
type Dependencies = { fetch: typeof fetch; token: () => Promise<string>; env: Environment; rateLimit: typeof consumeRateWindow; ip: typeof requestIp };
export type ApplicationResult = { status: number; body: Record<string, unknown>; retryAfter?: number };
const result = (status: number, body: Record<string, unknown>): ApplicationResult => ({ status, body });

export function isApplicationLocalBridge(request: Request, env: Environment = process.env): boolean {
  const url = new URL(request.url);
  return env.NODE_ENV === "development" && !env.VERCEL &&
    env.IMPERIUM_SUCCESS_EMPIRE_LOCAL_INTAKE_ENABLED === "1" &&
    (env.IMPERIUM_SUCCESS_EMPIRE_LOCAL_INTAKE_SECRET?.length || 0) >= 24 &&
    url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
    url.port === "3037" && ["/api/apply", "/api/apply/"].includes(url.pathname) && !url.search && !url.username && !url.password;
}

function allowedOrigin(request: Request, env: Environment): boolean {
  const allowed = new Set(["https://secretimperium.com", "https://www.secretimperium.com", "https://imperiumelite.com", "https://www.imperiumelite.com"]);
  if (env.VERCEL_URL) allowed.add(`https://${env.VERCEL_URL}`);
  if (isApplicationLocalBridge(request, env)) for (const host of ["127.0.0.1", "localhost", "[::1]"]) allowed.add(`http://${host}:3037`);
  return allowed.has(request.headers.get("origin") || "");
}

async function boundedJson(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length") || 0) > 8192) throw new Error("too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid_body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    length += chunk.value.byteLength;
    if (length > 8192) { await reader.cancel(); throw new Error("too_large"); }
    chunks.push(chunk.value);
  }
  const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("invalid_body");
  return body as Record<string, unknown>;
}

function parse(body: Record<string, unknown>): Payload | null {
  const text = (key: string) => typeof body[key] === "string" ? body[key].trim() : "";
  const fullName = text("fullName").replace(/\s+/g, " ");
  const email = text("email").toLowerCase();
  const phone = text("phone");
  const message = text("message");
  const submission_id = text("submission_id");
  const company_website = text("company_website");
  const digits = phone.replace(/\D/g, "").length;
  if (fullName.length < 2 || fullName.length > 120 || /[\u0000-\u001f]/.test(fullName) || !EMAIL.test(email) || email.length > 254 ||
    !/^[+\d() .-]{7,40}$/.test(phone) || digits < 7 || digits > 15 || message.length < 10 || message.length > 2000 ||
    /\u0000/.test(message) || !UUID.test(submission_id) || company_website.length > 200) return null;
  return { fullName, email, phone, message, submission_id, company_website, source: "imperium", offer: "success_empire", page_url: APPLICATION_URL };
}

export async function handleSuccessEmpireApplication(request: Request, overrides: Partial<Dependencies> = {}): Promise<ApplicationResult> {
  const deps: Dependencies = { fetch, token: getVercelOidcToken, env: process.env, rateLimit: consumeRateWindow, ip: requestIp, ...overrides };
  let payload: Payload | undefined;
  if (request.method !== "GET" && request.method !== "POST") return result(405, { ok: false, workflow_complete: false });
  if (request.method === "POST") {
    if (!allowedOrigin(request, deps.env)) return result(403, { ok: false, message: "Please submit your application from Imperium." });
    if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") || "")) return result(415, { ok: false, message: "Please use the application form." });
    const limited = deps.rateLimit(`success-empire:${deps.ip(request)}`);
    if (!limited.ok) return { ...result(429, { ok: false, message: "Please wait a little before trying again." }), retryAfter: limited.retryAfterSeconds };
    let body: Record<string, unknown>;
    try { body = await boundedJson(request); }
    catch (error) {
      return result(error instanceof Error && error.message === "too_large" ? 413 : 422, { ok: false, message: "Please check your application and try again." });
    }
    const parsed = parse(body);
    if (!parsed) return result(422, { ok: false, message: "Please enter your full name, a valid email and phone number, and a little about what you want to build." });
    payload = parsed;
  }
  const bridge = isApplicationLocalBridge(request, deps.env);
  const headers = new Headers({ "Content-Type": "application/json" });
  if (bridge) headers.set("x-imperium-success-empire-local-intake", deps.env.IMPERIUM_SUCCESS_EMPIRE_LOCAL_INTAKE_SECRET!);
  else {
    try {
      const token = await deps.token();
      if (!token) throw new Error("identity_unavailable");
      headers.set("Authorization", `Bearer ${token}`);
    } catch {
      return result(503, { ok: false, workflow_complete: false, message: "Applications are temporarily unavailable. Please try again shortly.", retryable: true });
    }
  }
  if (payload) headers.set("x-imperium-client-key", createHash("sha256").update(`imperium-success-empire:${deps.ip(request)}`).digest("hex"));
  try {
    const response = await deps.fetch(bridge ? LOCAL_ENDPOINT : PRODUCTION_ENDPOINT, {
      method: request.method, headers, body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(50_000), cache: "no-store", redirect: "error",
    });
    const data = await response.json();
    if (response.ok && data.ok === true && data.no_write === true && data.workflow_complete === false) {
      return result(200, { ok: true, no_write: true, workflow_complete: false });
    }
    const hasOwnerReceipt = typeof data.receipts?.owner_message_id === "string" && RECORD_UUID.test(data.receipts.owner_message_id);
    const hasCustomerReceipt = typeof data.receipts?.customer_message_id === "string" && RECORD_UUID.test(data.receipts.customer_message_id);
    const complete = request.method === "POST" && response.ok && data.ok === true && data.workflow_complete === true &&
      data.submission_id === payload?.submission_id && UUID.test(data.lead_id || "") && RECORD_UUID.test(data.crm_contact_id || "") &&
      typeof data.analytics_id === "string" && /^[1-9]\d*$/.test(data.analytics_id) && hasOwnerReceipt &&
      (hasCustomerReceipt || data.customer_suppressed === true);
    if (complete) return result(200, { ok: true, workflow_complete: true, submission_id: data.submission_id });
    const status = [409, 422, 429].includes(response.status) ? response.status : 503;
    const message = status === 422 ? "Please check your application details and try again." :
      status === 429 ? "We’ve received several applications from this connection. Please try again later." : MESSAGE;
    return result(status, { ok: false, workflow_complete: false, message, retryable: data.retryable === true });
  } catch {
    return result(503, { ok: false, workflow_complete: false, message: MESSAGE, retryable: true });
  }
}
