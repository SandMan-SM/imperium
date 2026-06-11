# CLAUDE.md — Imperium

## What This Project Is
Imperium is a premium e-commerce + content platform delivering "28 Principles" educational doctrine. It has a Next.js storefront, Supabase auth/database/storage, Stripe subscriptions, Resend email, and a Python Telegram bot for content delivery. Business target: **$50,000/month** revenue.

- Live production URLs: `https://secretimperium.com` and `https://imperiumelite.com`.
- Vercel project: `imperium` (org `team_jvhwfBn...`).
- "Connected to omni ai" — site functionality is expected to be wired into the user's umbrella AI ops layer (backed by Supabase project `odvxtychuxxsudfpcqqs`).

## Stack
- **Framework**: Next.js 16 (App Router, currently 16.1.6), React 19 (19.2.3), TypeScript, Node 20.x
- **Styling**: Tailwind CSS 4 (config is CSS-first in `web/src/app/globals.css` via `@theme` tokens — there is **NO** `tailwind.config.ts/js`), Framer Motion (v12.x)
- **Backend**: Supabase (auth + Postgres + storage); `pg` for direct DB access
- **Payments**: Stripe (subscriptions + webhooks); Stripe payment links created via the Stripe MCP under the Imperium account
- **Email**: Resend + react-email + mjml
- **Bot**: Python Telegram bot in `telegram-bot/` (28 Principles delivery)
- **Other deps**: Google Cloud Storage / googleapis, recharts, tiptap, lucide-react, clsx
- **Deploy**: Vercel (`web/`), Docker (`telegram-bot/`)

## Directory Layout
```
web/          → Next.js app — MAIN FOCUS (all web work happens here)
telegram-bot/ → Python Telegram bot (28 Principles delivery)
automations/  → n8n workflows
supabase/     → DB migrations (do NOT run)
docs/         → docs
```

### Key web paths
- `web/src/app/` — routes: `(auth)`, `28principles`, `account` (incl. `account/profile`), `admin`, `cart`, `checkout`, `newsletter`, `portal`, `shop`, `privacy`, `terms`, plus `tyronengouamo` + `tyronengouamo/referral`.
- `web/src/app/api/` — `admin`, `affiliates`, `analytics`, `checkout`, `leads`, `newsletter`, `orders`, `referrals`, `subscriptions`, `sync-products`, `webhooks` (Stripe).
- `web/src/lib/curriculum.ts` — the 28 Principles content as a typed `Phase[]` export (5 phases, 28 units, ~80 sub-points). Phase I free; Phases II–V gated by Supabase subscription via `useAuth` context.
- `web/src/lib/stripe-helper.ts` — singleton Stripe instance factory (`getStripe()`), server-side only, reads `STRIPE_SECRET_KEY` (throws if missing), API version pinned to `2026-02-25.clover`.
- `web/src/lib/cart-context.tsx` — cart context provider.
- `web/src/app/api/checkout/create-session/route.ts` — dynamic Stripe checkout session creation (mode `payment`).
- `web/src/app/api/webhooks/stripe/route.ts` — Stripe webhook handler.
- `web/src/app/newsletter/page.tsx` — server component, `dynamic = "force-dynamic"`, fetches published newsletters from Supabase.
- `web/src/app/newsletter/NewsletterPageClient.tsx` — reusable `NewsletterEmailForm` (email input + validation, Supabase upsert into `profiles`/subscriber state, framer-motion `AnimatePresence` success/error states, "Deploy" button) plus `NewsletterContent` markdown renderer.
- `web/src/components/Hero.tsx`, `web/src/components/PrinciplesTeaser.tsx`, `web/src/components/ProductShowcase.tsx` — auth-aware CTA + showcase components.
- `web/src/app/layout.tsx` — root layout: `AuthProvider` → `CartProvider` → `Header` + `AdminPreviewDebug` + main (`pt-[72px] min-h-screen bg-imperium-bg`). Metadata title "Imperium Elite — Build the Mind. Command the Future.", OpenGraph `url: https://imperiumelite.com`, Twitter `summary_large_image`.
- SEO/GEO already wired: `robots.ts`, `sitemap.ts`, `llms.txt`, `opengraph-image.tsx`, `twitter-image.tsx`.
- Image assets live under `web/public/` (e.g. `products/`, `banner.jpg`). Check existing format/dir conventions before dropping new portraits.
- NOTE: `web/src/components/Footer.tsx` does NOT exist — footer (if any) is inline or not yet extracted.

