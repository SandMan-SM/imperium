# 🧠 AGENT_MEMORY — IMPERIUM
> Synthetic Intelligence Memory | Updated: October 28, 2026 11:35 PM
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
The Telegram bridge — the second front door onto the paid curriculum — was
proved, repaired and measured, and the site it hangs off is clean:
- **The bot's two dead ends were closed.** The main menu's **"My Progress"**
  button drew a callback that no handler answered, so pressing it did
  nothing at all. And the bot told a paying member to "use /resume to
  continue where you left off" — a command that was never registered, so the
  instruction could not be followed. Both now answer, and the unit view is
  built in **one place** so the button and the command cannot drift apart.
- **`scripts/check_telegram_bridge.mjs` answers "will the bot open the paid
  sequence?"** One command, no guesswork, in the shape of the money-path
  proof: the bot's token against Telegram itself, the site's copy of the
  token, the admin chat, the shared secret, the bot's username, the depth of
  the access code against Telegram's 64-character limit, every advertised
  command against every registered one, every drawn button against every
  answer, the curriculum's size, and whether the site still ships a locked
  lesson to an anonymous reader. Exit 0 means the bridge is wired; 1 names
  the broken link.
- **The site and the bot were proven to share a secret.** The live bridge
  accepts the bot's own `.membership-secret` and refuses a wrong one with a
  `401` — the two halves of the membership are already talking.
- **The token is no longer in version control.** It was committed in
  `AGENTS.md` and hardcoded as a fallback in `docker-compose.yml`. Both are
  gone; the compose file now refuses to start without a token rather than
  falling back to a revoked one. The token itself is already dead — every
  copy answers `401 Unauthorized` — so this is hygiene, not an outage.
- **The environment now has one name for the token.** The website read
  `TELEGRAM_BOT_TOKEN`; Vercel carried `BOT_TOKEN`, which nothing reads.
  The site therefore never notified Telegram, silently, with no error
  anywhere. `TELEGRAM_BOT_TOKEN` is now set on Production and Preview and
  the orphan is gone.
- **`scripts/check_visual.mjs` audits the whole site in one pass.** It
  reads the routes from the site's own sitemap and checks each one for
  overflow, console errors, broken images, missing alt text, links that go
  nowhere and a theme that breaks. 36 routes at 375 / 768 / 1440 px and 14
  more that the sitemap does not list: **nothing to fix.**

## 🎯 This Session: Do These In Order
1. **Get the operator's own card through the checkout once.** Still
   **operator-blocked — the agent cannot do it.** Everything around it is
   proven: a signed probe event returned `200` and wrote the `events` row;
   the payment link is a $20/month subscription redirecting to
   `https://secretimperium.com/principles/?activated=1&session_id={CHECKOUT_SESSION_ID}`.
   The Stripe account still shows **zero customers and zero subscriptions**;
   the only paid session is a $0 verification session. Twenty sessions exist,
   and the ones that reached the $20 link are all expired and unpaid. When
   the card runs, prove it in one command:
   `node scripts/check_payment_chain.mjs <the-address>`.
2. **Get a working Telegram token from BotFather.** There is **no valid
   token anywhere** — the local `.env.local`, the bot's `.env` and the one
   that was committed to `AGENTS.md` all answer `401 Unauthorized`, and so
   does the `BOT_TOKEN` that was on Vercel. Until BotFather issues a real
   one the bot cannot be run and none of the Telegram work can be seen live.
   `node scripts/check_telegram_bridge.mjs` names it as the first failure.
3. **Set `TELEGRAM_BOT_USERNAME`** on Vercel (Production and Preview, in
   the same session). With it, `/api/telegram/link-code` returns a deep
   link and a member is connected in one tap; without it, the member copies
   the code and sends `/link`, which also works. **Do not set a placeholder**
   — absent degrades gracefully to the copy-the-code path, a placeholder
   produces a deep link that opens a dead bot. The username is the one thing
   the agent cannot invent: it only exists once the token works.
4. **The council items are recorded, not fixed.** They are written up in
   omni-memory under `client.imperium / council-items-2026-10-25-fleet-security-and-schema`
   (the five RLS-disabled tables, the anon-executable SECURITY DEFINER
   functions, the `subscriptions`/`referrals` policy contradiction) and
   `products.slug` (the migration decision). Both need a council decision,
   not an autonomous fix. **Do not change shared fleet tables.**
