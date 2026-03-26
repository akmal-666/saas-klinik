"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.PromoDiscountType = exports.PromoType = exports.AttachmentType = exports.Gender = exports.InvoiceStatus = exports.PaymentStatus = exports.PaymentMethod = exports.AppointmentStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN_KLINIK"] = "admin_klinik";
    UserRole["DOKTER"] = "dokter";
    UserRole["RESEPSIONIS"] = "resepsionis";
    UserRole["KASIR"] = "kasir";
    UserRole["APOTEKER"] = "apoteker";
})(UserRole || (exports.UserRole = UserRole = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PREBOOK"] = "prebook";
    AppointmentStatus["BOOKED"] = "booked";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["NOTIFIED"] = "notified";
    AppointmentStatus["WAITING"] = "waiting";
    AppointmentStatus["ENGAGED"] = "engaged";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["RESCHEDULE"] = "reschedule";
    AppointmentStatus["CANCEL"] = "cancel";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["QRIS"] = "qris";
    PaymentMethod["TRANSFER"] = "transfer";
    PaymentMethod["INSURANCE"] = "insurance";
    PaymentMethod["DEPOSIT"] = "deposit";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PARTIAL"] = "partial";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["ISSUED"] = "issued";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["PARTIAL"] = "partial";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var Gender;
(function (Gender) {
    Gender["L"] = "L";
    Gender["P"] = "P";
})(Gender || (exports.Gender = Gender = {}));
var AttachmentType;
(function (AttachmentType) {
    AttachmentType["BEFORE"] = "before";
    AttachmentType["AFTER"] = "after";
    AttachmentType["CONSENT"] = "consent";
    AttachmentType["DOCUMENT"] = "document";
    AttachmentType["PRESCRIPTION"] = "prescription";
})(AttachmentType || (exports.AttachmentType = AttachmentType = {}));
var PromoType;
(function (PromoType) {
    PromoType["VOUCHER"] = "voucher";
    PromoType["CAMPAIGN"] = "campaign";
})(PromoType || (exports.PromoType = PromoType = {}));
var PromoDiscountType;
(function (PromoDiscountType) {
    PromoDiscountType["PERCENTAGE"] = "percentage";
    PromoDiscountType["FIXED"] = "fixed";
})(PromoDiscountType || (exports.PromoDiscountType = PromoDiscountType = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["PENDING"] = "pending";
    SyncStatus["SYNCED"] = "synced";
    SyncStatus["FAILED"] = "failed";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=index.js.map