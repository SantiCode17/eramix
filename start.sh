#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  EraMix — Start Script v3.1 (Production-Grade)
#
#  STRATEGY:
#    MySQL  → Prefer native (systemd). Docker only if native absent.
#    Redis  → Always Docker (lightweight, no native conflict).
#    Backend → Local Maven JAR (NOT Docker).
#    Mobile  → Expo --lan (foreground, QR visible).
#
#  USAGE:
#    ./start.sh          — start everything
#    ./start.sh db       — only database + redis
#    ./start.sh backend  — only backend (assumes db running)
#    ./start.sh mobile   — only mobile (assumes backend running)
#    ./start.sh stop     — stop all services
#    ./start.sh clean    — deep clean before starting
# ═══════════════════════════════════════════════════════════
set -uo pipefail  # NO set -e — we handle errors ourselves

# ── Colors ────────────────────────────────────────
GOLD='\033[38;5;214m'
GREEN='\033[38;5;35m'
RED='\033[38;5;196m'
CYAN='\033[38;5;45m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Paths ─────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$PROJECT_DIR/.logs"
BACKEND_DIR="$PROJECT_DIR/backend"
MOBILE_DIR="$PROJECT_DIR/mobile"
ENV_FILE="$PROJECT_DIR/.env"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

mkdir -p "$LOG_DIR"

# ── Load .env ─────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-eramix}"
DB_USERNAME="${DB_USERNAME:-eramix_user}"
DB_PASSWORD="${DB_PASSWORD:-eramix_pass}"
REDIS_PORT="${REDIS_PORT:-6379}"
BACKEND_PORT="${BACKEND_PORT:-8080}"

# ── Helpers ───────────────────────────────────────
ok()   { echo -e "  ${GREEN}✔${RESET} $1"; }
fail() { echo -e "  ${RED}✘${RESET} $1"; }
info() { echo -e "  ${CYAN}ℹ${RESET} ${DIM}$1${RESET}"; }
warn() { echo -e "  ${GOLD}⚠${RESET} $1"; }
section() { echo ""; echo -e "${BOLD}${GOLD}  ▸ $1${RESET}"; echo ""; }

# ── Diagnostic helper ─────────────────────────────
diagnose_issue() {
  local issue="$1"
  echo ""
  echo -e "  ${RED}Diagnosis Report:${RESET}"
  case "$issue" in
    "node")
      info "Node.js not found. Install it:"
      info "  macOS: brew install node"
      info "  Ubuntu: sudo apt-get install nodejs npm"
      info "  Windows: https://nodejs.org/"
      ;;
    "docker")
      info "Docker not found. Install it:"
      info "  https://docs.docker.com/get-docker/"
      ;;
    "java")
      info "Java not found. Install it:"
      info "  macOS: brew install java"
      info "  Ubuntu: sudo apt-get install openjdk-21-jdk"
      ;;
    "network")
      info "Network connectivity issue. Trying offline mode..."
      export NPM_CONFIG_PREFER_OFFLINE=true
      export NPM_CONFIG_NO_AUDIT=true
      ;;
  esac
}

banner() {
  echo -e "${GOLD}"
  cat << 'ART'
   ███████╗██████╗  █████╗ ███╗   ███╗██╗██╗  ██╗
   ██╔════╝██╔══██╗██╔══██╗████╗ ████║██║╚██╗██╔╝
   █████╗  ██████╔╝███████║██╔████╔██║██║ ╚███╔╝
   ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██║ ██╔██╗
   ███████╗██║  ██║██║  ██║██║ ╚═╝ ██║██║██╔╝ ██╗
   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝
ART
  echo -e "${RESET}"
  echo -e "  ${DIM}Tu aventura Erasmus empieza aquí — v3.1${RESET}"
  echo ""
}

# ── Detect host LAN IP ───────────────────────────
get_lan_ip() {
  ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}' \
    || hostname -I 2>/dev/null | awk '{print $1}' \
    || echo "localhost"
}

