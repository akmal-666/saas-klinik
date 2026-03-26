-- ============================================================
-- Migration 002: ICD reference tables + SATUSEHAT helpers
-- Run setelah 001_initial.sql
-- ============================================================

-- ─── 1. ICD-10 full table (sudah ada di 001, ini extend) ──
-- Tambah kolom chapter dan billable flag
ALTER TABLE icd10_codes
  ADD COLUMN IF NOT EXISTS chapter TEXT,
  ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE icd9_codes
  ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT TRUE;

-- ─── 2. Full-text search function ─────────────────────────
-- Digunakan oleh endpoint GET /emr/icd10/search?q=

CREATE OR REPLACE FUNCTION search_icd10(
  search_query TEXT,
  result_limit INT DEFAULT 50,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  code TEXT, description TEXT, category TEXT,
  chapter TEXT, billable BOOLEAN, notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.code, i.description, i.category,
         i.chapter, i.billable, i.notes
  FROM icd10_codes i
  WHERE
    (search_query = '' OR
     i.code ILIKE '%' || search_query || '%' OR
     i.description ILIKE '%' || search_query || '%' OR
     similarity(i.description, search_query) > 0.1)
    AND (filter_category IS NULL OR i.category = filter_category)
  ORDER BY
    CASE WHEN i.code ILIKE search_query || '%' THEN 0
         WHEN i.code ILIKE '%' || search_query || '%' THEN 1
         ELSE 2 END,
    i.billable DESC,
    i.code
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION search_icd9(
  search_query TEXT,
  result_limit INT DEFAULT 50,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  code TEXT, description TEXT, category TEXT, billable BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.code, i.description, i.category, i.billable
  FROM icd9_codes i
  WHERE
    (search_query = '' OR
     i.code ILIKE '%' || search_query || '%' OR
     i.description ILIKE '%' || search_query || '%')
    AND (filter_category IS NULL OR i.category = filter_category)
  ORDER BY
    CASE WHEN i.code ILIKE search_query || '%' THEN 0
         ELSE 1 END,
    i.code
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── 3. Patient deposit balance function ──────────────────
CREATE OR REPLACE FUNCTION get_patient_deposit_balance(p_patient_id UUID)
RETURNS TABLE (balance NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(amount), 0)::NUMERIC AS balance
  FROM deposits
  WHERE patient_id = p_patient_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── 4. EMR statistics per dokter (untuk payroll) ─────────
CREATE OR REPLACE FUNCTION get_emr_stats_by_doctor(
  p_clinic_id UUID,
  p_doctor_id UUID,
  p_date_from DATE,
  p_date_to DATE
)
RETURNS TABLE (
  doctor_id UUID,
  total_visits BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.doctor_id,
    COUNT(e.id) AS total_visits,
    COALESCE(SUM(inv.total), 0) AS total_revenue
  FROM emr_records e
  LEFT JOIN invoices inv
    ON inv.emr_id = e.id
    AND inv.status = 'paid'
  WHERE e.clinic_id = p_clinic_id
    AND e.doctor_id = p_doctor_id
    AND e.visit_date BETWEEN p_date_from AND p_date_to
  GROUP BY e.doctor_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── 5. SATUSEHAT pending queue view ──────────────────────
CREATE OR REPLACE VIEW satusehat_pending AS
SELECT
  e.id,
  e.clinic_id,
  e.patient_id,
  e.doctor_id,
  e.visit_date,
  e.icd10_codes,
  e.icd9_codes,
  e.soap,
  e.created_at,
  c.satusehat_org_id,
  c.satusehat_client_id,
  c.satusehat_enabled
FROM emr_records e
JOIN clinics c ON c.id = e.clinic_id
WHERE e.satusehat_status = 'pending'
  AND c.satusehat_enabled = TRUE
  AND c.satusehat_org_id IS NOT NULL
ORDER BY e.created_at ASC
LIMIT 100;

-- ─── 6. Indexes untuk EMR queries ─────────────────────────

-- Compound index untuk riwayat pasien per klinik
CREATE INDEX IF NOT EXISTS idx_emr_clinic_patient
  ON emr_records(clinic_id, patient_id, visit_date DESC);

-- Index untuk SATUSEHAT worker
CREATE INDEX IF NOT EXISTS idx_emr_satusehat_clinic
  ON emr_records(clinic_id, satusehat_status)
  WHERE satusehat_status = 'pending';

-- GIN index untuk array ICD code search
CREATE INDEX IF NOT EXISTS idx_emr_icd10_gin
  ON emr_records USING gin(icd10_codes);

CREATE INDEX IF NOT EXISTS idx_emr_icd9_gin
  ON emr_records USING gin(icd9_codes);