## Commands
```bash
# Web (do everything from web/)
cd web
npm run dev
npm run build      # MUST be green before deploy — fix all TS + lint errors
npm run lint

# Deploy (production) — run from web/
vercel deploy --prod

# Telegram bot
cd telegram-bot && source venv/bin/activate && python bot.py
```

## Agent Priorities (in order)
1. **Fix build** — `cd web && npm run build`, fix all TypeScript + lint errors.
2. **Complete admin dashboard** — `web/src/app/admin/` — ensure all CRUD operations work: user management, product management, newsletter sending, analytics.
3. **Stripe webhooks** — verify `web/src/app/api/webhooks/stripe/` handles: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` (see also `invoice.payment_succeeded`, `customer.subscription.updated`).
4. **Subscription gating** — ensure `/28principles` (Phases II–V) and other gated pages check subscription status from Supabase before rendering content.
5. **Newsletter system** — verify newsletter sign-up form saves to Supabase and triggers Resend email.
6. **Shop page** — ensure `/shop` loads products from Supabase correctly, add-to-cart works, checkout flows to Stripe.
7. **SEO** — add metadata to all pages, especially `/28principles`, `/shop`.
8. **Mobile polish** — full responsive pass at 375px / 768px / 1440px.
9. **Error boundaries** — wrap all async components in Suspense + `error.tsx`.

## Design System
- **Tailwind config is NOT a JS/TS file** — it's `@theme` in `web/src/app/globals.css`. Don't look for `tailwind.config.*`.
- Design tokens (CSS custom properties in `globals.css`):
  - `--color-imperium-bg: #030712`
  - `--color-imperium-surface: #0d1117`
  - `--color-imperium-card: #0f131a`
  - `--color-imperium-border: rgba(255,255,255,0.08)`
  - `--color-imperium-gold: #d4af37`, `-gold-bright: #e8c84a`, `-gold-dim`
- Utility classes: `bg-imperium-gold`, `text-imperium-gold`, `text-gold-gradient`, `imperium-bg`, plus typography/surface/button helpers (`.text-display`, `.text-heading`, `.text-body`, `.text-label`, `.surface-card`, `.surface-glass`, `.btn-primary`, `.btn-secondary`, `.shadow-imperium`, `.shadow-glass`).
- Dark gradient pattern: `from-gray-900 via-gray-800 to-black`.
- Gold-accent opacity variants seen across the app: `border-imperium-gold/20|30|40`, `bg-imperium-gold/5|10`, `border-white/[0.04]|[0.07]`.
- Animations: `@keyframes fadeInUp`, `slideInLeft`, `slideInRight` (0.6s ease-out); `fadeInUp` with stagger delay (e.g. 0.1s per phase).
- Typography: **Playfair Display** serif italic for `h1`/hero spans; **Inter** for body; uppercase headings with `tracking-[0.2em]`.
- **No hardcoded hex in components** — pull from the token classes above.

### Page / pattern templates
- **`28principles/page.tsx`** is the canonical landing-page pattern and best template to clone for new profile/landing pages (badge chip → serif h1 → dual CTAs → stacked sections). Section transitions use `border-t border-imperium-gold/20`. Unit card states: locked `border-white/[0.04] bg-white/[0.01]`, completed `border-imperium-gold/30 bg-imperium-gold/[0.04]`, interactive `border-white/[0.07] bg-white/[0.02] hover:border-imperium-gold/30`.
- Card styles: `glass-card`, `rounded-xl|2xl border-imperium-border bg-imperium-surface`, gold hover.
- **Auth-aware CTAs** — branch on tier via `useAuth` (premium = `profile.is_premium || profile.subscription_status === "active"`):
  - premium → "Continue the Doctrine" / "Premium Member" badge
  - signed-in non-premium → "Open Portal" (`/portal`, `border-imperium-gold/40 text-imperium-gold`)
  - unauthenticated → "Join Now — $20/month" Stripe link (`bg-imperium-gold text-[#030712]`)
- Always add a `metadata` export (title, description, openGraph, twitter) to new pages for SEO.

