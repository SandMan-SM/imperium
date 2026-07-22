#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -f ".env" ]; then
  cp .env.template .env
  echo "Created $ROOT/.env"
  echo "Paste your keys into:"
  echo "  TELEGRAM_BOT_TOKEN=..."
  echo "  OPENAI_API_KEY=..."
  exit 1
fi

if grep -q "paste_your_.*_here" .env; then
  echo "Update $ROOT/.env before starting."
  echo "Required:"
  echo "  TELEGRAM_BOT_TOKEN from @BotFather"
  echo "  OPENAI_API_KEY from OpenAI"
  exit 1
fi

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt

mkdir -p logs run

if [ -f "run/hermes.pid" ] && kill -0 "$(cat run/hermes.pid)" 2>/dev/null; then
  echo "Hermes poker session already running. PID $(cat run/hermes.pid)"
  exit 0
fi

nohup python bot.py >> logs/hermes.log 2>&1 &
PID=$!
echo "$PID" > run/hermes.pid

sleep 2
if ! kill -0 "$PID" 2>/dev/null; then
  echo "Hermes poker session failed to start. Last log lines:"
  tail -n 80 logs/hermes.log
  exit 1
fi

echo "Hermes poker session spun up."
echo "PID: $PID"
echo "Session: $ROOT/run/hermes-session.json"
echo "Logs: $ROOT/logs/hermes.log"