# ══════════════════════════════════════════════════
#  PRE-FLIGHT
# ══════════════════════════════════════════════════
preflight() {
  section "Pre-flight Checks"
  local missing=0

  # Check basic requirements
  for cmd in docker node npm java curl; do
    if command -v "$cmd" &>/dev/null; then
      ok "$cmd found"
    else
      fail "$cmd NOT found"
      diagnose_issue "$cmd"
      missing=1
    fi
  done

  if [[ $missing -eq 1 ]]; then
    echo ""
    fail "Missing dependencies. Install them and try again."
    exit 1
  fi
  
  # Warn about potential issues
  info "Additional checks..."
  
  # Check Node version
  local node_version
  node_version=$(node -v 2>/dev/null | cut -d'v' -f2)
  if [[ $node_version < "18" ]]; then
    warn "Node.js version ($node_version) is < 18. Consider upgrading."
  else
    ok "Node.js version: $node_version"
  fi
  
  # Check Java version
  local java_version
  java_version=$(java -version 2>&1 | grep -oP '(?<=")[^"]*' | head -1)
  if [[ -z "$java_version" ]]; then
    fail "Cannot determine Java version"
  else
    ok "Java version: $java_version"
  fi
}

# ══════════════════════════════════════════════════
#  PORT CHECK — detect what is using a port
# ══════════════════════════════════════════════════
port_in_use() {
  ss -tlnp 2>/dev/null | grep -q ":${1} " && return 0
  return 1
}

port_used_by_docker() {
  docker ps --format '{{.Ports}}' 2>/dev/null | grep -q "0.0.0.0:${1}->" && return 0
  return 1
}

# ══════════════════════════════════════════════════
#  DATABASE — Smart: native first, Docker fallback
# ══════════════════════════════════════════════════
mysql_can_connect() {
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
    -e "SELECT 1" "$DB_NAME" &>/dev/null
}

ensure_db_and_user() {
  # Try to create database + user via root if app user can't connect
  info "Ensuring database '$DB_NAME' and user '$DB_USERNAME' exist..."
  # Try common root passwords
  for root_pw in "${MYSQL_ROOT_PASSWORD:-rootpass}" "rootpass" "root" ""; do
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u root -p"$root_pw" -e "SELECT 1" &>/dev/null 2>&1; then
      mysql -h "$DB_HOST" -P "$DB_PORT" -u root -p"$root_pw" <<-SQL 2>/dev/null
        CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
        CREATE USER IF NOT EXISTS '$DB_USERNAME'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
        CREATE USER IF NOT EXISTS '$DB_USERNAME'@'%' IDENTIFIED BY '$DB_PASSWORD';
        GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USERNAME'@'localhost';
        GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USERNAME'@'%';
        FLUSH PRIVILEGES;
SQL
      ok "Database and user ensured (root pw matched)"
      return 0
    fi
  done
  return 1
}

