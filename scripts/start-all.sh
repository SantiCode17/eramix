#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# start-all.sh — Arranca TODO: DB + Backend + Mobile
#
# Uso:   ./scripts/start-all.sh
#        Ctrl+C para parar todo
# ─────────────────────────────────────────────────────
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Cargar .env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

cleanup() {
  echo ""
  echo "🛑 Parando servicios..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $METRO_PID 2>/dev/null || true
  docker compose -f docker-compose.dev.yml down 2>/dev/null || true
  echo "✅ Todo parado."
}
trap cleanup EXIT INT TERM

# ─── 1. Database ─────────────────────────
echo "═══════════════════════════════════════"
echo "🐳 Paso 1: Arrancando MySQL..."
echo "═══════════════════════════════════════"
docker compose -f docker-compose.dev.yml up -d
until docker exec eramix-db-dev mysqladmin ping -h localhost --silent 2>/dev/null; do
  sleep 1
done
echo "✅ MySQL listo"
echo ""

# ─── 2. Backend ──────────────────────────
echo "═══════════════════════════════════════"
echo "🔨 Paso 2: Compilando y arrancando backend..."
echo "═══════════════════════════════════════"
cd backend
./mvnw -q clean package -DskipTests
java -jar target/*.jar &
BACKEND_PID=$!
cd "$ROOT"

# Esperar a que el backend esté listo
echo "⏳ Esperando backend en :${BACKEND_PORT:-8080}..."
for i in $(seq 1 60); do
  if curl -sf "http://localhost:${BACKEND_PORT:-8080}/actuator/health" >/dev/null 2>&1 || \
     curl -sf "http://localhost:${BACKEND_PORT:-8080}/api/v1/auth/login" >/dev/null 2>&1; then
    break
  fi
  # También check si el proceso sigue vivo
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend crashed. Ver logs arriba."
    exit 1
  fi
  sleep 2
done
echo "✅ Backend arrancado (PID: $BACKEND_PID)"
echo ""

# ─── 3. Mobile ───────────────────────────
echo "═══════════════════════════════════════"
echo "📱 Paso 3: Arrancando Expo..."
echo "═══════════════════════════════════════"
cd mobile
npx expo start --clear &
METRO_PID=$!
cd "$ROOT"

echo ""
echo "═══════════════════════════════════════"
echo "🎉 ¡Todo arrancado!"
echo "   MySQL:   localhost:${DB_PORT:-3306}"
echo "   Backend: http://localhost:${BACKEND_PORT:-8080}"
echo "   Metro:   exp://192.168.8.106:8081"
echo ""
echo "   Ctrl+C para parar todo"
echo "═══════════════════════════════════════"

wait
