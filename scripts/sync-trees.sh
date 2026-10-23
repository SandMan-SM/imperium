#!/usr/bin/env bash
# Keep the `web/` tree byte-identical to the production root `Website/`.
#
# Production (Vercel project `imperium`) builds `Website/`, rootDirectory
# `Website`. `web/` is a mirror kept because tooling and documentation still
# point at it. Two half-synced trees are a shipping hazard: edits land in the
# tree that does not ship and ship as no-ops.
#
# Usage:
#   scripts/sync-trees.sh          # mirror Website/ -> web/
#   scripts/sync-trees.sh --check  # exit 1 if the trees have drifted
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/Website"
DST="$ROOT/web"

EXCLUDES=(
  --exclude '.git'
  --exclude 'node_modules'
  --exclude '.next'
  --exclude 'out'
  --exclude '.vercel'
  --exclude '.vercel-OLD-root'
  --exclude 'tsconfig.tsbuildinfo'
)

if [[ "${1:-}" == "--check" ]]; then
  if diff -rq "${EXCLUDES[@]}" "$SRC" "$DST" >/dev/null; then
    echo "trees are in sync"
    exit 0
  fi
  echo "TREE DRIFT: Website/ and web/ differ. Run scripts/sync-trees.sh" >&2
  diff -rq "${EXCLUDES[@]}" "$SRC" "$DST" >&2
  exit 1
fi

rsync -a --delete "${EXCLUDES[@]}" "$SRC/" "$DST/"
echo "mirrored $SRC -> $DST"
