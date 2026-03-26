-- ============================================================
-- Klinik SaaS — Full Database Migration
-- Target: Supabase (PostgreSQL 15+)
-- Run via: Supabase SQL Editor or psql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Updated_at auto-trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate RM number: RM-YYYYMMDD-XXXXX
CREATE SEQUENCE IF NOT EXISTS rm_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_rm_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rm_number IS NULL OR NEW.rm_number = '' THEN
    NEW.rm_number := 'RM-'
      || TO_CHAR(NOW(), 'YYYYMMDD')
      || '-'
      || LPAD(NEXTVAL('rm_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate Invoice number: INV-YYYYMMDD-XXX
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-'
      || TO_CHAR(NOW(), 'YYYYMMDD')
      || '-'
      || LPAD(NEXTVAL('invoice_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLES
-- ============================================================

-- ── 01. CLINICS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  branch        TEXT NOT NULL DEFAULT '',
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  logo_url      TEXT,
  timezone      TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  rm_prefix     TEXT NOT NULL DEFAULT 'RM',
  satusehat_org_id TEXT,
  satusehat_client_id      TEXT,
  satusehat_client_secret  TEXT,
  satusehat_enabled        BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 02. USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('super_admin','admin_klinik','dokter','resepsionis','kasir','apoteker')),
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clinic ON users(clinic_id);
CREATE INDEX idx_users_role ON users(clinic_id, role);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 03. SHARE CODES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS share_codes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  doctor_pct    NUMERIC(5,2) NOT NULL CHECK (doctor_pct >= 0 AND doctor_pct <= 100),
  clinic_pct    NUMERIC(5,2) NOT NULL CHECK (clinic_pct >= 0 AND clinic_pct <= 100),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT share_codes_pct_check CHECK (doctor_pct + clinic_pct = 100),
  UNIQUE (clinic_id, code)
);

-- ── 04. DOCTORS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  specialization  TEXT NOT NULL DEFAULT '',
  sip_number      TEXT NOT NULL,
  sip_expiry      DATE,
  phone           TEXT,
  email           TEXT,
  photo_url       TEXT,
  share_code_id   UUID REFERENCES share_codes(id) ON DELETE SET NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doctors_clinic ON doctors(clinic_id);
CREATE INDEX idx_doctors_active ON doctors(clinic_id, is_active);

CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 05. DOCTOR SCHEDULES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_hour  SMALLINT NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour    SMALLINT NOT NULL CHECK (end_hour BETWEEN 1 AND 24),
  UNIQUE (doctor_id, day_of_week)
);

CREATE INDEX idx_schedules_doctor ON doctor_schedules(doctor_id);

-- ── 06. DOCTOR LEAVES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_leaves (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id   UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  reason      TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaves_doctor_date ON doctor_leaves(doctor_id, start_date, end_date);

-- ── 07. INSURANCES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurances (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  code           TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'Swasta',
  payment_method TEXT NOT NULL DEFAULT 'Transfer',
  contact        TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinic_id, code)
);

-- ── 08. PATIENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  rm_number        TEXT,
  full_name        TEXT NOT NULL,
  date_of_birth    DATE NOT NULL,
  gender           CHAR(1) NOT NULL CHECK (gender IN ('L','P')),
  phone            TEXT,
  email            TEXT,
  address          TEXT,
  blood_type       TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergy          TEXT,
  insurance_id     UUID REFERENCES insurances(id) ON DELETE SET NULL,
  insurance_number TEXT,
  notes            TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinic_id, rm_number)
);

-- Auto-generate RM number
CREATE TRIGGER trg_patients_rm
  BEFORE INSERT ON patients
  FOR EACH ROW EXECUTE FUNCTION generate_rm_number();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for patient search
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_rm ON patients(clinic_id, rm_number);
CREATE INDEX idx_patients_name_trgm ON patients USING gin(full_name gin_trgm_ops);

-- ── 09. TREATMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treatments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  price            NUMERIC(12,2) NOT NULL DEFAULT 0,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  unit             TEXT NOT NULL DEFAULT 'per kunjungan',
  share_code_id    UUID REFERENCES share_codes(id) ON DELETE SET NULL,
  description      TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treatments_clinic ON treatments(clinic_id, is_active);
