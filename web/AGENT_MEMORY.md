# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: October 25, 2026 11:35 PM
> READ THIS FIRST. Never repeat completed work.
> **THIS FILE IS THE CANONICAL BRIEF.** `web/AGENT_MEMORY.md` is a mirror.
> **PRODUCTION BUILDS `Website/`, NOT `web/`.** Vercel project `imperium`
> (prj_rbnO8QZmuJtlDpWlGYE1tcYkwx3o), rootDirectory `Website`,
> deploy_method `git-push`, productionBranch `main`, region `iad1`,
> live at `https://secretimperium.com`.
> **`web/` IS A BYTE-IDENTICAL MIRROR OF `Website/`.** Edit either, then run
> `scripts/sync-trees.sh`. `scripts/sync-trees.sh --check` fails on drift and
> CI (`.github/workflows/check-tree-sync.yml`) enforces it on every push.

## 📊 Health Scores
| Metric | Score | Bar |
|---|---|---|
| Build | 99/100 | █████████░ |
| SEO | 93/100 | █████████░ |
| Performance | 92/100 | █████████░ |
| Backend | 98/100 | █████████░ |
| Mobile | 97/100 | █████████░ |
| **OVERALL** | **96/100** | █████████░ |

## ✅ What Last Session Shipped
The membership the site sells is now a **working product**, not a promise:
- `/principles/` is the gated member surface. The 28 lessons live in
  `lib/curriculum.ts` (server-only); `/api/principles` releases the free
  unit to anonymous readers and all 28 to a paying member. A locked unit has
  **no body on the client at all** — it was never sent.
- `/api/account/register` opens an account for someone who has already
  paid: the checkout session id proves the address, so the account is
  created confirmed and the member signs in immediately (see the
  `paid-path-registration-without-email-confirmation` runbook).
- The Stripe webhook now links a member's `stripe_customer_id` onto the
  **account** row, and finds the profile by Stripe customer id with a
  fallback to the customer's email, so renewals and cancellations land on
  the right person.
- `/login` and `/signup` are reachable again, restyled to the live
  editorial theme, and linked from the header.

## 🎯 This Session: Do These In Order
1. **Get the operator's own card through the checkout once.** The whole
   write path is proven — the webhook fires, the purchase lands in
   `inbound_imperium_events`, the profile flips to premium, the curriculum
   opens. What has never happened is a **real** purchase: the account still
   shows **100+ checkout sessions, every one expired and unpaid, zero
   customers, zero subscriptions** (99 created in a single second on
   2026-10-18 against the $20 price). Sessions are being created; nobody
   finishes them. The canonical link is
   `https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07`
   (`lib/brand.ts` → `STRIPE_CHECKOUT_URL`), and it now redirects to
   `https://secretimperium.com/principles/?activated=1&session_id={CHECKOUT_SESSION_ID}`.
   Watch the funnel: if sessions are created and abandoned, the checkout
   page is the problem, not the site.
2. **Bring the Telegram bot into the same membership.** The bot still keeps
   its own SQLite `is_premium` flag and never collected an email, so a
   member who buys on the website gets nothing in Telegram. The bridge now
   exists on the website side (`profiles` + Stripe); the bot needs to look
   the same address up instead of its local flag.
3. **The council items are recorded, not fixed.** They are written up in
   omni-memory under `client.imperium / council-items-2026-10-25-fleet-security-and-schema`
   (the five RLS-disabled tables, the anon-executable SECURITY DEFINER
   functions, the `subscriptions`/`referrals` policy contradiction) and
   `products.slug` (the migration decision). Both need a council decision,
   not an autonomous fix. **Do not change shared fleet tables.**
4. **Keep Preview in step with Production.** Both carry the same 24 vars
   (verified by name this session). Any new Production env var must be
   added to Preview in the same session, or previews break silently again.
   Note: **sensitive Vercel env vars are write-only** — neither
   `vercel env pull` nor `?decrypt=true` returns a value. To mirror one
   without reading it, extend the target list of the existing Production
   record to include `preview` instead of creating a new record.
