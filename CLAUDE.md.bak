# CLAUDE.md — Imperium

## What This Project Is
Imperium is a premium e-commerce and content platform delivering "28 Principles" educational content. It has a Next.js storefront, Supabase auth/database, Stripe subscriptions, Resend email, and a Telegram bot for content delivery. Target revenue: $50,000/month.

## Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Supabase (auth + database + storage), Postgres
- **Payments**: Stripe (subscriptions + webhooks)
- **Email**: Resend + react-email
- **Bot**: Python Telegram bot (telegram-bot/)
- **Deploy**: Vercel (web/), Docker (telegram-bot/)

## Directory Layout
```
web/          → Next.js app — MAIN FOCUS
telegram-bot/ → Python Telegram bot
automations/  → n8n workflows
supabase/     → Database migrations
docs/         → Documentation
```

## Commands
```bash
# Web app
cd web
npm run dev
npm run build
npm run lint

# Telegram bot
cd telegram-bot
source venv/bin/activate
python bot.py
```

## Agent Priorities (in order)
1. **Fix build** — `cd web && npm run build`, fix all TypeScript + lint errors
2. **Complete admin dashboard** — `web/src/app/admin/` — ensure all CRUD operations work: user management, product management, newsletter sending, analytics
3. **Stripe webhooks** — verify `web/src/app/api/webhooks/stripe/` handles: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
4. **Subscription gating** — ensure `/28principles` pages check subscription status from Supabase before rendering content
5. **Newsletter system** — verify newsletter sign-up form saves to Supabase and triggers Resend email
6. **Shop page** — ensure `/shop` loads products from Supabase correctly, add to cart works, checkout flows to Stripe
7. **SEO** — add metadata to all pages, especially `/28principles`, `/shop`
8. **Mobile polish** — full responsive pass at 375px / 768px / 1440px
9. **Error boundaries** — wrap all async components in Suspense + error.tsx

## Design System
- Dark: `from-gray-900 via-gray-800 to-black`
- Gold accent: `text-imperium-gold` (defined in tailwind config)
- Typography: uppercase tracking for headings
- All colors from Tailwind config — no hardcoded hex

## Do NOT Touch
- `.env` / `.env.local`
- `supabase/migrations/` — don't run migrations
- `telegram-bot/venv/`
- `node_modules/`