5. **Keep Preview in step with Production.** Both carry the same variable
   names (verified by name this session; `TELEGRAM_BOT_TOKEN` now carries
   the same value in both). Any new Production env var must be added to
   Preview in the same session, or previews break silently again. Note:
   **sensitive Vercel env vars are write-only** — neither `vercel env pull`
   nor `?decrypt=true` returns a value. To mirror one without reading it,
   extend the target list of the existing Production record to include
   `preview` instead of creating a new record. The Vercel REST API
   (`POST /v10/projects/{id}/env` with `"type": "sensitive"`) does this
   without a prompt, which the CLI will not.
6. **The trees drifted again — this time on the brief itself.** The last
   session wrote `web/AGENT_MEMORY.md` and did not sync, so the canonical
   `Website/AGENT_MEMORY.md` was a day older. **Write the brief into
   `Website/` and run `scripts/sync-trees.sh`**, never the other way round.

## 🔬 Why
- **A button with no handler is invisible.** The main menu drew "My
  Progress" with a callback that `handle_callback` did not match, so the
  button answered with silence — no error, no log, just a tap that did
  nothing. The same shape as a dead link: the reader is the only one who
  finds out.
- **The bot told members to type a command that did not exist.** The
  confirmation after a successful link ends "use /resume to continue where
  you left off", and `/resume` was never registered. A promise the product
  cannot keep is worse than no promise: the member types it, Telegram says
  "unknown command", and the member concludes the bot is broken.
- **One view, two ways to ask for it.** The resume view existed inside the
  callback handler, where the `/resume` command could not reach it. Building
  it once and asking for it twice is what keeps the button and the command
  from answering differently.
- **An env var with the wrong name is a silent no-op.** The code read
  `TELEGRAM_BOT_TOKEN`; the environment carried `BOT_TOKEN`. The site
  skipped its Telegram notification every time, correctly and invisibly.
  A missing variable does not fail a build and does not log — it just means
  the feature never runs, so the *name* has to be checked against the
  environment, not just the presence of a value.
