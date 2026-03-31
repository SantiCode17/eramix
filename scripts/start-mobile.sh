#!/usr/bin/env bash
# ─────────────────────────────────────────────
# start-mobile.sh — Arranca Expo Metro bundler
# ─────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/../mobile"

echo "📱 Arrancando Expo Metro bundler..."
npx expo start --clear