start_database() {
  section "Database (MySQL + Redis)"

  # ─── MySQL ──────────────────────────────────

  # Case 1: Already connectable — done
  if mysql_can_connect; then
    ok "MySQL accessible at ${DB_HOST}:${DB_PORT}/${DB_NAME}"

  # Case 2: Port in use (native MySQL running) but can't connect with app creds
  elif port_in_use "$DB_PORT" && ! port_used_by_docker "$DB_PORT"; then
    info "Native MySQL detected on port ${DB_PORT}"
    if ensure_db_and_user; then
      if mysql_can_connect; then
        ok "MySQL connection verified after setup"
      else
        fail "Cannot connect to MySQL even after creating DB/user"
        info "Check: DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_USERNAME=$DB_USERNAME"
        info "Try:   mysql -u root -p -e \"GRANT ALL ON $DB_NAME.* TO '$DB_USERNAME'@'localhost' IDENTIFIED BY '$DB_PASSWORD';\""
        exit 1
      fi
    else
      fail "Cannot access MySQL as root to create DB/user"
      info "Either create the database manually or set MYSQL_ROOT_PASSWORD in .env"
      exit 1
    fi

  # Case 3: Port used by a Docker container — check if it's ours
  elif port_used_by_docker "$DB_PORT"; then
    info "Docker MySQL already on port ${DB_PORT}"
    # Wait a bit in case it's still starting
    local retries=20
    while [[ $retries -gt 0 ]]; do
      mysql_can_connect && break
      sleep 2; retries=$((retries - 1))
    done
    if mysql_can_connect; then
      ok "Docker MySQL accessible"
    else
      fail "Docker MySQL on port ${DB_PORT} but cannot connect"
      exit 1
    fi

  # Case 4: Nothing on the port — start Docker MySQL
  else
    info "No MySQL detected — starting Docker container..."
    docker rm -f eramix-db-dev 2>/dev/null || true

    docker run -d \
      --name eramix-db-dev \
      -p "${DB_PORT}:3306" \
      -e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-rootpass}" \
      -e MYSQL_DATABASE="$DB_NAME" \
      -e MYSQL_USER="$DB_USERNAME" \
      -e MYSQL_PASSWORD="$DB_PASSWORD" \
      -v eramix-db-dev-data:/var/lib/mysql \
      --health-cmd='mysqladmin ping -h localhost' \
      --health-interval=5s \
      --health-timeout=3s \
      --health-retries=10 \
      mysql:8 > "$LOG_DIR/docker-mysql.log" 2>&1

    if [[ $? -ne 0 ]]; then
      fail "Failed to start Docker MySQL"
      info "Log: $LOG_DIR/docker-mysql.log"
      exit 1
    fi

    info "Waiting for Docker MySQL to initialize..."
    local retries=45
    while [[ $retries -gt 0 ]]; do
      if docker exec eramix-db-dev mysqladmin ping -h localhost --silent 2>/dev/null; then
        break
      fi
      sleep 2; retries=$((retries - 1))
    done

    if [[ $retries -eq 0 ]]; then
      fail "Docker MySQL timed out"; exit 1
    fi

    sleep 3  # let grants finish

    if mysql_can_connect; then
      ok "Docker MySQL ready at ${DB_HOST}:${DB_PORT}/${DB_NAME}"
    else
      fail "Docker MySQL started but cannot connect — check credentials"
      exit 1
    fi
  fi

  # ─── Redis ─────────────────────────────────
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -qw 'eramix-redis'; then
    ok "Redis already running"
  else
    info "Starting Redis..."
    docker rm -f eramix-redis 2>/dev/null || true

    docker run -d \
      --name eramix-redis \
      -p "${REDIS_PORT}:6379" \
      -v eramix-redis-data:/data \
      --health-cmd='redis-cli ping' \
      --health-interval=5s \
      --health-timeout=3s \
      --health-retries=5 \
      redis:7-alpine > "$LOG_DIR/docker-redis.log" 2>&1

    if [[ $? -ne 0 ]]; then
      fail "Failed to start Redis"; exit 1
    fi

    local retries=15
    while [[ $retries -gt 0 ]]; do
      docker exec eramix-redis redis-cli ping 2>/dev/null | grep -q PONG && break
      sleep 1; retries=$((retries - 1))
    done

    [[ $retries -eq 0 ]] && warn "Redis may still be starting..." || ok "Redis running on port ${REDIS_PORT}"
  fi

  echo ""
}