5. **The newsletter still has no member.** The membership buys the
   curriculum and progress, but the weekly letter — the thing the price
   page promises — is still a separate free signup. Decide whether the
   membership should carry it, and if so, how a paying member's address
   reaches the send list.

## 🔬 Why
- **The membership had no product behind it.** The Stripe webhook set
  `profiles.is_premium` and nothing read it. The curriculum lived only in
  `telegram-bot/` behind a local SQLite flag that no checkout could reach.
  Now `lib/curriculum.ts` is a server module and `/api/principles` is the
  only way out of it, so the content is gated by the ledger rather than by
  the UI: a locked unit is never sent to the browser at all.
- **The email confirmation was the last thing standing between a paying
  member and the curriculum.** Supabase runs this project with
  `mailer_autoconfirm: false` on a rate-limited default SMTP, so a new
  account sat dormant until a confirmation email arrived — and on the one
  weekend that matters, it does not arrive. The paid path no longer waits
  for it: the checkout session proves the address.
- **A Stripe subscription can exist before its first checkout session**, and
  a customer can exist without one. A renewal or a cancellation was looked
  up by `stripe_customer_id` alone, so an event for a member whose profile
  row had never been stamped with the customer id went nowhere. The lookup
  now falls back to the customer's email and writes the id onto the account
  row.
- **The account row and the purchase row are two different rows.** The
  signup trigger creates a row with `auth_id` for the same address that the
  webhook already wrote a row for, and `profiles.email` has no unique
  constraint. Every read of "the member's profile" therefore has to read
  all rows for the address, and the Stripe id belongs on the row that
  carries `auth_id` — that is the row the site reads.
- **The fleet's RLS policies, not the app, decided what the site could
  read.** `profiles` has a policy that subqueries `profiles`, so every
  authenticated read of that table dies with Postgres error 42P17 ("infinite
  recursion detected in policy"), and an anonymous read is blocked outright.
  `products` has only an UPDATE policy for `public`, so no browser read
  returns a row. `newsletters` inherits the same recursion. The admin
  console therefore showed blank tables, every premium check read `null`,
  and `/api/subscriptions` answered "Unauthorized" to everybody. All of
  those reads now happen server side with the service-role key, behind the
  operator's session token.
- `profiles.id` is a **different uuid** from `profiles.auth_id`, and the
  `subscriptions` / `referrals` foreign keys point at `profiles(id)` while
  their RLS policies compare them to `auth.uid()`. The two can never both be
  true, so those tables are writable only with the service-role key.
- The previous brief's claim that "the anon key can SELECT `profiles` (24
  rows with email + stripe ids), `products`, `transactions` and
  `user_interactions`" is **not reproducible** — an anon read returns zero
  rows on all four. The real exposures are narrower and different; they are
  listed under "Council items".
- The schema guard checked table names only, so four phantom *columns*
  (`profiles.referral_code`, `profiles.referred_by`, `referrals.email`,
  `referrals.status`) slipped through and made the referral route fail on
  every call. It now checks columns as well, and reports 19 tables and 48
  column references.
- The Preview environment had no Supabase, Stripe or Resend values for 240
  days; every preview data route 500'd. All 17 non-empty Production values
  are now mirrored into Preview (sensitive, all branches) and verified with a
  real preview deployment.
- `web/` had drifted 51 changed files away from the production root and was
  missing the entire Archive rebrand. It is now an exact mirror, guarded by a
  script and a CI check, so a session can no longer ship a no-op fix into the
  tree that does not deploy.
- The live database has **no `revenue`, `analytics` or `purchases` table**.
  The analytics endpoint read `revenue` (500 on every request) and the Stripe
  webhook inserted into `purchases` (silently discarded). Both now read and
  write tables that actually exist.
- A second sweep found three more tables the code referenced that do not
  exist: `client_health` (the admin Client Health tab and the metrics
  refresh route), `newsletter_subscribers` (in a dead Gmail service), and
  `revenue_analytics` (an unread query in the admin analytics tab). The
  health tab now derives from `profiles`, the metrics route computes live,
  and the dead Gmail service is deleted.
- The Stripe webhook's replay guard never worked: the `events` table has no
  `payload` column, so both the insert and the `payload->>stripe_event_id`
  filter errored and were swallowed. It now uses `properties`, the column the
  table actually has, with the required `actor_type` / `actor_id` fields.
