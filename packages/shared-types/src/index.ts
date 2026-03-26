// ──────────────────────────────────────────────────────────
// @klinik/shared-types — Single source of truth for all types
// Used by: apps/web, apps/backend, apps/mobile
// ──────────────────────────────────────────────────────────

// ─── ENUMS ────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN_KLINIK = 'admin_klinik',
  DOKTER = 'dokter',
  RESEPSIONIS = 'resepsionis',
  KASIR = 'kasir',
  APOTEKER = 'apoteker',
}

export enum AppointmentStatus {
  PREBOOK = 'prebook',
  BOOKED = 'booked',
  CONFIRMED = 'confirmed',
  NOTIFIED = 'notified',
  WAITING = 'waiting',
  ENGAGED = 'engaged',
  COMPLETED = 'completed',
  RESCHEDULE = 'reschedule',
  CANCEL = 'cancel',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  QRIS = 'qris',
  TRANSFER = 'transfer',
  INSURANCE = 'insurance',
  DEPOSIT = 'deposit',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

export enum Gender {
  L = 'L',
  P = 'P',
}

export enum AttachmentType {
  BEFORE = 'before',
  AFTER = 'after',
  CONSENT = 'consent',
  DOCUMENT = 'document',
  PRESCRIPTION = 'prescription',
}

export enum PromoType {
  VOUCHER = 'voucher',
  CAMPAIGN = 'campaign',
}

export enum PromoDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}

// ─── BASE ENTITY ──────────────────────────────────────────

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ─── CLINIC ───────────────────────────────────────────────

export interface Clinic extends BaseEntity {
  name: string;
  branch: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  timezone: string;
  rm_prefix: string; // e.g. 'RM'
  satusehat_org_id: string | null;
  is_active: boolean;
}

// ─── USER ─────────────────────────────────────────────────

export interface User extends BaseEntity {
  clinic_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
}

// ─── DOCTOR ───────────────────────────────────────────────

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DoctorScheduleSlot {
  day: DayOfWeek; // 0=Sun, 1=Mon, ..., 6=Sat
  start_hour: number; // e.g. 8
  end_hour: number;   // e.g. 16
}

export interface Doctor extends BaseEntity {
  clinic_id: string;
  user_id: string | null;
  name: string;
  specialization: string;
  sip_number: string;
  sip_expiry: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  share_code_id: string | null;
  schedules: DoctorScheduleSlot[];
  is_active: boolean;
}

export interface DoctorLeave extends BaseEntity {
  clinic_id: string;
  doctor_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_by: string;
}

// ─── PATIENT ──────────────────────────────────────────────

export interface Patient extends BaseEntity {
  clinic_id: string;
  rm_number: string; // auto-generated: RM-YYYYMMDD-XXXXX
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: string | null;
  allergy: string | null;
  insurance_id: string | null;
  insurance_number: string | null;
  notes: string | null;
  is_active: boolean;
}

// ─── APPOINTMENT ──────────────────────────────────────────

export interface Appointment extends BaseEntity {
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_date: string;      // ISO date: '2026-03-23'
  scheduled_time: string;      // '09:00'
  duration_minutes: number;
  status: AppointmentStatus;
  treatment_ids: string[];
  notes: string | null;
  reminder_sent: boolean;
  source: 'walk_in' | 'online' | 'phone';
  created_by: string;

  // Joined
  patient?: Patient;
  doctor?: Doctor;
  treatments?: Treatment[];
}

export interface AppointmentWithRelations extends Appointment {
  patient: Patient;
  doctor: Doctor;
  treatments: Treatment[];
}

// ─── TREATMENT ────────────────────────────────────────────

export interface Treatment extends BaseEntity {
  clinic_id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  unit: string; // 'per gigi', 'per kunjungan', etc.
  share_code_id: string | null;
  description: string | null;
  is_active: boolean;
}

// ─── EMR ──────────────────────────────────────────────────

export interface SOAPNotes {
  S: string; // Subjective
  O: string; // Objective
  P: string; // Plan
  A: string; // Assessment
}

