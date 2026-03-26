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
exports.PatientsService = exports.UpdatePatientDto = exports.CreatePatientDto = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
const patient_dto_1 = require("./dto/patient.dto");
Object.defineProperty(exports, "CreatePatientDto", { enumerable: true, get: function () { return patient_dto_1.CreatePatientDto; } });
Object.defineProperty(exports, "UpdatePatientDto", { enumerable: true, get: function () { return patient_dto_1.UpdatePatientDto; } });
let PatientsService = class PatientsService {
    constructor(sb) {
        this.sb = sb;
    }
    async findAll(clinic_id, q, cursor, limit = 30) {
        const lim = Math.min(Number(limit) || 30, 100);
        let query = this.sb
            .from('patients')
            .select(`
        id, rm_number, full_name, date_of_birth, gender,
        phone, blood_type, allergy, is_active, created_at,
        insurance:insurances(id, name, code)
      `)
            .eq('clinic_id', clinic_id)
            .eq('is_active', true)
            .order('full_name');
        if (q)
            query = query.ilike('full_name', `%${q}%`);
        if (cursor)
            query = query.gt('id', cursor);
        query = query.limit(lim + 1);
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const hasMore = data.length > lim;
        const items = hasMore ? data.slice(0, lim) : data;
        return {
            data: items,
            meta: {
                has_more: hasMore,
                next_cursor: hasMore ? items[items.length - 1].id : null,
                total: items.length,
                limit: lim,
            },
        };
    }
    async findOne(clinic_id, id) {
        const { data, error } = await this.sb
            .from('patients')
            .select('*, insurance:insurances(*)')
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Pasien tidak ditemukan');
        return data;
    }
    async create(clinic_id, dto) {
        const { data, error } = await this.sb
            .from('patients')
            .insert({ clinic_id, ...dto })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async update(clinic_id, id, dto) {
        const { data, error } = await this.sb
            .from('patients')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .select()
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Pasien tidak ditemukan');
        return data;
    }
    async deactivate(clinic_id, id) {
        const { data, error } = await this.sb
            .from('patients')
            .update({ is_active: false })
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .select()
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Pasien tidak ditemukan');
        return data;
    }
    async searchByRm(clinic_id, rm) {
        const { data } = await this.sb
            .from('patients')
            .select('id, rm_number, full_name, date_of_birth, gender, phone, allergy')
            .eq('clinic_id', clinic_id)
            .ilike('rm_number', `%${rm}%`)
            .limit(10);
        return data ?? [];
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], PatientsService);
//# sourceMappingURL=patients.service.js.map