CREATE INDEX idx_treatments_category ON treatments(clinic_id, category);
CREATE INDEX idx_treatments_name_trgm ON treatments USING gin(name gin_trgm_ops);

CREATE TRIGGER trg_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 10. APPOINTMENTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  scheduled_date   DATE NOT NULL,
  scheduled_time   TIME NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  status           TEXT NOT NULL DEFAULT 'booked'
                   CHECK (status IN ('prebook','booked','confirmed','notified','waiting','engaged','completed','reschedule','cancel')),
  notes            TEXT,
  reminder_sent    BOOLEAN DEFAULT FALSE,
  source           TEXT NOT NULL DEFAULT 'walk_in'
                   CHECK (source IN ('walk_in','online','phone')),
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ⚡ Critical compound indexes for calendar queries
CREATE INDEX idx_appt_date_doctor
  ON appointments(clinic_id, scheduled_date, doctor_id, status);

CREATE INDEX idx_appt_date_status
  ON appointments(clinic_id, scheduled_date, status);

CREATE INDEX idx_appt_patient
  ON appointments(clinic_id, patient_id, scheduled_date DESC);

-- Partial index: active appointments only (exclude cancel/completed)
CREATE INDEX idx_appt_active
  ON appointments(clinic_id, scheduled_date, doctor_id)
  WHERE status NOT IN ('cancel','completed');

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 11. APPOINTMENT_TREATMENTS (junction) ────────────────────
CREATE TABLE IF NOT EXISTS appointment_treatments (
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  treatment_id   UUID NOT NULL REFERENCES treatments(id) ON DELETE RESTRICT,
  PRIMARY KEY (appointment_id, treatment_id)
);

CREATE INDEX idx_appt_treatments_appt ON appointment_treatments(appointment_id);

-- ── 12. EMR RECORDS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emr_records (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id          UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id     UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id          UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  visit_date         DATE NOT NULL,
  -- SOAP Notes stored as JSONB
  soap               JSONB NOT NULL DEFAULT '{"S":"","O":"","A":"","P":""}',
  -- Vitals stored as JSONB
  vitals             JSONB DEFAULT '{}',
  icd10_codes        TEXT[] DEFAULT '{}',
  icd9_codes         TEXT[] DEFAULT '{}',
  notes              TEXT,
  consent_signed     BOOLEAN DEFAULT FALSE,
  consent_signed_at  TIMESTAMPTZ,
  consent_data       JSONB, -- stores template + signature metadata
  satusehat_status   TEXT DEFAULT 'pending'
                     CHECK (satusehat_status IN ('pending','synced','failed')),
  satusehat_synced_at TIMESTAMPTZ,
  satusehat_bundle_id TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emr_patient ON emr_records(patient_id, visit_date DESC);
CREATE INDEX idx_emr_clinic_date ON emr_records(clinic_id, visit_date DESC);
CREATE INDEX idx_emr_doctor ON emr_records(doctor_id, visit_date DESC);
CREATE INDEX idx_emr_satusehat ON emr_records(satusehat_status) WHERE satusehat_status = 'pending';

CREATE TRIGGER trg_emr_updated_at
  BEFORE UPDATE ON emr_records
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 13. EMR TREATMENTS (junction) ────────────────────────────
CREATE TABLE IF NOT EXISTS emr_treatments (
  emr_id         UUID NOT NULL REFERENCES emr_records(id) ON DELETE CASCADE,
  treatment_id   UUID NOT NULL REFERENCES treatments(id) ON DELETE RESTRICT,
  PRIMARY KEY (emr_id, treatment_id)
);

-- ── 14. EMR ATTACHMENTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS emr_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  emr_id      UUID NOT NULL REFERENCES emr_records(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('before','after','consent','document','prescription')),
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_emr ON emr_attachments(emr_id, type);

-- ── 15. PROMOTIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  code             TEXT NOT NULL,
  name             TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('voucher','campaign')),
  discount_type    TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value   NUMERIC(10,2) NOT NULL,
  min_transaction  NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_discount     NUMERIC(12,2),
  usage_limit      INTEGER,
  usage_count      INTEGER DEFAULT 0,
  valid_from       DATE NOT NULL,
  valid_until      DATE NOT NULL,
  treatment_ids    UUID[], -- null = applies to all
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinic_id, code)
);

