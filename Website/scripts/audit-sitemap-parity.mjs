#!/usr/bin/env node
/**
 * Sitemap-parity gate: the sitemap and llms.txt must agree with the routes
 * that actually ship.
 *
 * Why this exists
 *
 * /market/ renders `index, follow`, declares its own canonical
 * (https://secretimperium.com/market) and its own title/description — it is
 * a public page that asks to be indexed. It was absent from BOTH
 * sitemap.xml and llms.txt: the page asked to be indexed and was never
 * offered, to a crawler or to an LLM retriever.
 *
 * Nothing in the toolchain could see it. `tsc` cannot (the page is valid),
 * `next build` cannot (the route builds fine), the existing audit scripts
 * cannot (they cover cron auth, relays, purchases, coaching offers,
 * resources, ownership and legal contact — none of them read the sitemap).
 *
 * The general form: a contract between two artifacts is only enforced if
 * something compares them. The sitemap, llms.txt and the route tree are
 * three artifacts that all answer "what is public on this site?", and
 * nothing compared them.
 *
 * What this gate checks (statically, from source)
 *
 *   indexable-route-not-in-sitemap  a route that asks to be indexed and the
 *                                   sitemap never names it
 *   sitemap-url-without-route      a URL the sitemap advertises that no
 *                                   route serves
 *   sitemap-url-noindex            a URL the sitemap advertises whose route
 *                                   resolves to noindex
 *   sitemap-url-disallowed         a URL the sitemap advertises that
 *                                   app/robots.ts disallows
 *   llms-url-without-route         a URL llms.txt advertises that no route
 *                                   serves
 *   llms-url-noindex               a URL llms.txt advertises whose route
 *                                   resolves to noindex
 *   llms-url-disallowed            a URL llms.txt advertises that
 *                                   app/robots.ts disallows
 *
 * Deliberately NOT checked
 *
 *   - Dynamic sitemap rows (newsletter articles, archive entries). They are
 *     produced from data at runtime, so their URLs are not knowable from
 *     source. The route they hang off (`/newsletter/[slug]`,
 *     `/archive/[slug]`) is still checked for existence.
 *   - Completeness of llms.txt against the sitemap. llms.txt is a curated
 *     manifest for LLM retrievers, not a second sitemap; it does not have
 *     to list every public page, and legal pages (/privacy, /terms) are not
 *     required there. What llms.txt must not do is point at dead, noindex
 *     or disallowed URLs.
 *
 * Excluded from the "indexable route must be in the sitemap" check
 *
 *   - Routes with `index: false` / `noindex` in the page or any ancestor
 *     layout (Next merges metadata down the layout chain).
 *   - Redirect-only pages (the page calls redirect()/permanentRedirect()).
 *   - Routes redirected by next.config.ts (the URL never renders).
 *   - Dynamic segments — their concrete URLs come from data.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

const APP_DIR = fileURLToPath(new URL("../src/app/", import.meta.url));
const NEXT_CONFIG = fileURLToPath(new URL("../next.config.ts", import.meta.url));
const SITE_ORIGIN = "https://secretimperium.com";

/** @type {{rule: string, detail: string}[]} */
const failures = [];
const fail = (rule, detail) => failures.push({ rule, detail });

// ── path helpers ───────────────────────────────────────────────────────────

/** Normalise a URL path: leading slash, no trailing slash (except root). */
function norm(p) {
  if (!p) return "/";
  let s = p.startsWith("/") ? p : `/${p}`;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function segments(p) {
  return p.split("/").filter(Boolean);
}

// ── route table ────────────────────────────────────────────────────────────

function listDirs(dir) {
  const out = [dir];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const p = join(dir, entry.name);
    out.push(...listDirs(p));
  }
  return out;
}

/** Route path for a directory, ignoring route groups `(x)` and `_private`. */
function routeOf(dir) {
  const rel = relative(APP_DIR, dir);
  const kept = rel
    .split(sep)
    .filter((s) => s && !(s.startsWith("(") && s.endsWith(")")) && !s.startsWith("_"));
  return `/${kept.join("/")}`;
}

/** Ancestor layout.tsx files, outermost first. */
function layoutChain(dir) {
  const files = [];
  let cur = APP_DIR;
  const rel = relative(APP_DIR, dir);
  for (const s of rel ? rel.split(sep) : []) {
    cur = join(cur, s);
    const layout = join(cur, "layout.tsx");
    if (existsSync(layout)) files.push(layout);
  }
  return files;
}

function isNoindex(src) {
  return /index:\s*false/.test(src) || /noindex/.test(src);
}