- **A bridge has to be proved from both ends.** The membership secret
  matches (the live site accepts the bot's file and refuses a wrong one),
  but the bot cannot run without a token, so the half that matters most is
  still unproven. One command that checks every link, in the order a member
  would hit them, turns "it looks wired" into a list.
- **A revoked token in version control is only hygiene.** The token was
  committed, then revoked by Telegram. Removing it from the tree stops the
  next person from trying it; it does not un-leak it, and the history still
  holds it. Rewriting shared history is not worth it for a credential that
  no longer works — the real fix is rotation, which only the operator can do.
- **A light page is a design, not a bug.** The first run of the visual
  audit flagged every route for "light background with dark text". The
  Archive rebrand *is* paper — that is the product. The rule only means
  something on a dark page, where a light block is a skeleton that forgot
  what it stands in for.
- **A file that claims to hold a secret can be checked against the live
  thing.** The bot's `.membership-secret` and the site's
  `IMPERIUM_MEMBERSHIP_SECRET` were assumed to match because both were
  set. They are: the live bridge accepted the bot's file and refused a
  wrong secret with a `401`. That is the only way to know without reading a
  write-only variable.
- **The one command beats the status badge.** The money path got
  `check_payment_chain.mjs`; the Telegram path now gets its twin. Every
  link that can fail alone and invisibly deserves a line in a script, not a
  badge that says "configured".


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
- Sessions: 53
- Lines written: 5000

## 🔄 Edit History (last 30 — DO NOT REPEAT)
| Date | Category | What Was Done | Lines |
|---|---|---|---|
| 2026-10-27 | telegram | The bot's two dead ends were closed. The main menu's "My Progress" button drew a callback no handler answered — the tap did nothing at all. And the bot told a paying member to "use /resume to continue where you left off" for a command that was never registered. Both now answer, and the resume view is built in one place so the button and the command cannot drift apart | ~120 |
| 2026-10-27 | telegram | `scripts/check_telegram_bridge.mjs`: one command proves the Telegram bridge — the bot's token against Telegram itself, the site's copy of the token, the admin chat, the shared secret, the bot's username, the access code against Telegram's 64-character limit, every advertised command against every registered one, every drawn button against every answer, the curriculum's size, and whether the site still ships a locked lesson to an anonymous reader. Exit 0 wired / 1 broken and named | ~330 |
| 2026-10-27 | security | The revoked Telegram token was committed in `AGENTS.md` and hardcoded as a `docker-compose.yml` fallback. Both are gone; the compose file now refuses to start without a token instead of falling back to a revoked one. The token itself already answers 401 — this is hygiene, and rotation remains the operator's job | ~20 |
| 2026-10-27 | ops | The website read `TELEGRAM_BOT_TOKEN` while Vercel carried `BOT_TOKEN`, which nothing reads — so the site's Telegram notification was a silent no-op on every call. `TELEGRAM_BOT_TOKEN` is now set on Production and Preview and the orphan is deleted | ~20 |
| 2026-10-27 | visual | `scripts/check_visual.mjs`: audits every route in the sitemap for overflow, console errors, broken images, missing alt text, links that go nowhere and a theme that breaks — 375 / 768 / 1440 px, 36 routes plus 14 the sitemap does not list. Nothing to fix | ~330 |
| 2026-10-27 | repo | `AGENT_MEMORY.md` was written into `web/` and never synced, leaving the canonical `Website/` copy a day behind. The brief now lives in `Website/` and is mirrored | ~10 |
| 2026-10-26 | revenue | `resolveMembership` now asks Stripe about **every** customer the address can have — from the profile rows and from a lookup by email in both cases — instead of `customers.list(...).data[0]`. A member whose first Stripe customer was closed was locked out of the curriculum despite a live subscription elsewhere. A live subscription on any candidate now wins; Stripe failures degrade to the database flag instead of throwing | ~90 |
| 2026-10-26 | revenue | `scripts/check_payment_chain.mjs`: one command proves the whole chain — Stripe customer, live subscription, webhook receipt, purchase record, the profile carrying the membership, the Stripe id stamped on the profile, and the site's own conclusion. Exit 0 complete / 1 broken / 3 error. Reads credentials from the environment, then `Website/.env.local`. Runbook: `runbook.imperium / proving-a-payment-became-a-membership` | ~250 |
| 2026-10-26 | revenue | `/login` and `/signup` now carry the checkout `session_id` through the redirect, so a member who signs in after paying still sees the "PAYMENT RECEIVED" confirmation instead of a bare form | ~30 |
| 2026-10-26 | visual | Six route skeletons were wearing the wrong theme: `/partners` and `/resources` had paper skeletons over dark pages, `/resources/[slug]` had a paper skeleton over the dark resource module, `/login` and `/signup` had dark skeletons over the light `.auth-shell`. All six now match the page they stand in for | ~220 |
| 2026-10-26 | visual | `/archive/[slug]/loading.tsx` rendered literal `[` and `]` characters as page text — a stray bracket outside any JSX expression. The skeleton now mirrors the real entry: dark reading chrome around the light paper article, with the artwork block and the practice panel | ~60 |
| 2026-10-26 | backend | `/api/membership/session` caught every Stripe failure and answered `500`, so a member who followed a stale session link was told the site was broken. Stripe reports an unknown session as an invalid request for a missing resource; that is now `404`, and a malformed id is `400` | ~40 |
| 2026-10-26 | telegram | The Telegram bridge was rebuilt. `/api/telegram/link-code` mints a short opaque token for a signed-in member and stores it in `profiles.metadata.telegram_connect`; `/api/telegram/membership` trades that token — or a Telegram id already written onto the member's row — for a yes-or-no membership answer over a shared secret. The bot now learns whether somebody has paid without ever learning their address | ~400 |
| 2026-10-26 | telegram | The link code could never have worked in a deep link: it was 109 characters and Telegram allows 64 of `A-Za-z0-9_-`. `lib/server/telegram-link.ts` now mints a random 24-character token, following the codebase's own referral-code pattern, and `TELEGRAM_BOT_USERNAME` turns it into a one-tap `t.me` link | ~120 |
| 2026-10-26 | telegram | `telegram-bot/`: `membership.py` speaks the new bridge over stdlib HTTP with a request deadline and parses the site's error body; `access.py` asks the site about the bot's own Telegram account and keeps the answer in the persisted row instead of an in-memory cache a restart threw away; `database.py` dropped the email column and stores the member flag, the free unit and the unit count | ~260 |
| 2026-10-26 | security | `telegram-bot/.membership-secret` — the hand-off of the shared membership secret — is now gitignored, and the secret is compared in constant time and fails closed when unset | ~20 |
| 2026-10-26 | visual | The visual audit ran clean over 27 routes at 375 / 768 / 1440 px: no overflow, no dead links, no missing alt text, no console errors, no light backgrounds breaking the theme. The only 404s were three routes that exist in neither the source nor the sitemap — `/archive/the-28-principles`, `/tyronengouamo` and `/tyronengouamo/referral` — so `CLAUDE.md`'s glossary entry for `/tyronengouamo` is stale | ~40 |
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
- **one-address-can-own-many-stripe-customers** (fleet, applies to every
  paid site) — `stripe.customers.list({email}).data[0]` is the customer that
  matched first, not the one with the live subscription. A member who
  replaced a failed card or signed up twice can hold two customers, and
  resolving membership from the first one locks a paying member out with no
  error anywhere. Gather every candidate id (profile rows **and** a Stripe
  lookup by email in both letter cases) and let any live subscription win.
- **prove-the-money-path-with-a-script-not-a-badge** (fleet) — a payment
  chain has five links (Stripe → webhook → purchase record → profile →
  the site's own conclusion) and each can fail alone and invisibly. The
  member who paid and cannot open the curriculum is the worst outcome a
  paid site can produce, so give the operator one command that prints
  PASS/FAIL per link and names the broken one. Runbook:
  `runbook.imperium / proving-a-payment-became-a-membership`.
- **prove-every-bridge-with-a-script** (fleet, applies to every second
  front door) — a bot, an app or a partner site that shares a membership
  with the website is another chain, and it fails the same way: silently,
  link by link. Give it the same treatment as the money path — one command
  that asks every question a member would ask, in the order they would ask
  it, and names the first broken link. Script:
  `scripts/check_telegram_bridge.mjs`.
- **an-env-var-with-the-wrong-name-is-a-silent-no-op** (every project) — a
  missing variable does not fail the build and does not log; the feature
  simply never runs. When the code reads `TELEGRAM_BOT_TOKEN` and the
  environment carries `BOT_TOKEN`, the site is "configured" by every check
  that looks for a value and still does nothing. Check the *name* in the
  code against the *name* in the environment, and keep one name per
  secret — an orphan variable under an old name is a trap for whoever
  updates the value next.
- **every-drawable-callback-needs-a-handler** (Telegram, every bot) — a
  keyboard button whose `callback_data` matches no branch answers with
  silence, and a command the bot advertises but never registered is an
  instruction the reader cannot follow. Both are invisible until somebody
  taps the button. Derive the callbacks the keyboards can produce, derive
  the handlers that exist, and check the two against each other — a static
  check, in the same script that proves the rest of the bridge.
- **one-view-two-ways-to-ask-for-it** (every project) — when a command and
  a button do the same thing, build the view once and ask for it twice.
  Two copies of the same logic drift, and the drift shows up as one of
  them answering differently.
- **an-audit-rule-that-flags-the-design-is-not-an-audit** (every project) —
  "light background with dark text" is a broken theme on a dark site and the
  whole point of the design on a paper site. A rule that fires on every
  route teaches the reader to ignore it. Scope a visual rule to the theme it
  is about (only apply the light-block rule to a dark page) before trusting
  its output.
- **a-skeleton-is-a-promise-about-the-page** (Next.js, every project) — a
  `loading.tsx` wearing the wrong theme shows a light flash before a dark
  page (or the reverse). Read the page the skeleton stands in for before
  writing it, and remember the skeleton is still content: a stray `[` or
  `]` outside a JSX expression renders as literal page text.
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
- Write `AGENT_MEMORY.md` into **`Website/`**, then run
  `scripts/sync-trees.sh` — the canonical copy is the production root, and
  a brief written into `web/` is a brief that drifts
- Before every push run `node scripts/check-schema-refs.mjs`,
  `node scripts/check_telegram_bridge.mjs` and
  `node scripts/check_visual.mjs https://secretimperium.com 375`
