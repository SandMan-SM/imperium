# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Imperium is an e-commerce platform with a Telegram bot for delivering "28 Principles" content. It consists of multiple components:

- **Next.js Web App** (`web/`) - E-commerce storefront with auth, shop, newsletter, and admin
- **Telegram Bot** (`telegram-bot/`) - Python bot for delivering educational content
- **n8n Automations** (`automations/`) - Workflows for inventory sync and daily newsletters
- **Supabase** - Backend database (PostgreSQL)

## Commands

### Web App (Next.js)
```bash
cd web
npm run dev      # Start development server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Telegram Bot (Python)
```bash
cd telegram-bot
pip install -r requirements.txt
python bot.py
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
- `TELEGRAM_BOT_TOKEN` - BotFather token
- `SUPABASE_URL` / `SUPABASE_KEY` - Supabase credentials
- `PRINTIFY_API_KEY` - Printify API for product sync

### Database
Run SQL in `docs/SQL.md` in Supabase SQL Editor to create tables: `products`, `newsletters`, `daily_quotes`.

## Architecture

### Web App Structure (`web/src/`)
- `app/` - Next.js App Router pages:
  - `(auth)/` - Login/signup pages
  - `admin/` - Admin dashboard
  - `shop/` - Product listing
  - `newsletter/` - Newsletter archive
  - `28principles/` - Educational content
  - `portal/` - User portal
  - `api/` - API routes and webhooks (Stripe, Supabase)
- `components/` - Reusable UI components (Header, CartDrawer, ProductShowcase, etc.)
- `lib/` - Utilities: auth-context.tsx, supabase.ts, cart-context.tsx

### Key Dependencies
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, Framer Motion (animations)
- Supabase (auth, database)
- Stripe (payments)
- lucide-react (icons)

### Telegram Bot Structure (`telegram-bot/`)
- `bot.py` - Main entry point
- `handlers/` - Message handlers (start, navigation, progress)
- `content/phases.py` - 28 Principles content
- `database.py` - SQLite for user progress tracking

### n8n Workflows
- `n8n-workflow-printify-sync.json` - Hourly inventory sync from Printify to Supabase
- `n8n-workflow-daily-newsletter.json` - Daily AI-generated newsletter with ComfyUI images

### Database Schema
- `products` - Synced from Printify (id, name, category, price, image_url, in_stock)
- `newsletters` - Generated daily content (title, content, image_url, published)
- `daily_quotes` - AI-generated quotes paired with newsletters
