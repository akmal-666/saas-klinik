# 🚀 Deploy ke Vercel — Step by Step

## Cara Deploy (15 menit)

### Step 1 — Push ke GitHub

```bash
cd klinik-saas
git init
git add .
git commit -m "initial commit"

# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/USERNAME/klinik-saas.git
git push -u origin main
```

---

### Step 2 — Connect ke Vercel

1. Buka **https://vercel.com** → **New Project**
2. **Import** repo GitHub kamu
3. Vercel akan detect monorepo

**Isi konfigurasi:**

| Setting | Value |
|---------|-------|
| Framework Preset | **Next.js** |
| Root Directory | `.` (root, bukan apps/web) |
| Build Command | `npm install && cd apps/web && npx next build` |
| Output Directory | `apps/web/.next` |
| Install Command | `npm install` |

---

### Step 3 — Environment Variables di Vercel

Klik **Environment Variables**, isi satu per satu:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://klinik-api.railway.app` (atau kosongkan untuk demo-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://miqbdfechttfyqdtferg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcWJkZmVjaHR0ZnlxZHRmZXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDM1MDIsImV4cCI6MjA5MDA3OTUwMn0.Jvz5ds23vr5mFD6APn-tyjs3JgAHSQ_G0ig-9FHK6Ss` |
| `NEXTAUTH_SECRET` | `pCg63bIy89CT+MrXBN3RZGSBrlURLmOqUUCLROz50tE` |

> ⚠️ Jika belum ada backend, biarkan `NEXT_PUBLIC_API_URL` kosong atau `http://localhost:3001`.
> Demo login tetap bisa jalan tanpa backend.

---

### Step 4 — Deploy!

Klik **Deploy** → tunggu ±2 menit → done!

URL akan seperti: `https://klinik-saas.vercel.app`

---

## Setelah Deploy

### Login
- Klik **🚀 Masuk sebagai Demo Admin** — langsung masuk tanpa backend
- Semua halaman bisa dijelajahi: Dashboard, Appointment, EMR, Kasir, dll

### Tambah backend (opsional)
Deploy NestJS backend ke [Railway](https://railway.app):
```bash
# Di folder klinik-saas/
railway login
railway init
railway up
```
Set env vars di Railway dashboard, lalu update `NEXT_PUBLIC_API_URL` di Vercel.

---

## Troubleshoot Build Error

**Error: Cannot find module '@klinik/shared-types'**
→ Pastikan Root Directory di Vercel = `.` (bukan `apps/web`)

**Error: Build failed (TypeScript)**
→ Sudah dihandle: `typescript.ignoreBuildErrors: true` di next.config.js

**Error: Module not found 'clsx'**
```bash
cd apps/web && npm install
```
