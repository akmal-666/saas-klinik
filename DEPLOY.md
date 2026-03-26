# 🚀 Deploy ke Vercel

## Cara 1 — Vercel Dashboard (Recommended)

### Step 1: Push ke GitHub
```bash
cd klinik-saas
git init
git add .
git commit -m "initial commit"
gh repo create klinik-saas --private --push
# atau: git remote add origin https://github.com/USERNAME/klinik-saas.git
#       git push -u origin main
```

### Step 2: Import di Vercel
1. Buka **https://vercel.com/new**
2. Klik **"Import Git Repository"**
3. Pilih repo `klinik-saas`
4. Konfigurasi:

| Setting | Value |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && npm install && npm run build` |
| **Output Directory** | `.next` *(auto-detect)* |
| **Install Command** | *(kosongkan)* |

### Step 3: Environment Variables
Di Vercel → Settings → Environment Variables, tambahkan:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` (atau kosong untuk demo mode) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://miqbdfechttfyqdtferg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (anon key Supabase) |

> **Catatan:** Tanpa `NEXT_PUBLIC_API_URL` yang valid, app tetap bisa dipakai dalam **Demo Mode** — semua fitur UI bisa dicoba tanpa backend.

### Step 4: Deploy
Klik **Deploy** → tunggu ~2 menit → app live! 🎉

---

## Cara 2 — Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy dari root project
cd klinik-saas
vercel

# Ikuti prompt:
# ? Set up and deploy "klinik-saas"? → Yes
# ? Which scope? → pilih account kamu
# ? Link to existing project? → No
# ? What's your project's name? → klinik-saas
# ? In which directory is your code located? → ./
# Override settings? → Yes
#   Build Command: cd apps/web && npm run build
#   Output Directory: apps/web/.next
#   Root Directory: apps/web

# Deploy production
vercel --prod
```

---

## Struktur Build di Vercel

```
Vercel build process:
1. Clone repo
2. Set rootDirectory = apps/web
3. Run: cd ../.. && npm install   ← install semua workspace deps
4. Run: npm run build             ← next build
5. Deploy .next output
```

---

## Setelah Deploy

URL akan seperti: `https://klinik-saas-xxx.vercel.app`

- **Login** → klik 🚀 Masuk sebagai Demo Admin
- **Backend** → deploy NestJS ke Railway.app (optional)

---

## Deploy Backend ke Railway (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

cd klinik-saas
railway init          # pilih "Empty Project"
railway up --service backend

# Set env vars di Railway dashboard:
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, PORT=3001
```

Setelah backend live, update env var di Vercel:
```
NEXT_PUBLIC_API_URL = https://your-app.railway.app
```
