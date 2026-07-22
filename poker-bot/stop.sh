#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [ ! -f "run/hermes.pid" ]; then
  echo "No Hermes poker session pid file found."
  exit 0
fi

PID="$(cat run/hermes.pid)"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "Stopped Hermes poker session. PID $PID"
else
  echo "Hermes poker session was not running. Removing stale pid."
fi

rm -f run/hermes.pid run/hermes-session.json