## Do / Don't
- **DO** keep `npm run build` green and deploy when asked — the user explicitly checks "did you deploy?". Deploy via `vercel deploy --prod` from `web/`.
- **DO** fix visual errors automatically (broken images, missing alt text, empty grids, mobile overflow, missing `loading.tsx` skeletons, `href="#"` placeholders, white/light backgrounds breaking the dark theme) — don't just report them.
- **DO** elaborate on actual content. When given a rubric/brief, treat it as a SPEC for what to produce, NOT as the literal final copy. (Past correction: a rubric for unit content was wrongly pasted in verbatim — read the intent and build it out fully.)
- **DO** provide final copy/snippets in copy-paste-ready format when the user asks for copy.
- **DON'T** use emojis anywhere — in site copy, deliverables, or scripts. The user repeatedly asks to strip them.
- **DON'T** use checkbox / strike-through "task list" UX for curriculum. The user wants a right-brained, reading / "work-through" experience that elaborates on the content and is immersive (an "addictive growth trance"), NOT a checklist.
- **DON'T** edit `.env` / `.env.local`.
- **DON'T** run Supabase migrations or touch `supabase/migrations/`.
- **DON'T** touch `telegram-bot/venv/` or `node_modules/`.

## Deploy & env
- Deploy: `vercel deploy --prod` from `web/`. Region pinned to `iad1`; `NODE_VERSION=20.x` (`web/vercel.json`).
- Env var **NAMES** (values live in `.env`, never commit/echo them): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.