export interface Vitals {
  blood_pressure: string | null; // '120/80'
  pulse: number | null;
  respiratory_rate: number | null;
  temperature: number | null;
}

export interface EmrRecord extends BaseEntity {
  clinic_id: string;
  appointment_id: string | null;
  patient_id: string;
  doctor_id: string;
  visit_date: string;
  soap: SOAPNotes;
  vitals: Vitals;
  icd10_codes: string[];
  icd9_codes: string[];
  treatment_ids: string[];
  notes: string | null;
  consent_signed: boolean;
  consent_signed_at: string | null;
  satusehat_status: SyncStatus;
  satusehat_synced_at: string | null;
}

export interface EmrAttachment extends BaseEntity {
  clinic_id: string;
  emr_id: string;
  type: AttachmentType;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
}

// ─── INVOICE & PAYMENT ────────────────────────────────────

export interface InvoiceItem {
  treatment_id: string;
  treatment_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice extends BaseEntity {
  clinic_id: string;
  invoice_number: string; // INV-YYYYMMDD-XXX
  patient_id: string;
  appointment_id: string | null;
  emr_id: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount_amount: number;
  promo_id: string | null;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  notes: string | null;
  created_by: string;

  // Joined
  patient?: Patient;
  payments?: Payment[];
}

export interface Payment extends BaseEntity {
  clinic_id: string;
  invoice_id: string;
  method: PaymentMethod;
  amount: number;
  reference_number: string | null;
  insurance_id: string | null;
  insurance_claim_number: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  notes: string | null;
  created_by: string;
}

// ─── DEPOSIT ──────────────────────────────────────────────

export interface Deposit extends BaseEntity {
  clinic_id: string;
  patient_id: string;
  amount: number; // positive = top-up, negative = usage
  balance_after: number;
  invoice_id: string | null;
  notes: string | null;
  created_by: string;
}

// ─── PROMO ────────────────────────────────────────────────

export interface Promotion extends BaseEntity {
  clinic_id: string;
  code: string;
  name: string;
  type: PromoType;
  discount_type: PromoDiscountType;
  discount_value: number; // % or fixed Rp
  min_transaction: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  treatment_ids: string[] | null; // null = all treatments
  is_active: boolean;
}

// ─── SHARE CODE ───────────────────────────────────────────

export interface ShareCode extends BaseEntity {
  clinic_id: string;
  code: string;
  name: string;
  doctor_pct: number; // e.g. 40
  clinic_pct: number; // e.g. 60
}

// ─── INSURANCE ────────────────────────────────────────────

export interface Insurance extends BaseEntity {
  clinic_id: string;
  name: string;
  code: string;
  type: string; // 'Pemerintah' | 'Swasta'
  payment_method: string;
  contact: string | null;
  is_active: boolean;
}

// ─── PAYROLL ──────────────────────────────────────────────

export interface PayrollPeriod extends BaseEntity {
  clinic_id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'approved' | 'paid';
  total_amount: number;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
}

export interface PayrollItem extends BaseEntity {
  payroll_period_id: string;
  doctor_id: string;
  share_code_id: string;
  total_revenue: number;
  doctor_pct: number;
  doctor_amount: number;
  clinic_amount: number;
  override_amount: number | null;
  override_reason: string | null;
  status: 'pending' | 'paid';
  paid_at: string | null;
}

// ─── ITEM / BARANG ────────────────────────────────────────

export interface Item extends BaseEntity {
  clinic_id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  is_active: boolean;
}

// ─── AUDIT LOG ────────────────────────────────────────────

export interface AuditLog extends BaseEntity {
  clinic_id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
}

// ─── API RESPONSE ─────────────────────────────────────────

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  cursor: string | null;
  next_cursor: string | null;
  total: number;
  limit: number;
  has_more: boolean;
}

// ─── QUERY PARAMS ─────────────────────────────────────────

export interface AppointmentQuery {
  date?: string;
  doctor_id?: string;
  patient_id?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  view?: 'calendar' | 'list';
  cursor?: string;
  limit?: number;
}

export interface PatientQuery {
  q?: string;
  cursor?: string;
  limit?: number;
}
