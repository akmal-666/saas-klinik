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
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
let DoctorsService = class DoctorsService {
    constructor(sb) {
        this.sb = sb;
    }
    async findAll(clinic_id, includeSchedules = true) {
        const select = includeSchedules
            ? '*, schedules:doctor_schedules(*), share_code:share_codes(id,code,name,doctor_pct,clinic_pct)'
            : 'id,name,specialization,sip_number,photo_url,is_active';
        const { data, error } = await this.sb.from('doctors').select(select).eq('clinic_id', clinic_id).order('name');
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async findOne(clinic_id, id) {
        const { data, error } = await this.sb.from('doctors')
            .select('*, schedules:doctor_schedules(*), leaves:doctor_leaves(start_date,end_date,reason), share_code:share_codes(*)')
            .eq('id', id).eq('clinic_id', clinic_id).single();
        if (error || !data)
            throw new common_1.NotFoundException('Dokter tidak ditemukan');
        return data;
    }
    async create(clinic_id, dto) {
        const { schedules, ...rest } = dto;
        const { data: doc, error } = await this.sb.from('doctors').insert({ clinic_id, ...rest }).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (schedules?.length) {
            await this.sb.from('doctor_schedules').insert(schedules.map((s) => ({ ...s, doctor_id: doc.id, clinic_id })));
        }
        return doc;
    }
    async update(clinic_id, id, dto) {
        const { schedules, ...rest } = dto;
        const { data, error } = await this.sb.from('doctors').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id).eq('clinic_id', clinic_id).select().single();
        if (error || !data)
            throw new common_1.NotFoundException('Dokter tidak ditemukan');
        if (schedules) {
            await this.sb.from('doctor_schedules').delete().eq('doctor_id', id);
            if (schedules.length)
                await this.sb.from('doctor_schedules').insert(schedules.map((s) => ({ ...s, doctor_id: id, clinic_id })));
        }
        return data;
    }
    async getAvailability(clinic_id, doctor_id, date) {
        const { data: appts } = await this.sb.from('appointments').select('scheduled_time,duration_minutes,status').eq('doctor_id', doctor_id).eq('clinic_id', clinic_id).eq('scheduled_date', date).not('status', 'in', '(cancel,reschedule)');
        const { data: leaves } = await this.sb.from('doctor_leaves').select('start_date,end_date').eq('doctor_id', doctor_id).lte('start_date', date).gte('end_date', date);
        return { appointments: appts ?? [], on_leave: (leaves?.length ?? 0) > 0 };
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map