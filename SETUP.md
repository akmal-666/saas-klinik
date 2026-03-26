# 🚀 Klinik SaaS — Setup Guide

Panduan lengkap untuk menjalankan project dari nol.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20.0 |
| npm | ≥ 10.0 |
| Git | any |
| Supabase account | free tier OK |

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/your-org/klinik-saas.git
cd klinik-saas
npm install
```

---

## Step 2 — Buat Supabase Project

1. Buka https://supabase.com → New Project
2. Catat: **Project URL**, **anon key**, **service_role key**
3. Buka **SQL Editor** di Supabase Dashboard

---

## Step 3 — Jalankan Migrations (urutan penting!)

Paste dan run **satu per satu** di Supabase SQL Editor:

```
apps/backend/src/database/migrations/001_initial.sql
apps/backend/src/database/migrations/002_icd_and_helpers.sql
apps/backend/src/database/migrations/003_seed_demo.sql  ← (opsional, untuk dev)
```

Migration ini membuat:
- ✅ 22 tabel dengan foreign keys & constraints
- ✅ Row Level Security (RLS) isolasi per `clinic_id`
- ✅ Auto-generate No. RM (`RM-YYYYMMDD-XXXXX`)
- ✅ Auto-generate No. Invoice (`INV-YYYYMMDD-XXX`)
- ✅ 15 compound indexes (termasuk partial index appointment aktif)
- ✅ ICD-10 dental 150+ kode (standar Kemenkes RI)
- ✅ ICD-9-CM 40+ kode tindakan dental
- ✅ PostgreSQL functions: `search_icd10()`, `get_patient_deposit_balance()`
- ✅ View `satusehat_pending` untuk BullMQ worker

---

## Step 4 — Buat User Admin Pertama

Di Supabase Dashboard → **Authentication** → **Users** → **Add user**:
- Email: `admin@audydental.co.id`
- Password: (bebas)
- Email confirmed: ✓

Lalu di **SQL Editor**:
```sql
INSERT INTO users (id, clinic_id, email, full_name, role)
VALUES (
  'UUID_DARI_AUTH_USER',  -- copy dari Auth > Users
  '00000000-0000-0000-0000-000000000001',  -- demo clinic ID dari seed
  'admin@audydental.co.id',
  'Bukhori Akmal',
  'admin_klinik'
);
```

---

## Step 5 — Environment Variables

```bash
cp .env.example .env
```

Isi minimal untuk development:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Auth
JWT_SECRET=minimal-32-karakter-secret-key-aman

# App
NODE_ENV=development
PORT=3001

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

> Redis (Upstash) dan WhatsApp API bersifat **opsional** untuk development.

---

## Step 6 — Run Development

```bash
# Jalankan SEMUA apps sekaligus (recommended)
npm run dev

# Atau individual:
npm run dev --filter=@klinik/web       # → http://localhost:3000
npm run dev --filter=@klinik/backend   # → http://localhost:3001
```

**URL penting:**
| URL | Keterangan |
|---|---|
| http://localhost:3000/login | Login page |
| http://localhost:3000/dashboard | Dashboard |
| http://localhost:3001/api/docs | Swagger API docs |
| http://localhost:3001/api/v1/health | Health check |

---

## Step 7 — Login

Gunakan kredensial yang dibuat di Step 4, atau klik **"Masuk sebagai Demo Admin"** di halaman login (bypass API untuk testing).

---

## Struktur Folder

```
klinik-saas/
├── turbo.json                 # Monorepo pipeline
├── packages/
│   ├── shared-types/          # TypeScript interfaces (40+)
│   └── shared-constants/      # ICD-10/9, status flow, RBAC
└── apps/
    ├── web/                   # Next.js 14 (App Router)
    │   └── src/
    │       ├── app/           # Page routes
    │       │   ├── login/     # Auth page
    │       │   └── (dashboard)/
    │       │       ├── dashboard/
    │       │       ├── appointment/
    │       │       ├── emr/
    │       │       ├── kasir/
    │       │       ├── masterdata/
    │       │       ├── payroll/
    │       │       ├── report/
    │       │       └── settings/
    │       ├── components/    # React components
    │       ├── hooks/         # React Query hooks
    │       └── lib/           # API client, Zustand store
    └── backend/               # NestJS (TypeScript)
        └── src/
            ├── modules/
            │   ├── auth/           ✅ JWT login/refresh
            │   ├── appointment/    ✅ CRUD + status flow
            │   ├── emr/            ✅ SOAP + ICD + consent
            │   ├── kasir/          ✅ Invoice + payment + deposit
            │   ├── patients/       ✅ CRUD + search
            │   ├── doctors/        ✅ CRUD + jadwal
            │   ├── treatments/     ✅ CRUD + kategori
            │   ├── payroll/        ✅ Hitung bagi hasil
            │   ├── reports/        ✅ Revenue + visit
            │   ├── satu-sehat/     ✅ FHIR R4 sync
            │   └── notifications/  ✅ WhatsApp template
            ├── queues/             ✅ BullMQ service stub
            └── database/
                └── migrations/
                    ├── 001_initial.sql    ✅ Schema lengkap
                    ├── 002_icd_helpers.sql ✅ Functions + views
                    └── 003_seed_demo.sql  ✅ Data demo
