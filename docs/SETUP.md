# Imperium - Daily Automation Setup Guide

## Overview
This system runs two n8n workflows:
1. **Hourly Inventory Sync** - Syncs products from Printify to Supabase
2. **Daily Newsletter** - Generates and posts daily content at 11 AM

## Prerequisites
- [n8n](https://n8n.io/) installed and running
- [Ollama](https://ollama.ai/) with llama3.2 model installed
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) running locally
- [Supabase](https://supabase.com/) project
- [Printify](https://printify.com/) API key

## Setup Steps

### 1. Supabase Database
Run the SQL commands in `SQL.md` in your Supabase SQL Editor:
- Creates `products` table
- Creates `newsletters` table
- Creates `daily_quotes` table
- Sets up Row Level Security policies

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `BOT_TOKEN` - Telegram bot token
- `PRINTIFY_API_KEY` - Get from Printify API integrations
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `TELEGRAM_CHAT_ID` - Your Telegram chat ID for testing

### 3. n8n Credentials
In n8n, create these credentials:

**Supabase:**
- Project URL: `SUPABASE_URL`
- Service Role Key: `SUPABASE_KEY`

**Telegram:**
- Access Token: `BOT_TOKEN`

**HTTP Header Auth (Printify):**
- Headers: `Authorization: Bearer YOUR_PRINTIFY_API_KEY`

### 4. Import Workflows
Import these JSON files into n8n:
- `n8n-workflow-printify-sync.json` - Hourly inventory sync
- `n8n-workflow-daily-newsletter.json` - Daily newsletter

### 5. ComfyUI Setup
Make sure ComfyUI is running at `http://127.0.0.1:8188`

### 6. Ollama Setup
Make sure Ollama is running locally with llama3.2:
```bash
ollama run llama3.2
```

## Folder Structure
```
imperium website/
├── images/
│   └── product-images/
│       ├── shirts/
│       ├── hoodies/
│       ├── sweats/
│       ├── beanies/
│       └── hats/
├── newsletter/
│   └── (generated markdown files)
├── n8n-workflow-printify-sync.json
├── n8n-workflow-daily-newsletter.json
├── SQL.md
├── .env
└── .env.example
```

## Testing

### Test Printify Sync:
1. Open n8n
2. Run the Printify sync workflow manually
3. Check Supabase `products` table for data

### Test Daily Newsletter:
1. Open n8n
2. Run the daily newsletter workflow manually
3. Check:
   - Supabase `newsletters` table
   - Supabase `daily_quotes` table
   - Telegram for the message

## Troubleshooting

### Ollama not responding:
```bash
ollama list  # Check if llama3.2 is installed
ollama run llama3.2 "test"  # Test Ollama
```

### ComfyUI not generating images:
- Check ComfyUI is running: `http://127.0.0.1:8188`
- Check workflow prompt format

### Telegram not sending:
- Verify bot token
- Verify chat ID
- Start conversation with bot first
