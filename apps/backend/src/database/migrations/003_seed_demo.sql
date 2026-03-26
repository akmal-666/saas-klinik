-- ============================================================
-- Migration 003: Demo Seed Data
-- Jalankan SETELAH 001 dan 002
-- Untuk development / staging environment saja
-- ============================================================

-- ─── 1. Demo Clinic ───────────────────────────────────────
INSERT INTO clinics (id, name, branch, address, phone, email, timezone, rm_prefix, satusehat_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Audy Dental',
  'Muara Karang',
  'Jl. Muara Karang Raya No. 23, Jakarta Utara 14450',
  '021-12345678',
  'info@audydental.co.id',
  'Asia/Jakarta',
  'RM',
  false
) ON CONFLICT (id) DO NOTHING;

-- ─── 2. Share Codes ───────────────────────────────────────
INSERT INTO share_codes (id, clinic_id, code, name, doctor_pct, clinic_pct) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'SC-01', 'Standar Umum',    40, 60),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'SC-02', 'Spesialis Senior',50, 50),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'SC-03', 'Ortodontis',      45, 55)
ON CONFLICT DO NOTHING;

-- ─── 3. Insurance ─────────────────────────────────────────
INSERT INTO insurances (id, clinic_id, name, code, type, payment_method, contact) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'BPJS Kesehatan',      'BPJS', 'Pemerintah', 'Transfer', '1500400'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'Allianz Life',        'ALZ',  'Swasta',     'Transfer', '1500136'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'AXA Mandiri',         'AXA',  'Swasta',     'Transfer', '1500803'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'Prudential Indonesia','PRU',  'Swasta',     'Transfer', '1500085')
ON CONFLICT DO NOTHING;

-- ─── 4. Doctors ───────────────────────────────────────────
INSERT INTO doctors (id, clinic_id, name, specialization, sip_number, phone, share_code_id) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'drg Christine Hendriono Sp.KG',  'Konservasi Gigi', 'SIP/2020/001', '08111000001', '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'drg Andrew Laurent Sp.Ort',      'Ortodonti',       'SIP/2020/002', '08111000002', '00000000-0000-0000-0001-000000000003'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'drg Jody Thia',                  'Bedah Mulut',     'SIP/2021/003', '08111000003', '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'drg Nurvita Titi Ikawati Sp.KG','Periodonsi',      'SIP/2021/004', '08111000004', '00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'drg Rontgen Audy',               'Radiologi',       'SIP/2022/005', '08111000005', '00000000-0000-0000-0001-000000000001')
ON CONFLICT DO NOTHING;

-- ─── 5. Doctor Schedules ──────────────────────────────────
-- Christine: Sen-Jum 08:00-17:00
INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, start_hour, end_hour)
SELECT '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', d, 8, 17
FROM generate_series(1,5) d ON CONFLICT DO NOTHING;

-- Andrew: Sel, Kam, Sab 09:00-17:00
INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, start_hour, end_hour) VALUES
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 2, 9, 17),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 4, 9, 17),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 6, 9, 14)
ON CONFLICT DO NOTHING;

-- Jody: Sen, Rab, Jum 10:00-18:00
INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, start_hour, end_hour) VALUES
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 1, 10, 18),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 3, 10, 18),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 5, 10, 18)
ON CONFLICT DO NOTHING;

-- Nurvita: Sen-Rab, Kam 08:00-15:00
INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, start_hour, end_hour)
SELECT '00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', d, 8, 15
FROM unnest(ARRAY[1,2,3,4]) d ON CONFLICT DO NOTHING;

-- Rontgen: Sen, Rab, Jum 09:00-16:00
INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, start_hour, end_hour) VALUES
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 1, 9, 16),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 3, 9, 16),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 5, 9, 16)
ON CONFLICT DO NOTHING;