## Stripe integration
- **Stripe SDK helper** (`web/src/lib/stripe-helper.ts`): server-side singleton, API version pinned `2026-02-25.clover`, reads `STRIPE_SECRET_KEY`.
- **Checkout** (`web/src/app/api/checkout/create-session/route.ts`): POST, mode `payment` (one-time, not subscription). Accepts `items` (name, price, quantity, image_url, size, color), `shipping`, `discount`, `email`. Builds dynamic line items (not pre-registered Stripe products). Success URL `/checkout?success=true`; Cancel URL `/cart`. Card payments only. Shipping 5–7 business days, fixed $0 cost, address collection enabled, supported countries US/CA/GB/AU. Coupon code `IMPERIUM20` applied when discount > 0.
- **Webhooks** (`web/src/app/api/webhooks/stripe/route.ts`): validates signature with `STRIPE_WEBHOOK_SECRET`; idempotency via `events` table (`stripe_event_id`). Must handle: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed` (also `invoice.payment_succeeded`, `customer.subscription.updated`). On `checkout.session.completed`: upsert profile by email/customer, insert `purchases` per line item, map `stripe_price_id`/`stripe_product_id` → `product_id` via `products` table, set `is_premium=true` if `session.mode='subscription'`. `invoice.payment_succeeded` → `subscription_status='active'`, `is_premium=true`. `customer.subscription.deleted/updated` → `is_premium` from status (active/trialing=true). `invoice.payment_failed` → `subscription_status='past_due'`.
- **Existing hardcoded payment link**: `https://buy.stripe.com/4gM4gyfOs2V64an8Dd5AQ07` (the $20/month Imperium Elite subscription) is baked into multiple components (e.g. `28principles/page.tsx`). **Grep before changing** so new links match existing conventions.
- **New payment links**: create via the Stripe MCP under the Imperium account/profile (e.g. Tyrone's offerings). Simplest viable approach for one-off offerings = hardcoded Stripe payment-link URLs in the page; add Supabase `products` rows only if analytics/tracking are needed (webhook expects products pre-registered with `stripe_price_id`/`stripe_product_id`).

## Supabase data model (reference)
- `profiles` — `is_premium`, `subscription_status`, `stripe_customer_id`, subscriber/email fields.
- `products` — tracks `stripe_price_id`, `stripe_product_id` (≈6 rows seen).
- `purchases` — `product_id`, `stripe_checkout_session`, amount, status.
- `events` — webhook idempotency via `stripe_event_id`.
- `newsletters` — `id`, `title`, `content`, `image_url`, `published`, `is_public`, `created_at` (query filters `published=true`, orders by `created_at` desc, limit 20).

## Gotchas
- Tailwind config is NOT a JS/TS file — it's `@theme` in `globals.css`. Don't look for `tailwind.config.*`.
- `/shop` historically broke: categories filter rendered an empty grid for Hats/Beanies, and hardcoded CATALOG items lacked `slug`s causing `/shop/[slug]` to render a generic "Product" title. Verify slugs + category filters when touching shop.
- Subscription gating: `/28principles` (Phases II–V) and gated pages must check Supabase subscription status before rendering content.
- Checkout uses dynamic line items but the webhook expects products pre-registered in Supabase — mind this gap when wiring product analytics.
- `web/src/components/Footer.tsx` does not exist; don't assume an extracted footer.
- **Security**: `AGENTS.md` in the repo root contains a real Telegram bot token in plaintext — do not propagate it; it should be rotated and removed from version control.

## Omni agent workflow (AGENT_MEMORY.md)
When run as the Omni Synthetic Intelligence Agent on the `imperium` project:
1. Read `AGENT_MEMORY.md` first (project health scores, AI-decided priorities, reasoning, cross-project patterns, full edit history). Never repeat work already in Edit History.
2. Execute the priorities in `AGENT_MEMORY.md` in order.
3. After priorities, run Visual Error Detection: broken images / missing alt text; mobile layout overflow (hardcoded widths, missing responsive classes); missing `loading.tsx` skeletons; build console errors; dead links (no `href="#"`); dark-theme consistency. Fix each immediately.
4. Per task: state what + why → implement → verify with `npm run build` → commit `git commit -m 'agent: [what you did]'`.
5. After all priorities: look for additional improvements, apply Pattern Library patterns, then `git push`.
- Rules: never modify `.env`; never run DB migrations; always reason before acting; think cross-project (work here may be reused elsewhere); fix visual errors automatically.

## Glossary
- **28 Principles / the Doctrine** — flagship educational curriculum (`web/src/lib/curriculum.ts`); 5 phases, 28 units, ~80 sub-points; Phase I free, II–V subscriber-gated. Each unit opens with a memorizable quote; includes a "Time Works Backwards" unit and the quote "Add structure to chaos and you get power."
- **The Arsenal** — the `/shop` route (merch). Note: subs pay $20/mo for the courses, not the merch.
- **Imperium Inner Circle** — top-tier offer: personal profile on Imperium, lifetime network access, a "$25K digital asset", exclusive cross-platform offers.
- **Omni AI** — the user's umbrella AI ops layer; site is expected to be "connected to omni ai" (Supabase project `odvxtychuxxsudfpcqqs`).
- **Tyrone Ngouamo** — a coach with a profile/referral page (`/tyronengouamo`, `/tyronengouamo/referral`); offerings: personal training (hourly), meal-by-meal nutrition / meal-prep plan, payment-plan tier (Stripe links via Imperium account), Inner Circle referral, share card. Built by cloning the `28principles` landing pattern.
- **Prime IV (Amanda phone agent)** — a separate sales-call script asset ("Amanda – Prime IV Sales Agent" at "Prime IV Hydration & Wellness - Sandy"). Constraints when editing: no emojis; one question then move to schedule an appointment; check if caller is an existing customer — if new, offer the **$85 introductory offer** (typically $200+); if not new, just schedule the appointment; deliver in copy-paste format.

### 28 Principles curriculum outline (rubric/spec — elaborate, do not paste verbatim)
- **PHASE I – IGNITION**: U1 The Power of Purpose; U2 The Rising (Rebirth); U3 The Three Currencies of Life (Time | Money | Knowledge).
- **PHASE II – FOUNDATION**: U4 The Mind is Everything; U5 Chaos to Power; U6 Absolute Ownership; U7 Continuous Growth; U8 The Price of Ambition; U9 Unbreakable Confidence; U10 Mastering Awareness; U11 Emotional Sovereignty; U12 The Power of Gratitude.
- **PHASE III – EXPANSION**: U13 The Builder's Mindset; U14 The Law of Attraction; U15 The Law of Leverage; U16 The Inner Circle.
- **PHASE IV – MASTERY**: U17 Strategy; U18 The Secret; U19 The Salesman; U20 Principle of Reciprocity; U21 Strategic Silence; U22 The Mask; U23 The Art of War; U24 The Alchemist; U25 Enlightenment.
- **PHASE V – LEGACY**: U26 While You're Here; U27 When You're Gone; U28 The Mentor.
