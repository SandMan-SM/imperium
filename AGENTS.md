# Imperium CEO System Architecture

## Overview
This document outlines the architecture for an AI-driven Imperium business operations system that monitors metrics, processes data, and sends notifications via Telegram.

## Related Systems

### Interlinked AI CEO
- **Location**: `/Users/janahasson/Desktop/Assets/Interlinked`
- **Purpose**: AI-driven business operations for Interlinked
- **Integration**: Shares Telegram automation capabilities

## System Architecture

### 1. Data Ingestion Layer (The "Sensors")
- **Purpose**: Pull data from business platforms into the system
- **Components**:
  - Supabase database integration
  - Stripe payment webhooks
  - Printify inventory sync
  - Newsletter subscribers

### 2. Decision Layer (The "Brain")
- **Purpose**: Process data and make decisions
- **Components**:
  - n8n workflows for automation
  - Telegram bot for notifications

### 3. Action Layer (The "Hands")
- **Purpose**: Execute commands based on decisions
- **Components**:
  - Telegram notifications to admin
  - Stripe webhooks for payments
  - Email automation for newsletters

## Telegram Integration

### Credentials
- **Bot Token**: `7876846081:AAG8UriNM7UaNKTxrR8aIuBlLc8XzGzhKJI`
- **Admin Chat ID**: `8459911167`

### Notification Types
- New lead notifications
- Sale/Payment confirmations
- Inventory alerts
- Daily summary reports

## Business Metrics

### Revenue Targets
- **Monthly Revenue Goal**: $50,000
- **Profit Margin Target**: 30%

### Product Categories
- Hoodies
- Shirts
- Sweats
- Accessories (Beanies, Snapbacks)

### Customer Success
- Lead Response Time: < 2 hours
- Order Fulfillment: < 5 business days

## Quick Start Guide

### 1. System Requirements
- **OS**: macOS Sequoia (M4 MacBook Air compatible)
- **Memory**: 16GB RAM
- **Storage**: 10GB available space
- **Docker**: Docker Desktop installed

### 2. Environment Setup
The following environment variables are configured in `.env`:
```
TELEGRAM_BOT_TOKEN=7876846081:AAG8UriNM7UaNKTxrR8aIuBlLc8XzGzhKJI
TELEGRAM_ADMIN_CHAT_ID=8459911167
SUPABASE_URL=https://odvxtychuxxsudfpcqqs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret>
STRIPE_SECRET_KEY=<secret>
```

### 3. Running the Telegram Bot
```bash
cd telegram-bot
source venv/bin/activate
python bot.py
```

### 4. n8n Automations
```bash
# Import workflows from automations/
# Configure webhooks in n8n
```

## File Paths

### Key Files
- Web App: `web/` - Next.js e-commerce storefront
- Telegram Bot: `telegram-bot/` - Python bot for 28 Principles
- Automations: `automations/` - n8n workflows
- Supabase Migrations: `supabase/migrations/`
- Documentation: `docs/`

### Integration Points
- Stripe: Payments and webhooks
- Printify: Product inventory sync
- Supabase: Database and auth
- Telegram: Admin notifications
- ComfyUI: AI-generated images for newsletters

## Troubleshooting

### Telegram Bot Not Responding
- Check bot token validity
- Verify bot is added to channel/group
- Check API rate limits

### n8n Workflow Failures
- Verify webhook URLs are correct
- Check Supabase connection
- Review workflow execution logs

### Stripe Webhook Issues
- Verify webhook secret
- Check Stripe dashboard for delivery status
- Ensure correct endpoint URL