/** A page whose only job is to redirect somewhere else. */
function isRedirectOnly(src) {
  return /\b(?:permanent)?[Rr]edirect\(\s*["'`]/.test(src);
}

const routes = [];
for (const dir of listDirs(APP_DIR)) {
  const page = join(dir, "page.tsx");
  if (!existsSync(page)) continue;
  const pageSrc = readFileSync(page, "utf8");
  const chain = layoutChain(dir);
  const noindex = chain.some((f) => isNoindex(readFileSync(f, "utf8"))) || isNoindex(pageSrc);
  routes.push({
    route: norm(routeOf(dir)),
    dir,
    page,
    dynamic: segments(routeOf(dir)).some((s) => s.startsWith("[") && s.endsWith("]")),
    noindex,
    redirectOnly: isRedirectOnly(pageSrc),
  });
}

// ── next.config.ts redirects ───────────────────────────────────────────────

const cfg = readFileSync(NEXT_CONFIG, "utf8");

/** `source: "/exact"` literals. */
const exactRedirects = new Set(
  [...cfg.matchAll(/source:\s*"(\/[^"]*)"/g)].map((m) => norm(m[1])),
);

/** `["a","b"].map((section) => ({ source: `/${section}…` }))` groups. */
const sectionRedirects = [...cfg.matchAll(
  /\[\s*((?:"[^"]+"\s*,\s*)+"[^"]+")\s*\]\.map\(\(section\)\s*=>\s*\(\{\s*source:\s*`\/\$\{section\}([^`]*)`/g,
)].map((m) => ({
  names: [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
  suffix: m[2],
}));

function isConfigRedirected(route) {
  if (exactRedirects.has(route)) return true;
  for (const group of sectionRedirects) {
    for (const name of group.names) {
      const base = `/${name}`;
      if (group.suffix.startsWith("/:")) {
        // `/name/:path*` — the section and everything under it.
        if (route === base || route.startsWith(`${base}/`)) return true;
      } else if (route === base) {
        return true;
      }
    }
  }
  return false;
}

// ── robots.ts ──────────────────────────────────────────────────────────────

const robotsSrc = readFileSync(join(APP_DIR, "robots.ts"), "utf8");
const disallowBlock = robotsSrc.match(/disallow:\s*\[([\s\S]*?)\]/);
const disallowed = disallowBlock
  ? [...disallowBlock[1].matchAll(/"(\/[^"]*)"/g)].map((m) => m[1])
  : [];

const isDisallowed = (route) => disallowed.some((prefix) => route.startsWith(prefix));

// ── sitemap.ts ─────────────────────────────────────────────────────────────

const sitemapSrc = readFileSync(join(APP_DIR, "sitemap.ts"), "utf8");

/** Literal URLs written straight into the sitemap. */
const sitemapPaths = new Set();
for (const m of sitemapSrc.matchAll(/\$\{SITE_URL\}([^`]*)`/g)) {
  if (!m[1].includes("${")) sitemapPaths.add(norm(m[1]));
}
/** Array-driven path lists: `["resources", "resources/lead-franchise"]`. */
for (const m of sitemapSrc.matchAll(
  /\[\s*((?:"[^"]+"\s*,\s*)+"[^"]+")\s*\]\.map\(\(path\)\s*=>/g,
)) {
  for (const q of m[1].matchAll(/"([^"]+)"/g)) sitemapPaths.add(norm(`/${q[1]}`));
}

// ── llms.txt ───────────────────────────────────────────────────────────────

const llmsSrc = readFileSync(join(APP_DIR, "llms.txt", "route.ts"), "utf8");
const llmsPaths = new Set(
  [...llmsSrc.matchAll(new RegExp(`${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\/[^\\s)\`"']*)?`, "g"))]
    .map((m) => norm(m[1] || "/")),
);

// ── resolution ─────────────────────────────────────────────────────────────

/** Find the route that serves a URL path (static or dynamic pattern). */
function resolve(path) {
  const segs = segments(path);
  for (const r of routes) {
    const rsegs = segments(r.route);
    if (rsegs.length !== segs.length) continue;
    let ok = true;
    for (let i = 0; i < segs.length; i += 1) {
      const rs = rsegs[i];
      if (rs.startsWith("[") && rs.endsWith("]")) continue;
      if (rs !== segs[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return r;
  }
  return null;
}

/** Non-page URLs llms.txt may legitimately advertise (metadata endpoints). */
const METADATA_ROUTES = new Set(["/sitemap.xml", "/robots.txt", "/llms.txt"]);

// ── checks ─────────────────────────────────────────────────────────────────

for (const r of routes) {
  if (r.dynamic || r.noindex || r.redirectOnly) continue;
  if (isConfigRedirected(r.route)) continue;
  if (isDisallowed(r.route)) continue;
  if (!sitemapPaths.has(r.route)) {
    fail(
      "indexable-route-not-in-sitemap",
      `${r.route} renders indexable but the sitemap does not name it`,
    );
  }
}

for (const path of sitemapPaths) {
  if (METADATA_ROUTES.has(path)) continue;
  const r = resolve(path);
  if (!r) {
    fail("sitemap-url-without-route", `${path} is in the sitemap but no route serves it`);
    continue;
  }
  if (r.noindex) {
    fail("sitemap-url-noindex", `${path} is in the sitemap but its route resolves to noindex`);
  }
  if (isDisallowed(path)) {
    fail("sitemap-url-disallowed", `${path} is in the sitemap but robots.ts disallows it`);
  }
}

for (const path of llmsPaths) {
  if (METADATA_ROUTES.has(path)) continue;
  const r = resolve(path);
  if (!r) {
    fail("llms-url-without-route", `${path} is in llms.txt but no route serves it`);
    continue;
  }
  if (r.noindex) {
    fail("llms-url-noindex", `${path} is in llms.txt but its route resolves to noindex`);
  }
  if (isDisallowed(path)) {
    fail("llms-url-disallowed", `${path} is in llms.txt but robots.ts disallows it`);
  }
}

// ── report ─────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\n[sitemap-parity] ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  ${f.rule}: ${f.detail}`);
  console.error(
    "\nFix the source of truth (the route, the sitemap or llms.txt) — not this gate.\n",
  );
  process.exit(1);
}

console.log(
  `[sitemap-parity] ok — ${routes.length} routes, ${sitemapPaths.size} sitemap URLs, ${llmsPaths.size} llms.txt URLs`,
);
