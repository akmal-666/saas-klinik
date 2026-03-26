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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
let ReportsService = class ReportsService {
    constructor(sb) {
        this.sb = sb;
    }
    async getRevenueReport(clinic_id, date_from, date_to, doctor_id) {
        let q = this.sb.from('invoices')
            .select('id, total, status, created_at, patient_id, emr:emr_records!inner(doctor_id)')
            .eq('clinic_id', clinic_id).eq('status', 'paid')
            .gte('created_at', `${date_from}T00:00:00`)
            .lte('created_at', `${date_to}T23:59:59`);
        if (doctor_id)
            q = q.eq('emr_records.doctor_id', doctor_id);
        const { data, error } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const totalRevenue = (data ?? []).reduce((s, i) => s + i.total, 0);
        const byDay = {};
        (data ?? []).forEach((inv) => {
            const day = inv.created_at.split('T')[0];
            byDay[day] = (byDay[day] ?? 0) + inv.total;
        });
        return {
            date_from, date_to,
            total_revenue: totalRevenue,
            total_invoices: data?.length ?? 0,
            by_day: Object.entries(byDay).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
        };
    }
    async getVisitReport(clinic_id, date_from, date_to) {
        const { data: appts } = await this.sb.from('appointments')
            .select('id, status, patient_id, doctor_id, scheduled_date, source')
            .eq('clinic_id', clinic_id)
            .gte('scheduled_date', date_from)
            .lte('scheduled_date', date_to);
        const completed = (appts ?? []).filter(a => a.status === 'completed');
        const cancelled = (appts ?? []).filter(a => a.status === 'cancel');
        const uniquePatients = new Set((appts ?? []).map(a => a.patient_id));
        const { data: newPatients } = await this.sb.from('patients')
            .select('id').eq('clinic_id', clinic_id)
            .gte('created_at', `${date_from}T00:00:00`)
            .lte('created_at', `${date_to}T23:59:59`);
        return {
            date_from, date_to,
            total_appointments: appts?.length ?? 0,
            total_completed: completed.length,
            total_cancelled: cancelled.length,
            total_unique_patients: uniquePatients.size,
            new_patients: newPatients?.length ?? 0,
            returning_patients: uniquePatients.size - (newPatients?.length ?? 0),
            completion_rate: appts?.length ? Math.round((completed.length / appts.length) * 100) : 0,
            cancel_rate: appts?.length ? Math.round((cancelled.length / appts.length) * 100) : 0,
        };
    }
    async getDailySummary(clinic_id, date) {
        const [appts, invoices, payments, emrs] = await Promise.all([
            this.sb.from('appointments').select('id,status').eq('clinic_id', clinic_id).eq('scheduled_date', date),
            this.sb.from('invoices').select('id,total,status').eq('clinic_id', clinic_id).gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`),
            this.sb.from('payments').select('method,amount').eq('clinic_id', clinic_id).gte('paid_at', `${date}T00:00:00`).lte('paid_at', `${date}T23:59:59`),
            this.sb.from('emr_records').select('id').eq('clinic_id', clinic_id).eq('visit_date', date),
        ]);
        const totalRevenue = (payments.data ?? []).reduce((s, p) => s + p.amount, 0);
        const byMethod = (payments.data ?? []).reduce((acc, p) => {
            acc[p.method] = (acc[p.method] ?? 0) + p.amount;
            return acc;
        }, {});
        return {
            date,
            appointments: {
                total: appts.data?.length ?? 0,
                completed: appts.data?.filter(a => a.status === 'completed').length ?? 0,
                cancelled: appts.data?.filter(a => a.status === 'cancel').length ?? 0,
                waiting: appts.data?.filter(a => ['waiting', 'engaged'].includes(a.status)).length ?? 0,
            },
            revenue: {
                total: totalRevenue,
                by_method: byMethod,
                invoices: invoices.data?.length ?? 0,
            },
            emr_count: emrs.data?.length ?? 0,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], ReportsService);
//# sourceMappingURL=reports.service.js.map