"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICD9_CATEGORIES = exports.ICD10_CATEGORIES = exports.searchIcd9 = exports.searchIcd10 = exports.ICD9_DENTAL = exports.ICD10_DENTAL = exports.INVOICE_FORMAT = exports.RM_FORMAT = exports.PAYMENT_METHOD_LABEL = exports.BLOOD_TYPES = exports.TREATMENT_CATEGORIES = exports.ROLE_PERMISSIONS = exports.MONTH_NAMES_ID = exports.DAY_NAMES_SHORT = exports.DAY_NAMES_ID = exports.SLOT_DURATION_OPTIONS = exports.TIME_SLOTS = exports.APPOINTMENT_STATUS_LABEL = exports.APPOINTMENT_STATUS_FLOW = void 0;
const shared_types_1 = require("../../shared-types/src/index.ts");
exports.APPOINTMENT_STATUS_FLOW = {
    [shared_types_1.AppointmentStatus.PREBOOK]: [shared_types_1.AppointmentStatus.BOOKED, shared_types_1.AppointmentStatus.CANCEL],
    [shared_types_1.AppointmentStatus.BOOKED]: [shared_types_1.AppointmentStatus.CONFIRMED, shared_types_1.AppointmentStatus.RESCHEDULE, shared_types_1.AppointmentStatus.CANCEL],
    [shared_types_1.AppointmentStatus.CONFIRMED]: [shared_types_1.AppointmentStatus.NOTIFIED, shared_types_1.AppointmentStatus.WAITING, shared_types_1.AppointmentStatus.RESCHEDULE, shared_types_1.AppointmentStatus.CANCEL],
    [shared_types_1.AppointmentStatus.NOTIFIED]: [shared_types_1.AppointmentStatus.WAITING, shared_types_1.AppointmentStatus.CANCEL],
    [shared_types_1.AppointmentStatus.WAITING]: [shared_types_1.AppointmentStatus.ENGAGED, shared_types_1.AppointmentStatus.CANCEL],
    [shared_types_1.AppointmentStatus.ENGAGED]: [shared_types_1.AppointmentStatus.COMPLETED],
    [shared_types_1.AppointmentStatus.COMPLETED]: [],
    [shared_types_1.AppointmentStatus.RESCHEDULE]: [shared_types_1.AppointmentStatus.BOOKED, shared_types_1.AppointmentStatus.CANCEL],
    [shared_types_1.AppointmentStatus.CANCEL]: [],
};
exports.APPOINTMENT_STATUS_LABEL = {
    [shared_types_1.AppointmentStatus.PREBOOK]: 'Pre-Booked',
    [shared_types_1.AppointmentStatus.BOOKED]: 'Booked',
    [shared_types_1.AppointmentStatus.CONFIRMED]: 'Confirmed',
    [shared_types_1.AppointmentStatus.NOTIFIED]: 'Notified',
    [shared_types_1.AppointmentStatus.WAITING]: 'Waiting',
    [shared_types_1.AppointmentStatus.ENGAGED]: 'Engaged',
    [shared_types_1.AppointmentStatus.COMPLETED]: 'Completed',
    [shared_types_1.AppointmentStatus.RESCHEDULE]: 'Reschedule',
    [shared_types_1.AppointmentStatus.CANCEL]: 'Cancel',
};
exports.TIME_SLOTS = Array.from({ length: 22 }, (_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
});
exports.SLOT_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
exports.DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
exports.DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
exports.MONTH_NAMES_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
exports.ROLE_PERMISSIONS = {
    [shared_types_1.UserRole.SUPER_ADMIN]: ['dashboard:view', 'appointment:view', 'appointment:create', 'appointment:update', 'appointment:delete', 'emr:view', 'emr:create', 'emr:update', 'kasir:view', 'kasir:create', 'kasir:refund', 'kasir:void', 'report:view', 'report:export', 'masterdata:view', 'masterdata:manage', 'payroll:view', 'payroll:manage', 'settings:view', 'settings:manage', 'users:view', 'users:manage', 'clinic:manage'],
    [shared_types_1.UserRole.ADMIN_KLINIK]: ['dashboard:view', 'appointment:view', 'appointment:create', 'appointment:update', 'appointment:delete', 'emr:view', 'emr:create', 'emr:update', 'kasir:view', 'kasir:create', 'kasir:refund', 'kasir:void', 'report:view', 'report:export', 'masterdata:view', 'masterdata:manage', 'payroll:view', 'payroll:manage', 'settings:view', 'settings:manage', 'users:view', 'users:manage'],
    [shared_types_1.UserRole.DOKTER]: ['dashboard:view', 'appointment:view', 'emr:view_own', 'emr:create', 'emr:update', 'report:view', 'payroll:view_own'],
    [shared_types_1.UserRole.RESEPSIONIS]: ['dashboard:view', 'appointment:view', 'appointment:create', 'appointment:update', 'emr:view', 'kasir:view', 'masterdata:view'],
    [shared_types_1.UserRole.KASIR]: ['dashboard:view', 'kasir:view', 'kasir:create', 'kasir:refund', 'report:view', 'report:export'],
    [shared_types_1.UserRole.APOTEKER]: ['dashboard:view', 'emr:view', 'masterdata:view'],
};
exports.TREATMENT_CATEGORIES = [
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
exports.BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
exports.PAYMENT_METHOD_LABEL = {
    [shared_types_1.PaymentMethod.CASH]: 'Tunai',
    [shared_types_1.PaymentMethod.CARD]: 'Kartu Debit/Kredit',
    [shared_types_1.PaymentMethod.QRIS]: 'QRIS',
    [shared_types_1.PaymentMethod.TRANSFER]: 'Transfer Bank',
    [shared_types_1.PaymentMethod.INSURANCE]: 'Asuransi',
    [shared_types_1.PaymentMethod.DEPOSIT]: 'Deposit',
};
exports.RM_FORMAT = 'RM-YYYYMMDD-XXXXX';
exports.INVOICE_FORMAT = 'INV-YYYYMMDD-XXX';
var icd_dental_1 = require("./icd-dental");
Object.defineProperty(exports, "ICD10_DENTAL", { enumerable: true, get: function () { return icd_dental_1.ICD10_DENTAL; } });
Object.defineProperty(exports, "ICD9_DENTAL", { enumerable: true, get: function () { return icd_dental_1.ICD9_DENTAL; } });
Object.defineProperty(exports, "searchIcd10", { enumerable: true, get: function () { return icd_dental_1.searchIcd10; } });
Object.defineProperty(exports, "searchIcd9", { enumerable: true, get: function () { return icd_dental_1.searchIcd9; } });
Object.defineProperty(exports, "ICD10_CATEGORIES", { enumerable: true, get: function () { return icd_dental_1.ICD10_CATEGORIES; } });
Object.defineProperty(exports, "ICD9_CATEGORIES", { enumerable: true, get: function () { return icd_dental_1.ICD9_CATEGORIES; } });
//# sourceMappingURL=index.js.map