# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: October 23, 2026 12:20 AM
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
| Build | 98/100 | █████████░ |
| SEO | 93/100 | █████████░ |
| Performance | 82/100 | ████████░░ |
| Backend | 90/100 | █████████░ |
| Mobile | 95/100 | █████████░ |
| **OVERALL** | **92/100** | █████████░ |

## 🎯 This Session: Do These In Order
1. **Close the commerce loop.** `subscriptions`, `referrals`, `affiliates`,
   `transactions` and `user_interactions` are all EMPTY in the live database,
   and the `products` table has no `slug` column, so the shop only ever
   renders the hardcoded catalogue. The Stripe webhook now records purchases
   into `inbound_imperium_events` (event_type `purchase_recorded`) — run one
   real checkout and confirm the row lands, then decide whether the
   subscription tables should be filled from Stripe events.
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
4. **Clear the lint debt.** `npm run lint` reports 198 errors (mostly
   `no-explicit-any` in `src/lib/monitoring.ts` and `src/lib/supabase.ts`).
   The build is green, so this is hygiene, not breakage.
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
- Live visual audit at 375 / 768 / 1440 px: no horizontal overflow, no
  console errors, no dead internal links, every image reference resolves.

## 📚 Stats
- Sessions: 46
- Lines written: ~1400

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
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

## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- Never run Supabase migrations
- Never edit a shared fleet table's schema or RLS policies
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
- Take a federation lease before any deploy, migration, or DNS change, and
  release it with a receipt