# ══════════════════════════════════════════════════
#  BACKEND — Local Maven JAR
# ══════════════════════════════════════════════════
start_backend() {
  section "Backend (Spring Boot)"

  # Kill stale process
  local old_pid
  old_pid=$(lsof -ti:${BACKEND_PORT} 2>/dev/null || true)
  if [[ -n "$old_pid" ]]; then
    info "Stopping old process on port ${BACKEND_PORT} (PID: $old_pid)"
    kill -9 $old_pid 2>/dev/null || true
    sleep 1
  fi

  cd "$BACKEND_DIR"

  if [[ ! -f "mvnw" ]]; then
    fail "No mvnw found in $BACKEND_DIR"; exit 1
  fi

  chmod +x mvnw 2>/dev/null || true

  # Check if JAR already exists and is recent
  local jar_file
  jar_file=$(find target -maxdepth 1 -name "*.jar" ! -name "*original*" 2>/dev/null | head -1)
  
  if [[ -n "$jar_file" && -f "$jar_file" ]]; then
    local jar_age=$(($(date +%s) - $(stat -c%Y "$jar_file" 2>/dev/null || stat -f%m "$jar_file" 2>/dev/null || echo 0)))
    if [[ $jar_age -lt 300 ]]; then  # JAR menos de 5 minutos, skip build
      ok "Using cached JAR ($(date -u -d @$jar_age +%Mm%Ss 2>/dev/null || echo '5m'))"
    else
      # Build only changed files
      info "Compiling changes... (5-15s)"
      if ./mvnw package -DskipTests -q > "$LOG_DIR/backend-build.log" 2>&1; then
        ok "Build successful"
      else
        fail "Build failed — trying clean rebuild..."
        if ./mvnw clean package -DskipTests -q > "$LOG_DIR/backend-build.log" 2>&1; then
          ok "Clean build successful"
        else
          fail "Build failed"
          tail -10 "$LOG_DIR/backend-build.log" 2>/dev/null
          exit 1
        fi
      fi
      jar_file=$(find target -maxdepth 1 -name "*.jar" ! -name "*original*" 2>/dev/null | head -1)
    fi
  else
    # First time build
    info "First build... (30-60s)"
    if ./mvnw clean package -DskipTests -q > "$LOG_DIR/backend-build.log" 2>&1; then
      ok "Build successful"
    else
      fail "Build failed"
      tail -10 "$LOG_DIR/backend-build.log" 2>/dev/null
      exit 1
    fi
    jar_file=$(find target -maxdepth 1 -name "*.jar" ! -name "*original*" 2>/dev/null | head -1)
  fi

  if [[ -z "$jar_file" ]]; then
    fail "No JAR found in target/"; exit 1
  fi

  # Start
  info "Starting $jar_file..."
  nohup java -jar "$jar_file" > "$LOG_DIR/backend.log" 2>&1 &
  local server_pid=$!
  echo "$server_pid" > "$LOG_DIR/backend.pid"

  local retries=30
  while [[ $retries -gt 0 ]]; do
    if curl -sf "http://localhost:${BACKEND_PORT}/actuator/health" >/dev/null 2>&1; then
      break
    fi
    if ! kill -0 $server_pid 2>/dev/null; then
      fail "Backend crashed during startup"
      tail -10 "$LOG_DIR/backend.log" 2>/dev/null
      exit 1
    fi
    sleep 1; retries=$((retries - 1))
  done

  if [[ $retries -eq 0 ]]; then
    warn "Backend slow to start — check $LOG_DIR/backend.log"
  else
    ok "Backend running on ${CYAN}http://localhost:${BACKEND_PORT}${RESET}"
    local health
    health=$(curl -sf "http://localhost:${BACKEND_PORT}/actuator/health" 2>/dev/null || echo '{}')
    echo "$health" | grep -q '"UP"' && ok "Health: ${GREEN}UP${RESET}"
  fi

  cd "$PROJECT_DIR"
  echo ""
}

# ══════════════════════════════════════════════════
#  MOBILE — Expo LAN with Network Optimization
# ══════════════════════════════════════════════════
start_mobile() {
  section "Mobile (Expo)"

  cd "$MOBILE_DIR"

  # ─── Only clean caches if explicitly requested ──
  if [[ "${CLEAN_CACHES:-false}" == "true" ]]; then
    info "Cleaning up caches and temporary files..."
    rm -rf .expo .expo-shared node_modules/.cache metro-cache .metro-bundler-cache 2>/dev/null || true
    npm cache clean --force > /dev/null 2>&1 || true
    ok "Caches cleaned"
  fi

  # ─── Quick cache cleanup (essential only) ────────
  rm -rf .expo/qr-code.png 2>/dev/null || true

  # ─── Configure npm with minimal settings ────────
  npm config set registry https://registry.npmjs.org/ > /dev/null 2>&1 || true
  npm config set @expo:registry https://registry.npmjs.org/ > /dev/null 2>&1 || true
  ok "Registry configured"

  # ─── Create robust .env for Expo ────────────────
  info "Setting up environment variables..."
  cat > .env << 'MOBILEENV'
# Expo — Disable network-dependent dependency validation
EXPO_NO_DOCTOR=1
EXPO_NO_DEPENDENCY_VALIDATION=1
EXPO_NO_TELEMETRY=1

# Metro — Aggressive caching and offline mode
METRO_RESET_CACHE=1
METRO_NO_SYMLINKS=1

# React Native — Increase timeouts
REACT_NATIVE_PACKAGER_TIMEOUT=180000
REACT_NATIVE_MAX_WORKERS=4

# General
NODE_ENV=development
NODE_OPTIONS=--max-old-space-size=4096

MOBILEENV
  ok ".env configured"

  # ─── Install dependencies with smart logic ──────
  if [[ ! -d "node_modules" ]]; then
    info "Installing dependencies... (first time)"
    if npm install --legacy-peer-deps --prefer-offline --no-audit > "$LOG_DIR/mobile-install.log" 2>&1; then
      ok "Dependencies installed"
    else
      fail "Dependencies installation failed"
      tail -5 "$LOG_DIR/mobile-install.log"
      return 1
    fi
  else
    info "Using cached dependencies"
  fi

  # ─── Get LAN IP ────────────────────────────────
  local lan_ip
  lan_ip=$(get_lan_ip)
  info "LAN IP: ${CYAN}${lan_ip}${RESET}"

  # ─── Launch Expo with production-grade settings ──
  ok "Starting Expo development server..."
  echo ""
  echo -e "  ${DIM}─────────────────────────────────────────${RESET}"
  echo -e "  ${GREEN}✓${RESET}  Backend is running at http://${lan_ip}:${BACKEND_PORT}"
  echo -e "  ${GREEN}✓${RESET}  Redis is running at localhost:${REDIS_PORT}"
  echo -e "  ${DIM}─────────────────────────────────────────${RESET}"
  echo -e "  ${BOLD}Scan the QR below with Expo Go${RESET}"
  echo -e "  ${DIM}Press ${BOLD}Ctrl+C${RESET}${DIM} to stop all services${RESET}"
  echo -e "  ${DIM}─────────────────────────────────────────${RESET}"
  echo ""

  # ─── Export all environment variables ──────────
  export EXPO_NO_DOCTOR=1
  export EXPO_NO_DEPENDENCY_VALIDATION=1
  export EXPO_NO_TELEMETRY=1
  export REACT_NATIVE_PACKAGER_TIMEOUT=180000
  export REACT_NATIVE_MAX_WORKERS=4
  export NODE_ENV=development
  export NODE_OPTIONS="--max-old-space-size=4096"
  export REACT_NATIVE_PACKAGER_HOSTNAME="$lan_ip"
  export EXPO_PUBLIC_API_URL="http://${lan_ip}:${BACKEND_PORT}"

  # ─── Start Expo (foreground, interactive — QR visible) ──
  npx expo start --lan
}