```

---

## Deployment

### Web (Vercel)
```bash
# Push ke GitHub → connect di vercel.com
# Set environment variables di Vercel dashboard
vercel --prod
```

### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

Set env vars di Railway dashboard dari `.env.example`.

---

## API Quick Reference

### Auth
```
POST   /api/v1/auth/login         → { access_token, refresh_token, user }
POST   /api/v1/auth/refresh       → { access_token }
GET    /api/v1/auth/me            → current user + clinic
```

### Appointment
```
GET    /api/v1/appointments?date=&doctor_id=&view=calendar
POST   /api/v1/appointments
PATCH  /api/v1/appointments/:id/status
PUT    /api/v1/appointments/:id/reschedule
DELETE /api/v1/appointments/:id
```

### EMR
```
GET    /api/v1/emr?patient_id=
GET    /api/v1/emr/icd10/search?q=
GET    /api/v1/emr/icd9/search?q=
GET    /api/v1/emr/patients/:id/history
POST   /api/v1/emr
POST   /api/v1/emr/:id/consent
```

### Kasir
```
GET    /api/v1/kasir/invoices
POST   /api/v1/kasir/invoices
POST   /api/v1/kasir/invoices/:id/payments
POST   /api/v1/kasir/invoices/:id/voucher
POST   /api/v1/kasir/deposits/topup
GET    /api/v1/kasir/deposits/:patientId
GET    /api/v1/kasir/invoices/daily-summary?date=
```

### Payroll
```
GET    /api/v1/payroll/periods
POST   /api/v1/payroll/periods/calculate
PATCH  /api/v1/payroll/periods/:id/approve
PATCH  /api/v1/payroll/periods/:pid/items/:iid/paid
```

---

## Production Checklist

- [ ] `JWT_SECRET` minimal 64 karakter, simpan di secret manager
- [ ] Aktifkan RLS di semua tabel Supabase (sudah di migration)
- [ ] Set `NODE_ENV=production`
- [ ] Configure Redis (Upstash) untuk BullMQ queue
- [ ] Setup WhatsApp API key untuk reminder
- [ ] Input kredensial SATUSEHAT di Settings → SATUSEHAT
- [ ] Backup database otomatis (Supabase sudah include)
- [ ] Monitor Sentry / Grafana untuk error tracking

---

## Tech Stack Summary

| Layer | Tech | Keterangan |
|---|---|---|
| Frontend | Next.js 14, Tailwind CSS, Shadcn/ui | App Router, SSR |
| State | Zustand + React Query | Cache + global state |
| Backend | NestJS, TypeScript | Modular, versioned API |
| Database | Supabase (PostgreSQL 15) | RLS, realtime, storage |
| Auth | Supabase Auth + Custom JWT | Role-based (6 roles) |
| Queue | BullMQ + Upstash Redis | SATUSEHAT async sync |
| Deploy | Vercel (web) + Railway (API) | Free tier compatible |
