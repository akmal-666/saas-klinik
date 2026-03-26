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
exports.TreatmentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
let TreatmentsService = class TreatmentsService {
    constructor(sb) {
        this.sb = sb;
    }
    async findAll(clinic_id, category, active = true) {
        let q = this.sb.from('treatments').select('*,share_code:share_codes(id,code,name,doctor_pct,clinic_pct)').eq('clinic_id', clinic_id).order('category').order('name');
        if (active)
            q = q.eq('is_active', true);
        if (category)
            q = q.eq('category', category);
        const { data, error } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async create(clinic_id, dto) {
        const { data, error } = await this.sb.from('treatments').insert({ clinic_id, ...dto }).select().single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async update(clinic_id, id, dto) {
        const { data, error } = await this.sb.from('treatments').update({ ...dto, updated_at: new Date().toISOString() }).eq('id', id).eq('clinic_id', clinic_id).select().single();
        if (error || !data)
            throw new common_1.NotFoundException('Treatment tidak ditemukan');
        return data;
    }
    async getCategories(clinic_id) {
        const { data } = await this.sb.from('treatments').select('category').eq('clinic_id', clinic_id).eq('is_active', true);
        return [...new Set((data ?? []).map((r) => r.category))].sort();
    }
};
exports.TreatmentsService = TreatmentsService;
exports.TreatmentsService = TreatmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], TreatmentsService);
//# sourceMappingURL=treatments.service.js.map