CREATE INDEX idx_promos_active ON promotions(clinic_id, is_active, valid_until);

-- ── 16. INVOICES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_number  TEXT,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  emr_id          UUID REFERENCES emr_records(id) ON DELETE SET NULL,
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  promo_id        UUID REFERENCES promotions(id) ON DELETE SET NULL,
  tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','issued','paid','partial','cancelled')),
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate invoice number
CREATE TRIGGER trg_invoices_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_invoices_clinic_status ON invoices(clinic_id, status, created_at DESC);
CREATE INDEX idx_invoices_patient ON invoices(patient_id, created_at DESC);

-- ── 17. PAYMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id             UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invoice_id            UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  method                TEXT NOT NULL CHECK (method IN ('cash','card','qris','transfer','insurance','deposit')),
  amount                NUMERIC(12,2) NOT NULL,
  reference_number      TEXT,
  insurance_id          UUID REFERENCES insurances(id) ON DELETE SET NULL,
  insurance_claim_number TEXT,
  status                TEXT NOT NULL DEFAULT 'paid'
                        CHECK (status IN ('pending','partial','paid','refunded')),
  paid_at               TIMESTAMPTZ DEFAULT NOW(),
  notes                 TEXT,
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_clinic_date ON payments(clinic_id, created_at DESC);

-- ── 18. DEPOSITS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deposits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  amount        NUMERIC(12,2) NOT NULL, -- positive=topup, negative=usage
  balance_after NUMERIC(12,2) NOT NULL,
  invoice_id    UUID REFERENCES invoices(id) ON DELETE SET NULL,
  notes         TEXT,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deposits_patient ON deposits(patient_id, created_at DESC);

-- ── 19. PAYROLL PERIODS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll_periods (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','approved','paid')),
  total_amount NUMERIC(12,2) DEFAULT 0,
  approved_by  UUID REFERENCES users(id),
  approved_at  TIMESTAMPTZ,
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 20. PAYROLL ITEMS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  share_code_id    UUID REFERENCES share_codes(id),
  total_revenue    NUMERIC(12,2) NOT NULL DEFAULT 0,
  doctor_pct       NUMERIC(5,2) NOT NULL,
  doctor_amount    NUMERIC(12,2) NOT NULL,
  clinic_amount    NUMERIC(12,2) NOT NULL,
  override_amount  NUMERIC(12,2),
  override_reason  TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payroll_items_period ON payroll_items(payroll_period_id);

-- ── 21. ITEMS / BARANG ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  sku         TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT,
  unit        TEXT NOT NULL DEFAULT 'pcs',
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock       INTEGER NOT NULL DEFAULT 0,
  min_stock   INTEGER NOT NULL DEFAULT 5,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinic_id, sku)
);

