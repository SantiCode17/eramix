#!/usr/bin/env bash
# ─────────────────────────────────────────────
# start-db.sh — Arranca MySQL con Docker
# ─────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

echo "🐳 Arrancando MySQL..."
docker compose -f docker-compose.dev.yml up -d

echo "⏳ Esperando que MySQL esté listo..."
until docker exec eramix-db-dev mysqladmin ping -h localhost --silent 2>/dev/null; do
  sleep 1
done

echo "✅ MySQL listo en localhost:${DB_PORT:-3306}"
