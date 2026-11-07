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

# The mirror is a copy, and a copy that silently overwrites work is worse than
# no copy at all: the edit vanishes and the tree looks clean. `web/` is
# allowed to differ from `Website/` only in the one direction — `Website/`
# is the production root and the owner.
#
# So before anything is copied, ask what the copy would change. For every
# file the mirror would touch:
#
#   * a file that exists only in the mirror would be deleted — refuse;
#   * a file with an uncommitted edit in the mirror would lose that edit —
#     refuse;
#   * a file whose last commit in the mirror is newer than the last commit
#     in the production root holds the newer version, and copying down would
#     throw it away — refuse and ask for it to be carried across.
#
# Only when every difference is a change that lives in the production root
# does the copy run.
#
# This is the failure that actually happened: a nightly agent wrote the
# intelligence brief into `web/AGENT_MEMORY.md`, the mirror overwrote it with
# the production root's older copy, and the repository ended up carrying two
# different briefs — one of them a day out of date.
if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  CONFLICTS=""
  CHANGES="$(rsync -a --delete --dry-run --itemize-changes "${EXCLUDES[@]}" "$SRC/" "$DST/" 2>/dev/null || true)"

  last_commit_time() {
    git -C "$ROOT" log -1 --format=%ct -- "$1" 2>/dev/null || echo 0
  }

  while IFS= read -r relative; do
    [[ -z "$relative" ]] && continue
    [[ "$relative" == "." || "$relative" == "./" ]] && continue
    [[ -d "$SRC/$relative" || -d "$DST/$relative" ]] && continue
    # A file whose bytes agree is only a timestamp difference — the copy
    # would refresh its mtime and change nothing else.
    if [[ -f "$SRC/$relative" && -f "$DST/$relative" ]] && cmp -s "$SRC/$relative" "$DST/$relative"; then
      continue
    fi
    if [[ ! -f "$SRC/$relative" ]]; then
      CONFLICTS="${CONFLICTS}  web/${relative} — exists only in the mirror and would be deleted\n"
      continue
    fi
    if [[ -n "$(git -C "$ROOT" status --porcelain -- "web/${relative}")" ]]; then
      CONFLICTS="${CONFLICTS}  web/${relative} — edited in the mirror and not committed\n"
      continue
    fi
    # An uncommitted change in the production root is the reason for the
    # copy — that is the edit the mirror is being brought up to date with.
    if [[ -n "$(git -C "$ROOT" status --porcelain -- "Website/${relative}")" ]]; then
      continue
    fi
    source_time="$(last_commit_time "Website/${relative}")"
    mirror_time="$(last_commit_time "web/${relative}")"
    if [[ "$mirror_time" -gt "$source_time" ]]; then
      CONFLICTS="${CONFLICTS}  web/${relative} — holds the newer edit and would be overwritten\n"
    elif [[ "$mirror_time" -eq "$source_time" ]]; then
      CONFLICTS="${CONFLICTS}  web/${relative} — the two copies were last changed together and still differ\n"
    fi
  done < <(printf '%s\n' "$CHANGES" | awk 'NF { $1=""; sub(/^ +/, ""); print }' | awk '{print $NF}')

  if [[ -n "$CONFLICTS" ]]; then
    echo "REFUSING TO MIRROR: the mirror holds work the production root does not." >&2
    printf '%b' "$CONFLICTS" >&2
    echo >&2
    echo "The production root is Website/. Carry the change across, then run this again:" >&2
    echo "  cp web/<file> Website/<file> && scripts/sync-trees.sh" >&2
    exit 1
  fi
fi

rsync -a --delete "${EXCLUDES[@]}" "$SRC/" "$DST/"
echo "mirrored $SRC -> $DST"