-- ── 22. AUDIT LOGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID REFERENCES clinics(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_clinic_date ON audit_logs(clinic_id, created_at DESC);
CREATE INDEX idx_audit_table ON audit_logs(table_name, record_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'clinics','users','doctors','doctor_schedules','doctor_leaves',
    'patients','treatments','appointments','appointment_treatments',
    'emr_records','emr_treatments','emr_attachments',
    'invoices','payments','deposits','promotions',
    'share_codes','insurances','payroll_periods','payroll_items',
    'items','audit_logs'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- ── RLS: Clinic isolation ────────────────────────────────────
-- Users can only see data belonging to their clinic.
-- JWT must contain clinic_id claim.

CREATE OR REPLACE FUNCTION auth_clinic_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', TRUE)::json->>'clinic_id', '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', TRUE)::json->>'role', '');
$$ LANGUAGE sql STABLE;

-- Macro: create standard clinic_id isolation policy
-- All SELECT/INSERT/UPDATE/DELETE restricted to own clinic
-- Super admin bypasses via service role key (no RLS)

CREATE POLICY "clinic_isolation" ON patients
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON appointments
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON emr_records
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON invoices
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON payments
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON deposits
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON doctors
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON treatments
  USING (clinic_id = auth_clinic_id());

CREATE POLICY "clinic_isolation" ON users
  USING (clinic_id = auth_clinic_id());

-- Doctor can only view their own EMR records
CREATE POLICY "doctor_own_emr" ON emr_records
  AS PERMISSIVE FOR SELECT
  USING (
    auth_role() != 'dokter'
    OR doctor_id = (SELECT id FROM doctors WHERE user_id = auth.uid() LIMIT 1)
  );

-- ============================================================
-- SEED: ICD-10 & ICD-9 reference tables (static, no RLS)
-- ============================================================

CREATE TABLE IF NOT EXISTS icd10_codes (
  code        TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS icd9_codes (
  code        TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category    TEXT NOT NULL
);

-- Dental ICD-10 seed
INSERT INTO icd10_codes (code, description, category) VALUES
  ('K02.0','Karies email (enamel)','Karies'),
  ('K02.1','Karies dentin','Karies'),
  ('K02.2','Karies sementum','Karies'),
  ('K02.9','Karies gigi, tidak spesifik','Karies'),
  ('K04.0','Pulpitis','Penyakit Pulpa'),
  ('K04.1','Nekrosis pulpa','Penyakit Pulpa'),
  ('K04.5','Periodontitis apikal kronis','Penyakit Pulpa'),
  ('K04.6','Abses periapikal dengan sinus','Penyakit Pulpa'),
  ('K04.7','Abses periapikal tanpa sinus','Penyakit Pulpa'),
  ('K05.0','Gingivitis akut','Penyakit Periodontal'),
  ('K05.1','Gingivitis kronis','Penyakit Periodontal'),
  ('K05.2','Periodontitis agresif','Penyakit Periodontal'),
  ('K05.3','Periodontitis kronis','Penyakit Periodontal'),
  ('K05.4','Periodontosis','Penyakit Periodontal'),
  ('K06.0','Resesi gingiva','Penyakit Periodontal'),
  ('K08.1','Kehilangan gigi akibat kecelakaan','Kondisi Gigi Lain'),
  ('K08.2','Atrisi gigi','Kondisi Gigi Lain'),
  ('K08.3','Retensi akar (sisa akar)','Kondisi Gigi Lain'),
  ('K10.3','Alveolitis rahang','Kondisi Gigi Lain'),
  ('K07.2','Anomali hubungan dental arch','Maloklusi'),
  ('K07.3','Anomali posisi gigi','Maloklusi'),
  ('S02.5','Fraktur gigi','Trauma'),
  ('S02.8','Fraktur tulang wajah lain','Trauma'),
  ('Z29.0','Profilaksis — kunjungan kontrol','Pencegahan'),
  ('Z46.3','Pemasangan alat ortodontik','Pencegahan')
ON CONFLICT DO NOTHING;

-- Dental ICD-9 seed
INSERT INTO icd9_codes (code, description, category) VALUES
  ('23.01','Pencabutan gigi susu','Ekstraksi'),
  ('23.09','Pencabutan gigi permanen','Ekstraksi'),
  ('23.19','Insisi alveolar','Ekstraksi'),
  ('23.2','Restorasi dengan tumpatan','Restorasi'),
  ('23.3','Restorasi inlay','Restorasi'),
  ('23.4','Restorasi lainnya','Restorasi'),
  ('23.5','Implantasi gigi','Implan'),
  ('23.6','Prostetik gigi lepasan','Prostetik'),
  ('23.7','Aplikasi protesa mahkota gigi','Prostetik'),
  ('24.0','Alveolektomi','Bedah Mulut'),
  ('24.4','Eksisi kista odontogenik','Bedah Mulut'),
  ('24.5','Alveoloplasti','Bedah Mulut'),
  ('24.6','Odontektomi','Bedah Mulut'),
  ('96.54','Pembersihan gigi (scaling)','Periodontal'),
  ('24.31','Kuretase jaringan periodontal','Periodontal'),
  ('24.32','Gingivoplasti / gingivektomi','Periodontal'),
  ('99.97','Bleaching / pemutihan gigi','Estetik'),
  ('70.71','Pemasangan alat ortodontik cekat','Ortodonsi')
ON CONFLICT DO NOTHING;

-- Full-text search index on ICD codes
CREATE INDEX IF NOT EXISTS idx_icd10_desc_trgm ON icd10_codes USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_icd9_desc_trgm  ON icd9_codes  USING gin(description gin_trgm_ops);
