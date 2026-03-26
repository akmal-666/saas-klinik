"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KasirService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasirService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
const shared_types_1 = require("../../../../../packages/shared-types/src/index.ts");
let KasirService = KasirService_1 = class KasirService {
    constructor(sb) {
        this.sb = sb;
        this.logger = new common_1.Logger(KasirService_1.name);
    }
    async listInvoices(clinic_id, query) {
        const limit = Math.min(query.limit ?? 30, 100);
        let q = this.sb
            .from('invoices')
            .select(`
        id, invoice_number, status, subtotal, discount_amount,
        tax_amount, total, notes, created_at,
        patient:patients(id, rm_number, full_name, phone),
        payments(id, method, amount, status, paid_at)
      `)
            .eq('clinic_id', clinic_id)
            .order('created_at', { ascending: false });
        if (query.patient_id)
            q = q.eq('patient_id', query.patient_id);
        if (query.status)
            q = q.eq('status', query.status);
        if (query.date_from)
            q = q.gte('created_at', query.date_from);
        if (query.date_to)
            q = q.lte('created_at', query.date_to + 'T23:59:59');
        if (query.cursor)
            q = q.lt('created_at', query.cursor);
        q = q.limit(limit + 1);
        const { data, error } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const hasMore = data.length > limit;
        const items = hasMore ? data.slice(0, limit) : data;
        return {
            data: items,
            meta: { next_cursor: hasMore ? items.at(-1)?.created_at : null, has_more: hasMore, total: items.length, limit },
        };
    }
    async getInvoice(clinic_id, id) {
        const { data, error } = await this.sb
            .from('invoices')
            .select(`
        *,
        patient:patients(*),
        payments(*),
        promo:promotions(id, code, name, discount_type, discount_value)
      `)
            .eq('id', id).eq('clinic_id', clinic_id).single();
        if (error || !data)
            throw new common_1.NotFoundException('Invoice tidak ditemukan');
        return data;
    }
    async createInvoice(clinic_id, dto, created_by) {
        const { data: patient } = await this.sb.from('patients').select('id').eq('id', dto.patient_id).eq('clinic_id', clinic_id).single();
        if (!patient)
            throw new common_1.BadRequestException('Pasien tidak ditemukan');
        const items = dto.items.map((item) => ({
            ...item,
            total: item.quantity * item.unit_price,
        }));
        const subtotal = items.reduce((s, i) => s + i.total, 0);
        let discount_amount = dto.discount_amount ?? 0;
        let promo_id = dto.promo_id ?? null;
        if (dto.promo_code && !promo_id) {
            const resolved = await this.resolvePromo(clinic_id, dto.promo_code, subtotal);
            discount_amount = resolved.discount;
            promo_id = resolved.promo_id;
        }
        const tax_amount = 0;
        const total = Math.max(0, subtotal - discount_amount + tax_amount);
        const { data: inv, error } = await this.sb
            .from('invoices')
            .insert({
            clinic_id,
            patient_id: dto.patient_id,
            appointment_id: dto.appointment_id ?? null,
            emr_id: dto.emr_id ?? null,
            items,
            subtotal, discount_amount, promo_id, tax_amount, total,
            status: shared_types_1.InvoiceStatus.ISSUED,
            notes: dto.notes ?? null,
            created_by,
        })
            .select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        this.logger.log(`Invoice created: ${inv.invoice_number}`);
        return inv;
    }
    async addPayment(clinic_id, invoice_id, dto, created_by) {
        const inv = await this.getInvoice(clinic_id, invoice_id);
        if (inv.status === shared_types_1.InvoiceStatus.PAID)
            throw new common_1.BadRequestException('Invoice sudah lunas');
        if (inv.status === shared_types_1.InvoiceStatus.CANCELLED)
            throw new common_1.BadRequestException('Invoice sudah dibatalkan');
        if (dto.method === shared_types_1.PaymentMethod.DEPOSIT) {
            const balance = await this.getDepositBalance(clinic_id, inv.patient_id);
            if (balance < dto.amount)
                throw new common_1.BadRequestException(`Saldo deposit tidak cukup. Saldo: Rp ${balance.toLocaleString('id-ID')}`);
            await this.sb.from('deposits').insert({
                clinic_id, patient_id: inv.patient_id,
                amount: -dto.amount,
                balance_after: balance - dto.amount,
                invoice_id,
                notes: `Pembayaran invoice ${inv.invoice_number}`,
                created_by,
            });
        }
        const { data: payment, error } = await this.sb
            .from('payments')
            .insert({
            clinic_id, invoice_id,
            method: dto.method,
            amount: dto.amount,
            reference_number: dto.reference_number ?? null,
            insurance_id: dto.insurance_id ?? null,
            insurance_claim_number: dto.insurance_claim_number ?? null,
            status: shared_types_1.PaymentStatus.PAID,
            paid_at: new Date().toISOString(),
            notes: dto.notes ?? null,
            created_by,
        })
            .select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.reconcileInvoiceStatus(clinic_id, invoice_id);
        return payment;
    }
    async applyVoucher(clinic_id, invoice_id, dto) {
        const inv = await this.getInvoice(clinic_id, invoice_id);
        const { discount, promo_id, promo_name } = await this.resolvePromo(clinic_id, dto.code, inv.subtotal);
        const { data, error } = await this.sb
            .from('invoices')
            .update({
            discount_amount: discount,
            promo_id,
            total: Math.max(0, inv.subtotal - discount + inv.tax_amount),
            updated_at: new Date().toISOString(),
        })
            .eq('id', invoice_id).eq('clinic_id', clinic_id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { ...data, promo_applied: promo_name, discount_applied: discount };
    }
    async voidInvoice(clinic_id, id, reason) {
        const inv = await this.getInvoice(clinic_id, id);
        if (inv.status === shared_types_1.InvoiceStatus.PAID)
            throw new common_1.BadRequestException('Invoice yang sudah lunas tidak dapat dibatalkan. Gunakan refund.');
        const { data, error } = await this.sb
            .from('invoices')
            .update({ status: shared_types_1.InvoiceStatus.CANCELLED, notes: `[VOID] ${reason}`, updated_at: new Date().toISOString() })
            .eq('id', id).eq('clinic_id', clinic_id).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getDepositBalance(clinic_id, patient_id) {
        const { data } = await this.sb
            .from('deposits')
            .select('amount')
            .eq('patient_id', patient_id);
        return (data ?? []).reduce((s, d) => s + d.amount, 0);
    }
    async topUpDeposit(clinic_id, dto, created_by) {
        const { data: patient } = await this.sb.from('patients').select('id').eq('id', dto.patient_id).eq('clinic_id', clinic_id).single();
        if (!patient)
            throw new common_1.BadRequestException('Pasien tidak ditemukan');
        const balance = await this.getDepositBalance(clinic_id, dto.patient_id);
        const newBalance = balance + dto.amount;
        const { data, error } = await this.sb.from('deposits').insert({
            clinic_id, patient_id: dto.patient_id,
            amount: dto.amount,
            balance_after: newBalance,
            notes: dto.notes ?? `Top-up deposit`,
            created_by,
        }).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        this.logger.log(`Deposit top-up: patient ${dto.patient_id} +${dto.amount}`);
        return { ...data, new_balance: newBalance };
    }
    async getDepositHistory(clinic_id, patient_id) {
        const { data: patient } = await this.sb.from('patients').select('id,full_name,rm_number').eq('id', patient_id).eq('clinic_id', clinic_id).single();
        if (!patient)
            throw new common_1.NotFoundException('Pasien tidak ditemukan');
        const { data } = await this.sb
            .from('deposits')
            .select('*')
            .eq('patient_id', patient_id)
            .order('created_at', { ascending: false });
        const balance = await this.getDepositBalance(clinic_id, patient_id);
        return { patient, transactions: data ?? [], current_balance: balance };
    }
    async getDailySummary(clinic_id, date) {
        const { data: invoices } = await this.sb
            .from('invoices')
            .select('id, total, status')
            .eq('clinic_id', clinic_id)
            .gte('created_at', `${date}T00:00:00`)
            .lte('created_at', `${date}T23:59:59`);
        const { data: payments } = await this.sb
            .from('payments')
            .select('method, amount, status')
            .eq('clinic_id', clinic_id)
            .gte('paid_at', `${date}T00:00:00`)
            .lte('paid_at', `${date}T23:59:59`);
        const total_invoice = (invoices ?? []).reduce((s, i) => s + i.total, 0);
        const total_paid = (payments ?? []).filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
        const by_method = (payments ?? []).reduce((acc, p) => {
            acc[p.method] = (acc[p.method] ?? 0) + p.amount;
            return acc;
        }, {});
        return {
            date,
            total_invoices: (invoices ?? []).length,
            total_invoice_amount: total_invoice,
            total_paid,
            total_outstanding: total_invoice - total_paid,
            by_payment_method: by_method,
            invoices_by_status: {
                issued: (invoices ?? []).filter((i) => i.status === 'issued').length,
                paid: (invoices ?? []).filter((i) => i.status === 'paid').length,
                partial: (invoices ?? []).filter((i) => i.status === 'partial').length,
                cancelled: (invoices ?? []).filter((i) => i.status === 'cancelled').length,
            },
        };
    }
    async resolvePromo(clinic_id, code, subtotal) {
        const { data: promo } = await this.sb
            .from('promotions')
            .select('*')
            .eq('clinic_id', clinic_id)
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .lte('valid_from', new Date().toISOString().split('T')[0])
            .gte('valid_until', new Date().toISOString().split('T')[0])
            .single();
        if (!promo)
            throw new common_1.BadRequestException(`Kode promo "${code}" tidak valid atau sudah kadaluarsa`);
        if (promo.min_transaction > subtotal)
            throw new common_1.BadRequestException(`Minimum transaksi Rp ${promo.min_transaction.toLocaleString('id-ID')}`);
        if (promo.usage_limit && promo.usage_count >= promo.usage_limit)
            throw new common_1.BadRequestException('Kuota promo sudah habis');
        let discount = promo.discount_type === 'percentage'
            ? (subtotal * promo.discount_value) / 100
            : promo.discount_value;
        if (promo.max_discount)
            discount = Math.min(discount, promo.max_discount);
        await this.sb.from('promotions').update({ usage_count: promo.usage_count + 1 }).eq('id', promo.id);
        return { discount, promo_id: promo.id, promo_name: promo.name };
    }
    async reconcileInvoiceStatus(clinic_id, invoice_id) {
        const { data: inv } = await this.sb.from('invoices').select('total').eq('id', invoice_id).single();
        const { data: payments } = await this.sb.from('payments').select('amount').eq('invoice_id', invoice_id).eq('status', 'paid');
        const paid = (payments ?? []).reduce((s, p) => s + p.amount, 0);
        const total = inv?.total ?? 0;
        const status = paid >= total ? shared_types_1.InvoiceStatus.PAID : paid > 0 ? shared_types_1.InvoiceStatus.PARTIAL : shared_types_1.InvoiceStatus.ISSUED;
        await this.sb.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', invoice_id);
    }
};
exports.KasirService = KasirService;
exports.KasirService = KasirService = KasirService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], KasirService);
//# sourceMappingURL=kasir.service.js.map