# Klinik SaaS — Clinic Management System

Monorepo full-stack untuk sistem manajemen klinik gigi berbasis SaaS.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Web | Next.js 14 (App Router) + Tailwind CSS |
| Mobile | React Native (Expo) — *coming soon* |
| Backend API | NestJS (TypeScript) |
| Database | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth + Custom JWT |
| File Storage | Supabase Storage |
| State | Zustand + React Query |
| Queue | BullMQ + Upstash Redis |
| Deployment | Vercel (web) · Railway (backend) |

## Struktur Monorepo

```
klinik-saas/
├── turbo.json                    # Turborepo pipeline
├── package.json                  # Workspaces config
├── .env.example                  # Environment variables template
│
├── packages/
│   ├── shared-types/             # TypeScript types (40+ interfaces)
│   ├── shared-constants/         # Status flows, RBAC, time slots
│   └── shared-utils/             # (planned) shared helpers
│
└── apps/
    ├── web/                      # Next.js 14
    │   └── src/
    │       ├── app/
    │       │   ├── (dashboard)/  # Protected route group
    │       │   │   ├── appointment/
    │       │   │   ├── emr/
    │       │   │   ├── kasir/
    │       │   │   ├── report/
    │       │   │   ├── masterdata/
    │       │   │   ├── payroll/
    │       │   │   └── settings/
    │       ├── components/
    │       │   ├── appointment/  # AppointmentClient, Modal, Drawer
    │       │   ├── layout/       # Sidebar, Topbar
    │       │   └── ui/           # StatusBadge, MultiSelect
    │       ├── hooks/            # React Query hooks
    │       └── lib/              # api, store (zustand), utils
    │
    └── backend/                  # NestJS
        └── src/
            ├── main.ts
            ├── app.module.ts
            ├── common/
            │   ├── guards/       # JwtAuthGuard + RBAC
            │   ├── filters/      # HttpExceptionFilter
            │   └── interceptors/ # Transform + Logging
            ├── database/
            │   ├── supabase.module.ts
            │   └── migrations/   # 001_initial.sql (22 tables)
            └── modules/
                ├── auth/         # ✅ Login, refresh, /me
                ├── appointment/  # ✅ CRUD + status flow + conflict check
                ├── emr/          # (next)
                ├── kasir/        # (next)
                ├── patients/     # (next)
                ├── doctors/      # (next)
                ├── treatments/   # (next)
                ├── invoices/     # (next)
                ├── payments/     # (next)
                ├── deposits/     # (next)
                ├── payroll/      # (next)
                ├── reports/      # (next)
                ├── satu-sehat/   # (next)
                └── notifications/# (next)
```

## Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/your-org/klinik-saas.git
cd klinik-saas
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Isi SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, dll.
```

### 3. Database Migration

Buka Supabase SQL Editor, jalankan:
```
apps/backend/src/database/migrations/001_initial.sql
```

Migrasi ini membuat:
- 22 tables lengkap dengan foreign keys
- Row Level Security (RLS) per clinic_id
- Auto-generate RM Number trigger (`RM-YYYYMMDD-XXXXX`)
- Auto-generate Invoice Number trigger (`INV-YYYYMMDD-XXX`)
- Indexes optimal untuk query kalender appointment
- ICD-10 & ICD-9 seed data (dental codes)

### 4. Development

```bash
# Jalankan semua apps sekaligus
npm run dev

# Atau individual
npm run dev --filter=@klinik/web       # http://localhost:3000
npm run dev --filter=@klinik/backend   # http://localhost:3001
```

### 5. Swagger API Docs

Saat development: http://localhost:3001/api/docs

## API Endpoints — Appointment Module

```
GET    /api/v1/appointments             # List (calendar/list view)
GET    /api/v1/appointments/today/summary  # Jumlah per status hari ini
GET    /api/v1/appointments/:id         # Detail + relasi
POST   /api/v1/appointments             # Buat baru
PATCH  /api/v1/appointments/:id         # Update
PATCH  /api/v1/appointments/:id/status  # Ubah status (flow-controlled)
PUT    /api/v1/appointments/:id/reschedule  # Reschedule
DELETE /api/v1/appointments/:id         # Cancel
```

### Request: Create Appointment

```json
POST /api/v1/appointments
Authorization: Bearer <token>

{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "scheduled_date": "2026-03-23",
  "scheduled_time": "09:00",
  "duration_minutes": 45,
  "treatment_ids": ["uuid1", "uuid2"],
  "status": "booked",
  "notes": "Keluhan nyeri gigi depan",
  "source": "walk_in"
}
```

### Response format

```json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "cursor": null,
    "next_cursor": "uuid",
    "total": 50,
    "limit": 50,
    "has_more": true
  }
}
```

## RBAC Roles

| Role | Dashboard | Appointment | EMR | Kasir | Master Data | Payroll |
|---|---|---|---|---|---|---|
| Super Admin | ✅ | ✅ Full | ✅ Full | ✅ Full | ✅ | ✅ Full |
| Admin Klinik | ✅ | ✅ Full | ✅ Full | ✅ Full | ✅ | ✅ Full |
| Dokter | ✅ | 👁 View | ✅ Own only | ❌ | ❌ | 👁 Own |
| Resepsionis | ✅ | ✅ Buat/Edit | 👁 View | 👁 View | ❌ | ❌ |
| Kasir | ✅ | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| Apoteker | ✅ | ❌ | 👁 View | ❌ | 👁 View | ❌ |

## Appointment Status Flow

```
prebook ──► booked ──► confirmed ──► notified ──► waiting ──► engaged ──► completed
              │              │                                     │
              └──────────────┴─────────────── reschedule ◄────────┘
              │              │                     │
              └──────────────┴──────── cancel ◄────┘
```

## Performance Notes

- **Cursor-based pagination** pada semua list endpoint
- **Compound index** pada `appointments(clinic_id, scheduled_date, doctor_id, status)` — query kalender < 10ms
- **Partial index** untuk appointment aktif (exclude cancel/completed)
- **React Query** dengan `staleTime: 30s` + auto-refetch 1 menit untuk kalender
- **RLS** via `clinic_id` di semua tabel — isolasi data antar klinik di level database

## Deployment

```bash
# Build semua
npm run build

# Web → Vercel (auto-deploy dari GitHub)
# Backend → Railway / Fly.io
#   railway up --service backend
```

## Modul Berikutnya

- [ ] EMR Module (SOAP + ICD multi-select + before/after + digital consent)
- [ ] Kasir Module (multi-payment + deposit + voucher)
- [ ] Master Data (dokter CRUD + jadwal + pasien)
- [ ] Payroll (auto-calculate bagi hasil via share code)
- [ ] Laporan (pendapatan, kunjungan, treatment populer)
- [ ] SATUSEHAT sync (BullMQ async worker)
- [ ] Notifikasi WhatsApp (reminder appointment)
- [ ] Mobile app (React Native Expo)