- `npm run lint` reported 279 errors across 56 files. It is now clean:
  `no-explicit-any` replaced with real types, unused imports removed, JSX
  entities escaped, React Compiler hook rules fixed properly.
- Live visual audit at 375 / 768 / 1440 px: no horizontal overflow, no
  console errors, no dead internal links, every image reference resolves.
- **The editorial artwork shipped as PNG.** Sixteen illustrations totalling
  roughly 44 MB were served raw (`next.config.ts` sets
  `images.unoptimized: true`), so a single 375 px archive load pulled about
  24 MB. All sixteen are now WebP (about 1.5 MB total) and the markup points
  at them. The PNG originals stay in `public/` because `next/og` cannot
  decode WebP — `getArchiveArtwork()` returns both a display and an OG
  source for that reason.
- **The checkout success URL pointed at `localhost`.**
  `/api/checkout/create-session` fell back to `http://localhost:3000`
  because `NEXT_PUBLIC_BASE_URL` is not set in the Vercel environment, so a
  completed order landed on a dead address. It now falls back to
  `BRAND.siteUrl`.
- **The live site could not take a payment.** Every commerce route
  (`/28principles`, `/shop`, `/account`, `/cart`, `/checkout`, `/login`,
  `/signup`, `/portal`, `/subscribe`) redirects to `/archive/`, and the
  archive carried no price, no Stripe link and no call to action — the only
  `STRIPE_CHECKOUT_URL` usage rendered on a redirected page. One membership
  block now sits on the homepage, the archive and the newsletter, linking the
  canonical payment link from `lib/brand.ts` and restating exactly what the
  Stripe product sells, so the page and the checkout page cannot disagree.
- **The storefront decision, taken.** The Archive rebrand is the product;
  the old storefront routes stay retired behind their redirects, because
  `/subscribe` is a free newsletter form with no Stripe link and
  `/28principles` is a bare `permanentRedirect` stub (`lib/curriculum.ts` was
  deleted). The Archive stays free and the paid tier is sold through one
  block, not through a resurrected multi-route storefront.
- **The 28 Principles now live in the Archive, on the website and in the
  bot.** Eight principle essays are published free in the Archive's
  "Principles" collection. The full five-phase curriculum is now a gated
  website surface at `/principles/`, and `telegram-bot/` still carries its
  own copy behind a local SQLite flag that no checkout reaches — that
  bridge is the next priority.

## 🚨 Council items — do not fix these autonomously
These are findings in **shared fleet tables**, not in this app. Changing any
of them is a migration and needs a council decision. They are written up in
full in omni-memory under
`client.imperium / council-items-2026-10-25-fleet-security-and-schema`,
with the `products.slug` migration decision in the same entry. **Recorded
2026-10-25 — do not re-raise without a decision.**
1. **42P17 policy recursion on `profiles`.** `profiles_admin_modify_all`
   (roles `{authenticated}`, cmd ALL) contains `EXISTS (SELECT 1 FROM profiles
   me WHERE me.auth_id = auth.uid() AND me.is_admin = true)` — a self
   reference. Every authenticated SELECT/UPDATE/INSERT on `profiles` fails,
   and `newsletters` fails with it through its "premium users can read
   private newsletters" policy. Reproduced with `set role authenticated` and
   with a real signed-in token, admin token included.
2. **Five tables have RLS disabled entirely**, so `anon` can read *and
   write* them: `booking_submissions` (17 rows — name, email, phone,
   business name, raw payload), `newsletter_star_credit_claims` (4),
   `newsletter_star_credit_events` (4), `omni_program_credit_events` (3),
   `omni_program_signatures` (5 — signer email, ip address, user agent).
3. **`dashboard_crm_leads()` is anon-executable and `SECURITY DEFINER`.** It
   returns 535 rows of cross-tenant lead PII (email and phone) across 28
   tenant lead and contact tables, including Imperium's own
   `inbound_imperium_leads`. Its internal `request.jwt.claims` guard does not
   stop the anon path. `prime_iv_upsert_subscriber` is likewise anon-writable
   — an anon call inserted a real row into
   `inbound_prime_iv_newsletter_subscribers`.
