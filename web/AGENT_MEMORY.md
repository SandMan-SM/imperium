# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: October 23, 2026 12:40 AM
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
| Performance | 82/100 | ████████░░ |
| Backend | 92/100 | █████████░ |
| Mobile | 95/100 | █████████░ |
| **OVERALL** | **93/100** | █████████░ |

## 🎯 This Session: Do These In Order
1. **Close the commerce loop with one real checkout.** The write path is now
   proven against the live schema (a `purchase_recorded` row was inserted and
   removed again, and the `omni_businesses` row for slug `imperium` resolves),
   and the Stripe webhook's replay guard finally works. What is still missing
   is a payment: the Stripe account has **zero subscriptions and zero
   checkouts**, and `transactions`, `subscriptions`, `referrals` and
   `affiliates` are all empty. Run one real $20 checkout and confirm the
   purchase lands in `inbound_imperium_events` and the profile flips to
   premium.
2. **Decide the storefront question.** `/28principles`, `/shop`, `/account`,
   `/cart`, `/checkout`, `/login`, `/signup`, `/portal` and `/subscribe` all
   301/redirect to `/archive/`. The backing routes and APIs are still there.
   Either retire them for good (delete the routes and the redirects become
   permanent) or restore them behind a flag. Right now the site advertises a
   storefront that redirects away from it.
3. **Review fleet RLS exposure.** The anon key can SELECT `profiles` (24 rows
   with email + stripe ids), `products`, `transactions` and
   `user_interactions`. Every fleet table has RLS enabled, so the policies —
   not the app — are what decide this. Any tightening is a migration and
   needs a council decision; do not change policies autonomously.
4. **Decide what to do about `products.slug`.** The table has no `slug`
   column, so `/shop/[slug]` can only resolve the three hardcoded catalogue
   entries and the database catalogue is unreachable. Adding the column is a
   migration and needs a council decision.
5. **Keep Preview in step with Production.** Preview now carries the same
   fleet values as Production (17 vars). Any new Production env var must be
   added to Preview in the same session, or previews break silently again.

## 🔬 Why
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
- `/api/subscriptions` wrote `Invalid Date` into `subscriptions`: Stripe moved
  `current_period_start` / `current_period_end` onto the subscription *item*
  in the pinned API version (2026-02-25.clover), so the insert would have
  failed. It now reads the period off the first item.
- `npm run lint` reported 279 errors across 56 files. It is now clean:
  `no-explicit-any` replaced with real types, unused imports removed, JSX
  entities escaped, React Compiler hook rules fixed properly.
- Live visual audit at 375 / 768 / 1440 px: no horizontal overflow, no
  console errors, no dead internal links, every image reference resolves.

## 📚 Stats
- Sessions: 47
- Lines written: ~2200

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
| 2026-10-23 | repo | Added `scripts/check-schema-refs.mjs`: every `.from('table')` in the source is checked against the live Supabase schema and the script exits non-zero on a phantom table (19 tables referenced, all present) | ~150 |
| 2026-10-23 | backend | The Stripe webhook's replay guard now works: the `events` table has `properties`, not `payload`, and requires `actor_type` / `actor_id` / a null-able inet `ip_address` | ~40 |
| 2026-10-23 | backend | `/api/subscriptions` reads the billing period off the subscription item (Stripe moved `current_period_start` onto the item) instead of writing `Invalid Date` | ~30 |
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
  app is a claim the table exists. Check the claim against the live schema
  before shipping (`scripts/check-schema-refs.mjs`). A missing table does not
  throw where the code reads it — it returns an error that gets swallowed and
  the feature silently does nothing. Six tables have been wrong this way.
  When an SDK moves a field (Stripe moved `current_period_start` onto the
  subscription item), read the SDK's own types in `node_modules` rather than
  trusting the shape the code was written against.

## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- Never run Supabase migrations
- Never edit a shared fleet table's schema or RLS policies
- Run `node scripts/check-schema-refs.mjs` before shipping any change that
  adds or renames a `.from()` call
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
- Take a federation lease before any deploy, migration, or DNS change, and
  release it with a receipt