# ══════════════════════════════════════════════════
#  SUMMARY
# ══════════════════════════════════════════════════
show_summary() {
  local lan_ip
  lan_ip=$(get_lan_ip)

  echo ""
  echo -e "${BOLD}${GOLD}  ═══════════════════════════════════════${RESET}"
  echo -e "  ${GREEN}✔${RESET}  Infrastructure ready!"
  echo -e "${BOLD}${GOLD}  ═══════════════════════════════════════${RESET}"
  echo ""
  echo -e "  ${CYAN}Backend${RESET}   → http://localhost:${BACKEND_PORT}"
  echo -e "  ${CYAN}Health${RESET}    → http://localhost:${BACKEND_PORT}/actuator/health"
  echo -e "  ${CYAN}MySQL${RESET}     → ${DB_HOST}:${DB_PORT}/${DB_NAME}"
  echo -e "  ${CYAN}Redis${RESET}     → localhost:${REDIS_PORT}"
  echo -e "  ${CYAN}LAN IP${RESET}    → ${lan_ip}"
  echo ""
  echo -e "  ${DIM}Logs: $LOG_DIR${RESET}"
  echo ""
}

# ══════════════════════════════════════════════════
#  CLEANUP
# ══════════════════════════════════════════════════
cleanup() {
  echo ""
  echo -e "  ${GOLD}⏹${RESET}  Shutting down EraMix..."

  # Backend
  if [[ -f "$LOG_DIR/backend.pid" ]]; then
    local pid; pid=$(cat "$LOG_DIR/backend.pid")
    kill "$pid" 2>/dev/null && ok "Backend stopped (PID $pid)" || true
    rm -f "$LOG_DIR/backend.pid"
  fi
  local leftover; leftover=$(lsof -ti:${BACKEND_PORT} 2>/dev/null || true)
  [[ -n "$leftover" ]] && kill -9 $leftover 2>/dev/null || true

  # Docker containers (Redis + Docker MySQL if we started it)
  docker stop eramix-redis 2>/dev/null && ok "Redis stopped" || true
  docker stop eramix-db-dev 2>/dev/null && ok "Docker MySQL stopped" || true

  echo -e "  ${GREEN}✔${RESET} All stopped. ${GOLD}¡Hasta pronto!${RESET}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ══════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════
main() {
  clear
  banner
  preflight
  start_database
  start_backend
  show_summary
  start_mobile  # foreground — keeps script alive
}

case "${1:-all}" in
  db|database)   banner; preflight; start_database ;;
  backend|api)   banner; preflight; start_backend; show_summary ;;
  mobile|app)    banner; preflight; start_mobile ;;
  clean)         banner; bash "$SCRIPTS_DIR/deep-clean.sh"; echo ""; info "You can now run: ./start.sh" ;;
  stop)          cleanup ;;
  all|*)         main ;;
esac