4. **`subscriptions` and `referrals` policies contradict their foreign
   keys.** The policies compare `profile_id` / `referrer_id` with
   `auth.uid()`, but the columns reference `profiles(id)`, and `profiles.id`
   is a separate uuid from `profiles.auth_id`. No authenticated user can
   write either table.

## 📚 Stats
- Sessions: 50
- Lines written: 3900

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
| 2026-10-25 | revenue | `/api/account/register`: a paid Stripe checkout session proves the address, so the account is created confirmed and the member signs in immediately instead of waiting on a rate-limited confirmation email. An existing account is never modified. The signup form branches on `session_id` and falls back to `supabase.auth.signUp` for the unpaid path | ~190 |
| 2026-10-25 | backend | The Stripe webhook now finds a member's profile by Stripe customer id and falls back to the customer's email, writing the id onto the row that carries `auth_id` — so a renewal or a cancellation lands on the right account row even when no checkout session ever stamped the id | ~120 |
| 2026-10-25 | commerce | The Stripe webhook endpoint now also subscribes to `customer.subscription.created`, and the handler switched on it | ~10 |
| 2026-10-25 | auth | `/login` and `/signup` were restored from the archive redirect, restyled to the live editorial theme, and given a `redirect` parameter so a member lands back on the curriculum. The header now links The 28 Principles and Sign in | ~260 |
| 2026-10-25 | curriculum | `lib/curriculum.ts`: the 28 units as a typed server-only module (5 phases, quotes, lesson prose, sub-points, reflections), and `/api/principles` as the only exit — the free unit for anonymous readers, all 28 for a paying member, with progress written to the account's `completed_units` | ~900 |
| 2026-10-25 | commerce | The $20/month membership was registered in the `products` table against its live Stripe price and product ids, so the webhook can attribute the purchase | ~20 |
| 2026-10-25 | ops | The Stripe payment link now redirects to `/principles/?activated=1&session_id=…` after checkout, and `/api/membership/session` names the address the membership is attached to | ~90 |
| 2026-10-24 | revenue | Added the membership call to action to the homepage, `/archive/` and `/newsletter/`, pointing at the canonical Stripe payment link from `lib/brand.ts`. The live site could not take a payment before this — every commerce route redirects to the archive and the archive carried no price, no link and no CTA | ~120 |
| 2026-10-24 | backend | `/api/checkout/create-session` built its success and cancel URLs from `NEXT_PUBLIC_BASE_URL`, which is not set in Vercel, so every completed order redirected to `http://localhost:3000`. It now falls back to `BRAND.siteUrl` | ~30 |
| 2026-10-24 | performance | Converted all 16 editorial illustrations from PNG to WebP (about 44 MB to about 1.5 MB) and repointed every reference; `getArchiveArtwork()` now returns a display source and a separate PNG source for the OG renderer, which cannot decode WebP | ~90 |
| 2026-10-24 | ops | Mirrored the 6 Production env vars that Preview was missing (`POSTGRES_*`, `SUPABASE_JWT_SECRET`, `SUPABASE_SECRET_KEY`) by extending the target list of the existing Production records — sensitive Vercel vars are write-only, so their values cannot be read back | ~30 |
| 2026-10-23 | backend | The admin console, the premium gating and `/api/subscriptions` now read `profiles`, `products` and `newsletters` server side with the service-role key, because the fleet's RLS policies on `profiles` are self-referential (42P17) and `products` has no SELECT policy for `public` | ~800 |
| 2026-10-23 | backend | `/api/profile` (the caller's own row), `/api/admin/console` (the console datasets and its writes), `/api/products` and `/api/products/[slug]` (the catalogue, with the slug derived from the product name) | ~450 |
| 2026-10-23 | backend | `/api/subscriptions` resolves the caller from the bearer token and writes `profiles.id`; `/api/referrals` drops four columns that do not exist and keeps the code in `profiles.metadata` | ~300 |
| 2026-10-23 | repo | `scripts/check-schema-refs.mjs` now validates column references as well as table names, and reports the file each bad column is in (19 tables, 48 columns checked) | ~330 |
| 2026-10-23 | repo | Added `scripts/check-schema-refs.mjs`: every `.from('table')` in the source is checked against the live Supabase schema and the script exits non-zero on a phantom table (19 tables referenced, all present) | ~150 |
| 2026-10-23 | backend | The Stripe webhook's replay guard now works: the `events` table has `properties`, not `payload`, and requires `actor_type` / `actor_id` / a null-able inet `ip_address` | ~40 |
| 2026-10-23 | backend | `/api/subscriptions` reads the billing period off the subscription item (Stripe moved `current_period_start` onto the item) instead of writing `Invalid Date` | ~30 |
| 2026-10-23 | backend | The tier→price map in `/api/subscriptions` pointed at price ids that do not exist in the live Stripe account; `elite` now resolves to the live $20 price `price_1T4KHvChZyGhfmDOhcHCBpat` (and to `STRIPE_PRICE_ELITE` when set), and the other tiers resolve to null rather than to a fake id. `STRIPE_PRICE_ELITE` was added to Vercel Production and Preview | ~40 |
| 2026-10-23 | ops | The Stripe webhook endpoint pointed at the stale alias `imperium-green.vercel.app` and listened for `checkout.session.completed` only, so renewals, cancellations and failed invoices never reached the app. It now points at `https://secretimperium.com/api/webhooks/stripe` with all five events the handler supports, its signing secret was rotated and re-published to Vercel Production and Preview, and the old endpoint was deleted. Verified by signing a probe event with the new secret: production answers `200 {"received":true}` | ~30 |
| 2026-10-23 | backend | The admin Client Health tab derives health from the `profiles` columns instead of the non-existent `client_health` table; the metrics refresh route no longer writes to the non-updatable `live_retention_metrics` view | ~120 |
| 2026-10-23 | lint | Cleared all 279 lint errors across 56 files: real types replace `any`, unused imports removed, JSX entities escaped, React Compiler hook rules fixed properly, `npm run lint` and `tsc --noEmit` are clean | ~900 |
| 2026-10-23 | cleanup | Deleted `src/lib/gmail-service.ts` — unreferenced dead code from the pre-Resend era that wrote to the non-existent `newsletter_subscribers` table | ~290 |
| 2026-10-22 | ops | Mirrored the Production env vars into the Vercel Preview environment (17 vars, sensitive, all branches) and verified with a live preview deployment | ~30 |
| 2026-10-22 | repo | Mirrored `Website/` into `web/`, added `scripts/sync-trees.sh` (+ `--check`) and a CI guard so the two trees can never drift again | ~400 |
| 2026-10-22 | repo | Updated the root `CLAUDE.md` to the real layout: production root is `Website/`, `web/` is a mirror, Archive rebrand routes, live route list | ~60 |
| 2026-10-22 | backend | `/api/analytics` now reads `transactions` (no `revenue` table) and writes `user_interactions` (no `analytics` table); the write path is admin-guarded and validates `event_type` against the table CHECK constraint | ~60 |
| 2026-10-22 | backend | The Stripe webhook records purchases into `inbound_imperium_events` instead of the non-existent `purchases` table, logs failures, and fixes the empty `or()` filter in the profile upsert | ~80 |
| 2026-10-22 | visual | Added `SafeImage` and a real placeholder asset so a database image URL that points at a deleted file degrades to the Imperium tile instead of a broken-image glyph; fixed the product gallery references to files that exist and the missing OG image | ~90 |
| 2026-10-22 | repo | Moved the mobile overflow audit to `scripts/check_overflow.mjs` (takes a URL and a viewport width) so it is reusable across projects | ~50 |
| 2026-10-21 | production-root | Found that production builds `Website/`, not `web/`; ported the fixed email/newsletter/analytics pipeline, admin studio, unsubscribe pages, track proxy and analytics dashboard into the production root | ~4000 |
| 2026-10-21 | email | Added the shared fleet `RESEND_API_KEY` and a new `CRON_SECRET` to the `imperium` Vercel project (Production). Production can send again | ~10 |
| 2026-10-21 | security | Newsletter send now requires an admin session or the service-role key (`isAdminRequest`); the cron route requires `CRON_SECRET`. Both were open to any caller | ~120 |
| 2026-10-21 | visual | Added route `loading.tsx` skeletons across the production tree (dark app, dark editorial, paper archive themes) | ~700 |
| 2026-10-21 | ops | Production `vercel.json` now pins `NODE_VERSION=24.x` and declares the `/api/newsletter/cron` and `/api/market/cron` schedules | ~20 |
| 2026-10-21 | merge | Merged `codex/imperium-archive-20261018` into `main` (5985a3a) and bumped Node 20.x -> 24.x in `web/` (9d3aa49). Production deploy is READY and live site verified intact | ~1300 |
| 2026-10-21 | forms | Wired newsletter, lead, exit-intent and account forms to real API routes that persist to `profiles` and `inbound_imperium_leads` and notify via the hub | ~900 |
| 2026-10-21 | email | Applied `form-backend-nodemailer`: capture pipeline writes local rows first, then asks the hub for the welcome email with a one-click unsubscribe | ~500 |
| 2026-10-21 | seo | Applied `seo-metadata-nextjs`: per-route canonical, title template, OG/Twitter images on every indexable page | ~200 |
| 2026-10-21 | seo | Removed the root-level canonical that every child route inherited, and added product detail URLs to the sitemap | ~120 |
| 2026-10-21 | shop | Product grid now derives categories from loaded products, links to real product pages, and no longer references missing image files | ~120 |
| 2026-10-21 | email | One-click unsubscribe writes `profiles`, `federation_newsletter_subscribers` and `omni_suppressions` instead of a table that does not exist | ~190 |
| 2026-10-21 | email | Newsletter dispatch rebuilt against the live schema: shared dispatch module, per-recipient RFC 8058 headers, send record in `inbound_imperium_events` | ~750 |
| 2026-10-21 | visual | Admin analytics page dark-themed; fixed the columns it read and made its two selectors actually filter | ~300 |
| 2026-10-21 | analytics | Analytics beacon proxied same-origin so it is not dropped on imperiumelite.com | ~90 |

## 🌐 Patterns To Apply
- **form-backend-nodemailer** — Next.js API route that handles form submissions and sends email via no
- **seo-metadata-nextjs** — Standard Next.js metadata export with title, description, openGraph, a
- **fleet-transport-split** (Imperium) — dispatch sends locally through the shared
  Resend account; welcome/lead mail routes through the Omni hub, which owns
  the verified sender, `omni_suppressions` and the one-click unsubscribe.
  Do not move dispatch to the hub without a council decision.
- **root-directory-drift** (Imperium) — when a repo holds two app trees,
  confirm the Vercel `rootDirectory` and the `federation.surfaces` row before
  editing anything. A session's fixes in the wrong tree ship as no-ops.
- **mirror-not-fork** (Imperium) — one production root, one mirrored copy,
  one script, one CI check. Never fork the trees again.
- **schema-truth-before-ship** (Imperium) — every `.from('<table>')` in the
  app is a claim the table exists, and every column named on it is a claim
  the column exists. Check both against the live schema before shipping
  (`scripts/check-schema-refs.mjs`, which now checks columns too). A missing
  table does not throw where the code reads it — it returns an error that gets
  swallowed and the feature silently does nothing. Six tables and four
  columns have been wrong this way.
  When an SDK moves a field (Stripe moved `current_period_start` onto the
  subscription item), read the SDK's own types in `node_modules` rather than
  trusting the shape the code was written against.
- **rls-recursion-breaks-the-client** (fleet, applies to every tenant) — a
  fleet policy that subqueries its own table makes every authenticated read
  of that table fail with Postgres error 42P17, and a policy that only grants
  UPDATE makes an anonymous read return nothing. Neither raises in the
  browser: the query fails, the error is swallowed, and the page renders
  empty. **Read shared fleet tables server side with the service-role key
  and gate the route on the caller's session**, never from a client
  component. Check `pg_policies` before trusting any fleet read.
- **profiles-id-is-not-auth-id** (fleet) — `profiles.id` is its own uuid and
  `profiles.auth_id` points at `auth.users.id`. Any insert into a table
  whose foreign key points at `profiles(id)` must use `profiles.id`.
- **a-price-id-that-looks-real-may-not-exist** (Imperium) — the tier→price
  map in `/api/subscriptions` held three ids (`price_1QHf2JFj9oKErkMT…`)
  that were never in the Stripe account, so every subscription attempt
  failed at the Stripe call and no error ever surfaced to the operator.
  Read the live price list (`stripe prices list --limit 100`) before
  trusting a hard-coded id, and let a `STRIPE_PRICE_<TIER>` env var
  override it. The same check applies to every payment link baked into
  a page.
- **a-webhook-handler-is-not-a-webhook** (Imperium) — the Stripe handler in
  `/api/webhooks/stripe` can be correct and still never fire, because the
  account's endpoint points at a stale alias and subscribes to a subset of
  the events the handler switches on. Check `stripe webhook_endpoints`
  against the live domain *and* against the handler's `switch` before
  debugging handler code, and make sure the endpoint's signing secret is
  the one the app verifies with.
- **og-images-cannot-read-webp** (Next.js, applies to every project) —
  `next/og` renders with satori, which does not decode WebP. If the artwork
  on a page is served as WebP, the OG route needs a PNG (or JPEG) sibling.
  Return both sources from one helper so the two never drift.
- **unoptimized-images-serve-raw-bytes** (Next.js) — with
  `images.unoptimized: true` in `next.config.ts` there is no automatic
  compression or resizing: the file in `public/` is the file the browser
  gets. Asset weight is a build-time decision, not a framework decision.
  Audit the bytes in `public/` before blaming the framework.
- **a-redirecting-storefront-sells-nothing** (fleet) — when every commerce
  route redirects to a content surface, the surviving surface has to carry
  the offer. A brand fact (price, checkout link) that lives only on a
  redirected page is a dead end: the site looks complete and takes no
  money. Put the offer on the surface that actually loads.
- **sensitive-env-vars-are-write-only** (Vercel) — neither `vercel env pull`
  nor `?decrypt=true` returns the value of a sensitive variable. To give a
  Preview build the same secret as Production, extend the **target list** of
  the existing Production record (`target: ["production","preview"]`) rather
  than creating a new record, and verify by counting the variables rather
  than by reading them.
- **the-payment-can-prove-the-email** (fleet, applies to every paid site) —
  a checkout session id is an unguessable secret that proves the address was
  paid for. When the mailer is rate limited or autoconfirm is off, let the
  payment stand in for the confirmation email: verify the session is paid,
  verify the address matches `customer_details.email`, then create the
  account confirmed. Never modify an existing account on this path — no
  password reset, no confirmation flip. Runbook:
  `runbook.imperium / paid-path-registration-without-email-confirmation`.
- **stripe-is-the-ledger-not-the-flag** (fleet) — a boolean on a profile row
  is written once and never updated, so it goes stale on cancellation. When a
  Stripe customer exists for an address, the subscription decides whether the
  member is in, whatever the row says. And the customer id may not be on the
  row at all: a customer can exist before its first checkout, so look it up
  by the customer's email and stamp the id onto the row that carries
  `auth_id`.
- **gate-the-content-server-side-not-the-ui** (fleet) — a locked lesson that
  is sent to the browser and hidden with CSS is a lesson anyone can read in
  the network tab. Keep the paid content in a server module and release it
  through an API that checks membership before it writes a single byte.


## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- The local `Website/.env.local` still carries the pre-rotation
  `STRIPE_WEBHOOK_SECRET`; the live value lives in Vercel (Production and
  Preview) and was rotated on 2026-10-23 when the Stripe endpoint was
  repointed at `secretimperium.com`. Do not read the local one as the
  live one — verify against Vercel.
- Never run Supabase migrations
- Never edit a shared fleet table's schema or RLS policies
- Read shared fleet tables server side with the service-role key, never from a
  client component — the fleet's own policies make browser reads fail
  silently (see `rls-recursion-breaks-the-client`)
- Run `node scripts/check-schema-refs.mjs` before shipping any change that
  adds or renames a `.from()` call, and run it again before every push
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
- Take a federation lease before any deploy, migration, or DNS change, and
  release it with a receipt
