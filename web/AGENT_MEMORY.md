# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: October 21, 2026 11:34 PM
> READ THIS FIRST. Never repeat completed work.

## 📊 Health Scores
| Metric | Score | Bar |
|---|---|---|
| Build | 96/100 | █████████░ |
| SEO | 93/100 | █████████░ |
| Performance | 82/100 | ████████░░ |
| Backend | 78/100 | ███████░░░ |
| Mobile | 92/100 | █████████░ |
| **OVERALL** | **87/100** | ████████░░ |

## 🎯 This Session: Do These In Order
1. Add RESEND_API_KEY to the Imperium Vercel project — the send/cron routes
   are correct now but have no transport in production, and the key in the
   repo-root `.env` is rejected by Resend
2. Decide the Imperium email architecture: send locally via Resend, or route
   every send through the Omni hub (which already owns Resend, the verified
   `secretimperium.com` sender, and the suppression list)
3. ~~Merge the `codex/imperium-archive-*` branches~~ DONE 2026-10-21 —
   `codex/imperium-archive-20261018` was merged into `main` (commit 5985a3a).
   `main` now matches production: `/archive`, `/partners`, `/resources` all live.
   Do NOT re-merge or revert. The archive branches can now be retired.
4. Add a `sent_at` column to `newsletters` (or keep the event-log record) so
   the admin dashboard's sent state is first-class rather than derived

## 🔬 Why
- Forms and newsletter capture now write real rows and reach the hub
- Newsletter dispatch was dead against the live schema; it now works end to end
- The analytics beacon was silently dropped on imperiumelite.com by the hub's
  origin allowlist; it now goes through a same-origin proxy
- The live deployment is not this branch, so `main` may not be what ships
  (RESOLVED 2026-10-21: main now ships to secretimperium.com via the `imperium`
  Vercel project. Node 20.x -> 24.x fix also landed; production build is green.)

## 📚 Stats
- Sessions: 44
- Lines written: 0

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
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

## ⚡ Rules
- Read this file first, every session
- Never repeat anything in Edit History
- Check patterns before writing new code
- Build before and after every change
- Never touch .env files
- Commit every logical unit: `git commit -m 'agent: [what]'`
- Push when done
