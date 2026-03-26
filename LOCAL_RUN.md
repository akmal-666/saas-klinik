# 🖥️ Local Run Guide — macOS

## Prerequisites

```bash
# Check Node.js version (harus >= 20)
node --version

# Jika belum ada atau < 20:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc   # atau ~/.bashrc
nvm install 20 && nvm use 20 && nvm alias default 20
```

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/your-org/klinik-saas.git
cd klinik-saas

# Install semua dependencies (monorepo)
npm install
```

---

## Step 2 — Setup Supabase

1. Buka **https://supabase.com** → New Project
2. Catat **Project URL** dan **API Keys** dari: Settings → API

### Jalankan Migrations

Buka **SQL Editor** di Supabase Dashboard, paste dan run:

```
1. apps/backend/src/database/migrations/001_initial.sql
2. apps/backend/src/database/migrations/002_icd_and_helpers.sql
3. apps/backend/src/database/migrations/003_seed_demo.sql   ← data demo
```

### Buat User Admin

Di Supabase: **Authentication → Users → Add User**
- Email: `admin@demo.com`  
- Password: `demo1234`
- ✅ Email Confirmed

Lalu di SQL Editor:
```sql
INSERT INTO users (id, clinic_id, email, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@demo.com'),
  '00000000-0000-0000-0000-000000000001',
  'admin@demo.com',
  'Admin Demo',
  'admin_klinik'
);
```

---

## Step 3 — Environment Variables

```bash
# Buat file env dari template
cp .env.local.example .env.local

# Edit dengan editor favorit
open -a "TextEdit" .env.local   # atau: code .env.local
```

**Minimal yang harus diisi:**

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=minimal-32-karakter-gunakan-openssl

NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 64
```

**Sync env ke semua apps:**
```bash
npm run env:sync
```

---

## Step 4 — Run Dev Server

```bash
# Jalankan backend + frontend sekaligus
npm run dev
```

Atau pisah di 2 terminal:
```bash
# Terminal 1 — Backend
npm run dev:backend   # http://localhost:3001

# Terminal 2 — Frontend  
npm run dev:web       # http://localhost:3000
```

---

## URLs

| URL | Keterangan |
|-----|------------|
| http://localhost:3000/login | Login page |
| http://localhost:3000/dashboard | Dashboard |
| http://localhost:3000/appointment | Appointment kalender |
| http://localhost:3000/emr | Rekam medis |
| http://localhost:3000/kasir | Kasir & pembayaran |
| http://localhost:3000/masterdata | Master data |
| http://localhost:3000/payroll | Payroll dokter |
| http://localhost:3000/report | Laporan |
| http://localhost:3000/settings | Settings |
| http://localhost:3001/api/docs | Swagger API |
| http://localhost:3001/api/v1/health | Health check |

**Login demo:**
- Email: `admin@demo.com`
- Password: `demo1234`
- Atau klik tombol **"Masuk sebagai Demo Admin"** (bypass API)

---

## Troubleshooting

### Port 3001 sudah dipakai
```bash
lsof -ti:3001 | xargs kill -9
```

### Module not found: @klinik/shared-types
```bash
npm install
```

### TypeScript error di IDE (VSCode)
```bash
# Ctrl+Shift+P → "TypeScript: Select TypeScript Version" → Use Workspace Version
# Atau tambahkan ke .vscode/settings.json:
mkdir -p .vscode && cat > .vscode/settings.json << 'EOF'
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
EOF
```

### Supabase RLS Error 403
Pastikan:
- Migration `001_initial.sql` sudah dijalankan (termasuk RLS policies)
- `JWT_SECRET` di `.env.local` sama persis dengan yang digunakan untuk sign token
- User di tabel `users` memiliki `clinic_id` yang valid

### NestJS gagal start
```bash
cd apps/backend
cat .env.local   # pastikan env terbaca
npx nest start --watch 2>&1 | head -50
```

---

## Struktur Dev Commands

```bash
npm run dev           # Run semua (turbo)
npm run dev:web       # Next.js saja (port 3000)
npm run dev:backend   # NestJS saja (port 3001)
npm run env:sync      # Copy .env.local ke apps/
npm run build         # Build production
npm run clean         # Hapus .next dan dist
```
