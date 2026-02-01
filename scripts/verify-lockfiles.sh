#!/usr/bin/env bash
set -euo pipefail

missing=0

if [[ ! -f package-lock.json && ! -f pnpm-lock.yaml && ! -f yarn.lock ]]; then
  echo "Missing root lockfile (package-lock.json, pnpm-lock.yaml, or yarn.lock)."
  missing=1
fi

if [[ ! -f apps/web/package-lock.json && ! -f apps/web/pnpm-lock.yaml && ! -f apps/web/yarn.lock ]]; then
  echo "Missing apps/web lockfile (package-lock.json, pnpm-lock.yaml, or yarn.lock)."
  missing=1
fi

if [[ $missing -ne 0 ]]; then
  exit 1
fi
