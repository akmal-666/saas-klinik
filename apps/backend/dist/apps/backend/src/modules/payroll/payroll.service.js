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
var PayrollService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
let PayrollService = PayrollService_1 = class PayrollService {
    constructor(sb) {
        this.sb = sb;
        this.logger = new common_1.Logger(PayrollService_1.name);
    }
    async calculatePeriod(clinic_id, period_start, period_end, created_by) {
        const { data: doctors } = await this.sb.from('doctors')
            .select('id, name, share_code_id, share_code:share_codes(doctor_pct, clinic_pct, code, name)')
            .eq('clinic_id', clinic_id).eq('is_active', true);
        if (!doctors?.length)
            throw new common_1.BadRequestException('Tidak ada dokter aktif');
        const { data: period } = await this.sb.from('payroll_periods').insert({
            clinic_id, period_start, period_end, status: 'draft', total_amount: 0,
        }).select().single();
        const items = [];
        let grandTotal = 0;
        for (const doc of doctors) {
            const sc = doc.share_code;
            const doctorPct = sc?.doctor_pct ?? 40;
            const clinicPct = sc?.clinic_pct ?? 60;
            const { data: revenues } = await this.sb
                .from('invoices')
                .select('total, emr:emr_records!inner(doctor_id)')
                .eq('clinic_id', clinic_id)
                .eq('status', 'paid')
                .eq('emr_records.doctor_id', doc.id)
                .gte('created_at', `${period_start}T00:00:00`)
                .lte('created_at', `${period_end}T23:59:59`);
            const totalRevenue = (revenues ?? []).reduce((s, inv) => s + inv.total, 0);
            const doctorAmount = Math.round((totalRevenue * doctorPct) / 100);
            const clinicAmount = totalRevenue - doctorAmount;
            items.push({
                payroll_period_id: period.id,
                doctor_id: doc.id,
                share_code_id: doc.share_code_id,
                total_revenue: totalRevenue,
                doctor_pct: doctorPct,
                doctor_amount: doctorAmount,
                clinic_amount: clinicAmount,
                status: 'pending',
            });
            grandTotal += doctorAmount;
        }
        await this.sb.from('payroll_items').insert(items);
        await this.sb.from('payroll_periods').update({ total_amount: grandTotal }).eq('id', period.id);
        this.logger.log(`Payroll calculated: ${period.id} — total ${grandTotal}`);
        return { ...period, items, total_amount: grandTotal };
    }
    async listPeriods(clinic_id) {
        const { data, error } = await this.sb.from('payroll_periods')
            .select('*').eq('clinic_id', clinic_id).order('period_start', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getPeriod(clinic_id, id) {
        const { data: period, error } = await this.sb.from('payroll_periods').select('*').eq('id', id).eq('clinic_id', clinic_id).single();
        if (error || !period)
            throw new common_1.NotFoundException('Periode tidak ditemukan');
        const { data: items } = await this.sb.from('payroll_items')
            .select('*, doctor:doctors(id,name,specialization), share_code:share_codes(code,name,doctor_pct,clinic_pct)')
            .eq('payroll_period_id', id);
        return { ...period, items: items ?? [] };
    }
    async approvePeriod(clinic_id, id, approved_by) {
        const period = await this.getPeriod(clinic_id, id);
        if (period.status !== 'draft')
            throw new common_1.BadRequestException('Hanya periode draft yang bisa diapprove');
        const { data } = await this.sb.from('payroll_periods')
            .update({ status: 'approved', approved_by, approved_at: new Date().toISOString() })
            .eq('id', id).select().single();
        return data;
    }
    async markItemPaid(clinic_id, period_id, item_id) {
        await this.getPeriod(clinic_id, period_id);
        const { data } = await this.sb.from('payroll_items')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', item_id).eq('payroll_period_id', period_id).select().single();
        if (!data)
            throw new common_1.NotFoundException('Item tidak ditemukan');
        return data;
    }
    async overrideItem(clinic_id, period_id, item_id, amount, reason) {
        await this.getPeriod(clinic_id, period_id);
        const { data } = await this.sb.from('payroll_items')
            .update({ override_amount: amount, override_reason: reason })
            .eq('id', item_id).eq('payroll_period_id', period_id).select().single();
        return data;
    }
    async getDoctorSummary(clinic_id, doctor_id, year) {
        const { data: items } = await this.sb
            .from('payroll_items')
            .select('*, period:payroll_periods!inner(period_start, period_end, status)')
            .eq('doctor_id', doctor_id)
            .filter('payroll_periods.clinic_id', 'eq', clinic_id);
        const monthly = (items ?? []).map((i) => ({
            month: i.period.period_start,
            revenue: i.total_revenue,
            amount: i.override_amount ?? i.doctor_amount,
            status: i.status,
        }));
        return {
            doctor_id,
            year,
            total_revenue: monthly.reduce((s, m) => s + m.revenue, 0),
            total_earned: monthly.reduce((s, m) => s + m.amount, 0),
            monthly,
        };
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = PayrollService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map