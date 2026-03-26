import { AppointmentStatus, PaymentMethod, UserRole } from '@klinik/shared-types';

// ─── APPOINTMENT ──────────────────────────────────────────

export const APPOINTMENT_STATUS_FLOW: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PREBOOK]:   [AppointmentStatus.BOOKED, AppointmentStatus.CANCEL],
  [AppointmentStatus.BOOKED]:    [AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULE, AppointmentStatus.CANCEL],
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.NOTIFIED, AppointmentStatus.WAITING, AppointmentStatus.RESCHEDULE, AppointmentStatus.CANCEL],
  [AppointmentStatus.NOTIFIED]:  [AppointmentStatus.WAITING, AppointmentStatus.CANCEL],
  [AppointmentStatus.WAITING]:   [AppointmentStatus.ENGAGED, AppointmentStatus.CANCEL],
  [AppointmentStatus.ENGAGED]:   [AppointmentStatus.COMPLETED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.RESCHEDULE]:[AppointmentStatus.BOOKED, AppointmentStatus.CANCEL],
  [AppointmentStatus.CANCEL]:    [],
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PREBOOK]:   'Pre-Booked',
  [AppointmentStatus.BOOKED]:    'Booked',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.NOTIFIED]:  'Notified',
  [AppointmentStatus.WAITING]:   'Waiting',
  [AppointmentStatus.ENGAGED]:   'Engaged',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.RESCHEDULE]:'Reschedule',
  [AppointmentStatus.CANCEL]:    'Cancel',
};

// ─── TIME SLOTS ───────────────────────────────────────────

export const TIME_SLOTS: string[] = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
}); // ['08:00','08:30',...,'18:30']

export const SLOT_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

// ─── DAYS ─────────────────────────────────────────────────

export const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const MONTH_NAMES_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

// ─── RBAC PERMISSIONS ─────────────────────────────────────

export type Permission =
  | 'dashboard:view'
  | 'appointment:view' | 'appointment:create' | 'appointment:update' | 'appointment:delete'
  | 'emr:view' | 'emr:create' | 'emr:update' | 'emr:view_own'
  | 'kasir:view' | 'kasir:create' | 'kasir:refund' | 'kasir:void'
  | 'report:view' | 'report:export'
  | 'masterdata:view' | 'masterdata:manage'
  | 'payroll:view' | 'payroll:manage' | 'payroll:view_own'
  | 'settings:view' | 'settings:manage'
  | 'users:view' | 'users:manage'
  | 'clinic:manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: ['dashboard:view','appointment:view','appointment:create','appointment:update','appointment:delete','emr:view','emr:create','emr:update','kasir:view','kasir:create','kasir:refund','kasir:void','report:view','report:export','masterdata:view','masterdata:manage','payroll:view','payroll:manage','settings:view','settings:manage','users:view','users:manage','clinic:manage'],

  [UserRole.ADMIN_KLINIK]: ['dashboard:view','appointment:view','appointment:create','appointment:update','appointment:delete','emr:view','emr:create','emr:update','kasir:view','kasir:create','kasir:refund','kasir:void','report:view','report:export','masterdata:view','masterdata:manage','payroll:view','payroll:manage','settings:view','settings:manage','users:view','users:manage'],

  [UserRole.DOKTER]: ['dashboard:view','appointment:view','emr:view_own','emr:create','emr:update','report:view','payroll:view_own'],

  [UserRole.RESEPSIONIS]: ['dashboard:view','appointment:view','appointment:create','appointment:update','emr:view','kasir:view','masterdata:view'],

  [UserRole.KASIR]: ['dashboard:view','kasir:view','kasir:create','kasir:refund','report:view','report:export'],

  [UserRole.APOTEKER]: ['dashboard:view','emr:view','masterdata:view'],
};

// ─── TREATMENT CATEGORIES ─────────────────────────────────

export const TREATMENT_CATEGORIES = [
  'Konservasi',
  'Periodonsi',
  'Ortodonsi',
  'Bedah Mulut',
  'Estetik',
  'Radiologi',
  'Prostodontik',
  'Pedodontik',
  'Endodontik',
  'Implan',
];

// ─── BLOOD TYPES ──────────────────────────────────────────

export const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

// ─── PAYMENT METHODS ──────────────────────────────────────

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]:      'Tunai',
  [PaymentMethod.CARD]:      'Kartu Debit/Kredit',
  [PaymentMethod.QRIS]:      'QRIS',
  [PaymentMethod.TRANSFER]:  'Transfer Bank',
  [PaymentMethod.INSURANCE]: 'Asuransi',
  [PaymentMethod.DEPOSIT]:   'Deposit',
};

// ─── RM NUMBER ────────────────────────────────────────────

export const RM_FORMAT = 'RM-YYYYMMDD-XXXXX';
export const INVOICE_FORMAT = 'INV-YYYYMMDD-XXX';

// ─── ICD Reference Data (Kemenkes Standard) ───────────────
export {
  ICD10_DENTAL, ICD9_DENTAL,
  searchIcd10, searchIcd9,
  ICD10_CATEGORIES, ICD9_CATEGORIES,
} from './icd-dental';
export type { Icd10Item, Icd9Item } from './icd-dental';
