#!/usr/bin/env bash
# ─────────────────────────────────────────────
# start-backend.sh — Compila y arranca Spring Boot
# ─────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."

# Cargar .env si existe
if [ -f .env ]; then
  set -a
  source .env
  set +a
  echo "📦 Variables de entorno cargadas desde .env"
fi

cd backend

echo "🔨 Compilando backend..."
./mvnw -q clean package -DskipTests

echo "🚀 Arrancando EraMix backend en :${BACKEND_PORT:-8080}..."
exec java -jar target/*.jar
