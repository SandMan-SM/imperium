# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: October 22, 2026 11:43 PM
> READ THIS FIRST. Never repeat completed work.
> **THIS FILE IS THE CANONICAL BRIEF.** `web/AGENT_MEMORY.md` is a mirror.
> **PRODUCTION BUILDS `Website/`, NOT `web/`.** Vercel project `imperium`
> (prj_rbnO8QZmuJtlDpWlGYE1tcYkwx3o), rootDirectory `Website`,
> deploy_method `git-push`, productionBranch `main`, region `iad1`,
> live at `https://secretimperium.com`.

## 📊 Health Scores
| Metric | Score | Bar |
|---|---|---|
| Build | 97/100 | █████████░ |
| SEO | 93/100 | █████████░ |
| Performance | 82/100 | ████████░░ |
| Backend | 92/100 | █████████░ |
| Mobile | 94/100 | █████████░ |
| **OVERALL** | **92/100** | █████████░ |

## 🎯 This Session: Do These In Order
1. Configure the Vercel **Preview** environment. Every app env var is
   Production-only (SUPABASE_*, STRIPE_*, RESEND_API_KEY, CRON_SECRET,
   POSTGRES_*); only `BOT_TOKEN` covers Preview. Preview deploys therefore
   boot without Supabase or Stripe and every data route 500s. Copy the
   Production values to Preview (do NOT re-key — use the same fleet values).
2. Resolve the `web/` vs `Website/` duplicate tree. `web/` holds the
   pre-port copies of the fixed routes and now diverges again from
   production. Either mirror it or delete it — but never leave two
   half-synced trees where one of them ships. Production is `Website/`.
3. `web/AGENT_MEMORY.md` is a mirror of this file. Keep them byte-identical
   or delete the mirror and leave a pointer to this file.

## 🔬 Why
- Production email transport now works: `RESEND_API_KEY` + `CRON_SECRET` are
  set on the `imperium` project, and the full capture -> dispatch ->
  unsubscribe pipeline has been ported into the production root and verified
  live (send + cron both answer 401 to unauthenticated callers).
- Newsletter sent state lives in the tenant event log
  (`inbound_imperium_events`, `event_type='newsletter_sent'`), so the admin
  dashboard shows a first-class sent timestamp and recipient count with no
  schema change. The live `newsletters` table has NO `sent_at` column — do
  not add one.
- The archive rebrand routes (`/archive`, `/partners`, `/resources`) are live
  on the production root. Flipping the Vercel root to `web/` would drop them.
- Preview builds are unconfigured and have been for 240 days; every preview
  data route has been failing silently.

## 📚 Stats
- Sessions: 45
- Lines written: 0

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
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

## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- Never run Supabase migrations
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
- Take a federation lease before any deploy, migration, or DNS change, and
  release it with a receipt
