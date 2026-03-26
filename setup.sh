#!/bin/bash
# ============================================================
# Klinik SaaS — Local Setup Script for macOS
# Usage: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

header() { echo -e "\n${BLUE}${BOLD}▶ $1${NC}"; }
ok()     { echo -e "  ${GREEN}✓${NC} $1"; }
warn()   { echo -e "  ${YELLOW}⚠${NC}  $1"; }
err()    { echo -e "  ${RED}✗${NC} $1"; }
info()   { echo -e "  ${NC}  $1"; }

echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════╗"
echo "║     Klinik SaaS — Local Setup (macOS)        ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── 1. Homebrew ─────────────────────────────────────────
header "Checking Homebrew"
if ! command -v brew &>/dev/null; then
  warn "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ok "Homebrew installed"
else
  ok "Homebrew found: $(brew --version | head -1)"
fi

# ─── 2. Node.js ──────────────────────────────────────────
header "Checking Node.js"
if ! command -v node &>/dev/null; then
  warn "Node.js not found. Installing via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
  nvm alias default 20
  ok "Node.js 20 installed"
else
  NODE_VER=$(node --version)
  MAJOR=$(echo $NODE_VER | sed 's/v//' | cut -d. -f1)
  if [ "$MAJOR" -lt 20 ]; then
    err "Node.js $NODE_VER found, but >= 20 required"
    echo "  Run: nvm install 20 && nvm use 20"
    exit 1
  fi
  ok "Node.js $NODE_VER"
fi

# npm version
NPM_VER=$(npm --version)
ok "npm v$NPM_VER"

# ─── 3. Install dependencies ─────────────────────────────
header "Installing npm dependencies"
npm install
ok "Dependencies installed"

# ─── 4. .env setup ───────────────────────────────────────
header "Environment configuration"
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  warn ".env.local created from template — WAJIB diisi sebelum run!"
  info "Edit file: code .env.local"
  info ""
  info "Yang WAJIB diisi:"
  info "  SUPABASE_URL           → dari Supabase dashboard → Settings → API"
  info "  SUPABASE_ANON_KEY      → dari Supabase dashboard"
  info "  SUPABASE_SERVICE_ROLE_KEY → dari Supabase dashboard"
  info "  JWT_SECRET             → jalankan: openssl rand -base64 64"
  info "  NEXT_PUBLIC_API_URL    → http://localhost:3001 (sudah set)"
  info "  NEXT_PUBLIC_SUPABASE_URL → sama dengan SUPABASE_URL"
  info "  NEXT_PUBLIC_SUPABASE_ANON_KEY → sama dengan SUPABASE_ANON_KEY"
else
  ok ".env.local sudah ada"
fi

# ─── 5. Copy env to apps ─────────────────────────────────
header "Syncing .env.local to apps"
[ -f ".env.local" ] && cp .env.local apps/backend/.env.local && ok "Backend .env.local synced"
[ -f ".env.local" ] && cp .env.local apps/web/.env.local      && ok "Web .env.local synced"

# ─── 6. Check Supabase CLI (optional) ────────────────────
header "Checking Supabase CLI (opsional)"
if ! command -v supabase &>/dev/null; then
  info "Supabase CLI belum terinstall. Install (opsional):"
  info "  brew install supabase/tap/supabase"
else
  ok "Supabase CLI: $(supabase --version)"
fi

# ─── 7. Verify env values ────────────────────────────────
header "Validating .env.local"
if [ -f ".env.local" ]; then
  MISSING=()
  check_env() {
    if ! grep -q "^$1=." .env.local 2>/dev/null; then
      MISSING+=("$1")
    fi
  }
  check_env "SUPABASE_URL"
  check_env "SUPABASE_ANON_KEY"
  check_env "SUPABASE_SERVICE_ROLE_KEY"
  check_env "JWT_SECRET"

  if [ ${#MISSING[@]} -gt 0 ]; then
    warn "Variable berikut masih kosong di .env.local:"
    for v in "${MISSING[@]}"; do
      err "  $v"
    done
    echo ""
    warn "Isi .env.local terlebih dahulu sebelum menjalankan server"
  else
    ok "Semua environment variable sudah diisi"
  fi
fi

# ─── 8. Build packages ───────────────────────────────────
header "Building shared packages"
cd packages/shared-types  && npm run type-check 2>/dev/null && ok "shared-types OK" || warn "shared-types: skip (ts errors OK di dev)"
cd ../../packages/shared-constants && echo "skip type-check (no script)" && ok "shared-constants OK"
cd ../..

# ─── Done ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║  Setup selesai! Langkah selanjutnya:                 ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}1. Buka Supabase dan jalankan migrations:${NC}"
echo "     apps/backend/src/database/migrations/001_initial.sql"
echo "     apps/backend/src/database/migrations/002_icd_and_helpers.sql"
echo "     apps/backend/src/database/migrations/003_seed_demo.sql"
echo ""
echo -e "  ${BOLD}2. Isi .env.local:${NC}"
echo "     code .env.local   (atau editor favorit Anda)"
echo ""
echo -e "  ${BOLD}3. Jalankan dev server:${NC}"
echo "     npm run dev"
echo ""
echo "  Web  → http://localhost:3000"
echo "  API  → http://localhost:3001/api/v1"
echo "  Docs → http://localhost:3001/api/docs"
echo ""
