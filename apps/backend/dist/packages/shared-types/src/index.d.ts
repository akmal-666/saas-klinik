export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN_KLINIK = "admin_klinik",
    DOKTER = "dokter",
    RESEPSIONIS = "resepsionis",
    KASIR = "kasir",
    APOTEKER = "apoteker"
}
export declare enum AppointmentStatus {
    PREBOOK = "prebook",
    BOOKED = "booked",
    CONFIRMED = "confirmed",
    NOTIFIED = "notified",
    WAITING = "waiting",
    ENGAGED = "engaged",
    COMPLETED = "completed",
    RESCHEDULE = "reschedule",
    CANCEL = "cancel"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    QRIS = "qris",
    TRANSFER = "transfer",
    INSURANCE = "insurance",
    DEPOSIT = "deposit"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PARTIAL = "partial",
    PAID = "paid",
    REFUNDED = "refunded"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    ISSUED = "issued",
    PAID = "paid",
    PARTIAL = "partial",
    CANCELLED = "cancelled"
}
export declare enum Gender {
    L = "L",
    P = "P"
}
export declare enum AttachmentType {
    BEFORE = "before",
    AFTER = "after",
    CONSENT = "consent",
    DOCUMENT = "document",
    PRESCRIPTION = "prescription"
}
export declare enum PromoType {
    VOUCHER = "voucher",
    CAMPAIGN = "campaign"
}
export declare enum PromoDiscountType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare enum SyncStatus {
    PENDING = "pending",
    SYNCED = "synced",
    FAILED = "failed"
}
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}
export interface Clinic extends BaseEntity {
    name: string;
    branch: string;
    address: string;
    phone: string;
    email: string;
    logo_url: string | null;
    timezone: string;
    rm_prefix: string;
    satusehat_org_id: string | null;
    is_active: boolean;
}
export interface User extends BaseEntity {
    clinic_id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url: string | null;
    is_active: boolean;
    last_login: string | null;
}
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface DoctorScheduleSlot {
    day: DayOfWeek;
    start_hour: number;
    end_hour: number;
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
export interface Patient extends BaseEntity {
    clinic_id: string;
    rm_number: string;
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
export interface Appointment extends BaseEntity {
    clinic_id: string;
    patient_id: string;
    doctor_id: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    status: AppointmentStatus;
    treatment_ids: string[];
    notes: string | null;
    reminder_sent: boolean;
    source: 'walk_in' | 'online' | 'phone';
    created_by: string;
    patient?: Patient;
    doctor?: Doctor;
    treatments?: Treatment[];
}
export interface AppointmentWithRelations extends Appointment {
    patient: Patient;
    doctor: Doctor;
    treatments: Treatment[];
}
export interface Treatment extends BaseEntity {
    clinic_id: string;
    name: string;
    category: string;
    price: number;
    duration_minutes: number;
    unit: string;
    share_code_id: string | null;
    description: string | null;
    is_active: boolean;
}
export interface SOAPNotes {
    S: string;
    O: string;
    P: string;
    A: string;
}
export interface Vitals {
    blood_pressure: string | null;
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
export interface InvoiceItem {
    treatment_id: string;
    treatment_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}
export interface Invoice extends BaseEntity {
    clinic_id: string;
    invoice_number: string;
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
export interface Deposit extends BaseEntity {
    clinic_id: string;
    patient_id: string;
    amount: number;
    balance_after: number;
    invoice_id: string | null;
    notes: string | null;
    created_by: string;
}
export interface Promotion extends BaseEntity {
    clinic_id: string;
    code: string;
    name: string;
    type: PromoType;
    discount_type: PromoDiscountType;
    discount_value: number;
    min_transaction: number;
    max_discount: number | null;
    usage_limit: number | null;
    usage_count: number;
    valid_from: string;
    valid_until: string;
    treatment_ids: string[] | null;
    is_active: boolean;
}
export interface ShareCode extends BaseEntity {
    clinic_id: string;
    code: string;
    name: string;
    doctor_pct: number;
    clinic_pct: number;
}
export interface Insurance extends BaseEntity {
    clinic_id: string;
    name: string;
    code: string;
    type: string;
    payment_method: string;
    contact: string | null;
    is_active: boolean;
}
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