-- ─── 6. Treatments ────────────────────────────────────────
INSERT INTO treatments (clinic_id, name, category, price, duration_minutes, unit, share_code_id) VALUES
  ('00000000-0000-0000-0000-000000000001','Tambal Gigi Komposit Anterior',  'Konservasi',  350000, 45,  'per gigi',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Tambal Gigi Komposit Posterior', 'Konservasi',  450000, 60,  'per gigi',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Perawatan Saluran Akar (PSA)',   'Konservasi',  750000, 90,  'per kunjungan', '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Inlay / Onlay Keramik',          'Konservasi', 1200000,120, 'per gigi',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Scaling & Polishing',            'Periodonsi',  280000, 60,  'per kunjungan', '00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0000-000000000001','Kuretase Periodontal',           'Periodonsi',  650000, 90,  'per sextant',   '00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0000-000000000001','Gingivektomi',                   'Periodonsi',  850000,120, 'per area',      '00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0000-000000000001','Pasang Behel Metal',             'Ortodonsi',  4500000, 90, 'rahang',        '00000000-0000-0000-0001-000000000003'),
  ('00000000-0000-0000-0000-000000000001','Kontrol Behel',                  'Ortodonsi',   250000, 30, 'kunjungan',     '00000000-0000-0000-0001-000000000003'),
  ('00000000-0000-0000-0000-000000000001','Lepas Behel & Retainer',         'Ortodonsi',  1200000, 60, 'rahang',        '00000000-0000-0000-0001-000000000003'),
  ('00000000-0000-0000-0000-000000000001','Pencabutan Gigi Susu',           'Bedah Mulut', 120000, 20, 'per gigi',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Pencabutan Gigi Permanen',       'Bedah Mulut', 250000, 30, 'per gigi',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Odontektomi (Wisdom Tooth)',     'Bedah Mulut',1500000,120, 'per gigi',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Bleaching / Whitening',          'Estetik',    1800000, 90, 'rahang',        '00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0000-000000000001','Veneer Keramik',                 'Estetik',    2500000,120, 'per gigi',      '00000000-0000-0000-0001-000000000002'),
  ('00000000-0000-0000-0000-000000000001','Rontgen Periapikal',             'Radiologi',   80000, 10, 'per foto',      '00000000-0000-0000-0001-000000000001'),
  ('00000000-0000-0000-0000-000000000001','Rontgen Panoramik',              'Radiologi',  250000, 15, 'per foto',      '00000000-0000-0000-0001-000000000001')
ON CONFLICT DO NOTHING;

-- ─── 7. Promotions ────────────────────────────────────────
INSERT INTO promotions (clinic_id, code, name, type, discount_type, discount_value, min_transaction, max_discount, valid_from, valid_until, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'DENTAL20',   'Diskon Dental 20%',  'voucher',  'percentage', 20, 200000, 500000, '2026-03-01', '2026-03-31', true),
  ('00000000-0000-0000-0000-000000000001', 'SCALING50K', 'Promo Scaling',      'campaign', 'fixed',      50000, 280000, NULL, '2026-03-15', '2026-04-15', true),
  ('00000000-0000-0000-0000-000000000001', 'NEWPASIEN',  'Pasien Baru 10%',   'campaign', 'percentage', 10, 0, 300000, '2026-01-01', '2026-12-31', true)
ON CONFLICT DO NOTHING;

-- ─── 8. Demo Patients ─────────────────────────────────────
INSERT INTO patients (clinic_id, rm_number, full_name, date_of_birth, gender, phone, blood_type, allergy, insurance_id) VALUES
  ('00000000-0000-0000-0000-000000000001','RM-20260323-00001','Rizky Aditya Pratama',  '1992-05-14','L','08211234567','O+','Penisilin',  '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0000-000000000001','RM-20260323-00002','Dewi Santoso Putri',    '1988-11-22','P','08221234568','A+',NULL,        NULL),
  ('00000000-0000-0000-0000-000000000001','RM-20260323-00003','Budi Laksono',          '1975-03-08','L','08231234569','B-','NSAID',     '00000000-0000-0000-0002-000000000002'),
  ('00000000-0000-0000-0000-000000000001','RM-20260323-00004','Indah Permatasari',     '1995-07-30','P','08241234570','AB+',NULL,       NULL),
  ('00000000-0000-0000-0000-000000000001','RM-20260323-00005','Hendra Wijaya',         '1983-12-01','L','08251234571','O-',NULL,        '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0000-000000000001','RM-20260323-00006','Sari Rahayu Wulandari','1997-04-18','P','08261234572','A-','Sulfa',      NULL),
  ('00000000-0000-0000-0000-000000000001','RM-20220220-00007','Ahmad Fauzi',           '1970-09-25','L','08271234573','B+',NULL,        '00000000-0000-0000-0002-000000000003'),
  ('00000000-0000-0000-0000-000000000001','RM-20260115-00008','Rina Marlina',          '2001-06-12','P','08281234574','O+',NULL,        NULL)
ON CONFLICT DO NOTHING;

-- ─── Notes ────────────────────────────────────────────────
-- Untuk membuat user admin, gunakan Supabase Auth UI atau API:
-- POST https://your-project.supabase.co/auth/v1/admin/users
-- Kemudian insert ke tabel users dengan role 'admin_klinik'
