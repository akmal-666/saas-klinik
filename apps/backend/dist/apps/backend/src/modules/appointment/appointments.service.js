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
var AppointmentsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
const shared_types_1 = require("../../../../../packages/shared-types/src/index.ts");
const shared_constants_1 = require("../../../../../packages/shared-constants/src/index.ts");
let AppointmentsService = AppointmentsService_1 = class AppointmentsService {
    constructor(supabase) {
        this.supabase = supabase;
        this.logger = new common_1.Logger(AppointmentsService_1.name);
    }
    async findAll(clinic_id, query) {
        let q = this.supabase
            .from('appointments')
            .select(`
        *,
        patient:patients(id, rm_number, full_name, phone, gender, date_of_birth, blood_type, allergy),
        doctor:doctors(id, name, specialization, photo_url),
        treatments:appointment_treatments(
          treatment:treatments(id, name, category, price, duration_minutes)
        )
      `)
            .eq('clinic_id', clinic_id)
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time', { ascending: true });
        if (query.date)
            q = q.eq('scheduled_date', query.date);
        if (query.doctor_id)
            q = q.eq('doctor_id', query.doctor_id);
        if (query.patient_id)
            q = q.eq('patient_id', query.patient_id);
        if (query.status)
            q = q.eq('status', query.status);
        const limit = query.limit ?? 50;
        if (query.cursor) {
            q = q.gt('id', query.cursor);
        }
        q = q.limit(limit + 1);
        const { data, error } = await q;
        if (error)
            throw new common_1.BadRequestException(error.message);
        const hasMore = data.length > limit;
        const items = hasMore ? data.slice(0, limit) : data;
        const nextCursor = hasMore ? items[items.length - 1].id : null;
        const mapped = items.map((a) => ({
            ...a,
            treatments: (a.treatments || []).map((t) => t.treatment),
        }));
        return {
            data: mapped,
            meta: {
                cursor: query.cursor ?? null,
                next_cursor: nextCursor,
                total: items.length,
                limit,
                has_more: hasMore,
            },
        };
    }
    async findOne(clinic_id, id) {
        const { data, error } = await this.supabase
            .from('appointments')
            .select(`
        *,
        patient:patients(*),
        doctor:doctors(*),
        treatments:appointment_treatments(
          treatment:treatments(*)
        )
      `)
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Appointment tidak ditemukan');
        return {
            ...data,
            treatments: (data.treatments || []).map((t) => t.treatment),
        };
    }
    async create(clinic_id, dto, created_by) {
        await this.checkConflict(clinic_id, dto.doctor_id, dto.scheduled_date, dto.scheduled_time, dto.duration_minutes ?? 30);
        const { data: appt, error } = await this.supabase
            .from('appointments')
            .insert({
            clinic_id,
            patient_id: dto.patient_id,
            doctor_id: dto.doctor_id,
            scheduled_date: dto.scheduled_date,
            scheduled_time: dto.scheduled_time,
            duration_minutes: dto.duration_minutes ?? 30,
            status: dto.status ?? shared_types_1.AppointmentStatus.BOOKED,
            notes: dto.notes ?? null,
            source: dto.source ?? 'walk_in',
            reminder_sent: false,
            created_by,
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (dto.treatment_ids?.length) {
            const { error: trError } = await this.supabase
                .from('appointment_treatments')
                .insert(dto.treatment_ids.map((tid) => ({
                appointment_id: appt.id,
                treatment_id: tid,
            })));
            if (trError)
                this.logger.warn('Treatment link error: ' + trError.message);
        }
        this.logger.log(`Appointment created: ${appt.id}`);
        return appt;
    }
    async update(clinic_id, id, dto) {
        const existing = await this.findOne(clinic_id, id);
        if (dto.scheduled_date || dto.scheduled_time) {
            await this.checkConflict(clinic_id, dto.doctor_id ?? existing.doctor_id, dto.scheduled_date ?? existing.scheduled_date, dto.scheduled_time ?? existing.scheduled_time, dto.duration_minutes ?? existing.duration_minutes, id);
        }
        const { data, error } = await this.supabase
            .from('appointments')
            .update({
            ...(dto.patient_id && { patient_id: dto.patient_id }),
            ...(dto.doctor_id && { doctor_id: dto.doctor_id }),
            ...(dto.scheduled_date && { scheduled_date: dto.scheduled_date }),
            ...(dto.scheduled_time && { scheduled_time: dto.scheduled_time }),
            ...(dto.duration_minutes && { duration_minutes: dto.duration_minutes }),
            ...(dto.notes !== undefined && { notes: dto.notes }),
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (dto.treatment_ids) {
            await this.supabase.from('appointment_treatments').delete().eq('appointment_id', id);
            if (dto.treatment_ids.length) {
                await this.supabase.from('appointment_treatments').insert(dto.treatment_ids.map((tid) => ({ appointment_id: id, treatment_id: tid })));
            }
        }
        return data;
    }
    async updateStatus(clinic_id, id, dto) {
        const appt = await this.findOne(clinic_id, id);
        const allowedNext = shared_constants_1.APPOINTMENT_STATUS_FLOW[appt.status];
        if (!allowedNext.includes(dto.status)) {
            throw new common_1.BadRequestException(`Status tidak bisa berubah dari ${appt.status} → ${dto.status}. ` +
                `Allowed: ${allowedNext.join(', ') || 'none'}`);
        }
        const { data, error } = await this.supabase
            .from('appointments')
            .update({
            status: dto.status,
            ...(dto.notes && { notes: dto.notes }),
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        this.logger.log(`Appointment ${id}: ${appt.status} → ${dto.status}`);
        return data;
    }
    async reschedule(clinic_id, id, dto, updated_by) {
        const appt = await this.findOne(clinic_id, id);
        await this.checkConflict(clinic_id, appt.doctor_id, dto.scheduled_date, dto.scheduled_time, appt.duration_minutes, id);
        const { data, error } = await this.supabase
            .from('appointments')
            .update({
            scheduled_date: dto.scheduled_date,
            scheduled_time: dto.scheduled_time,
            status: shared_types_1.AppointmentStatus.RESCHEDULE,
            notes: dto.reason ? `[Reschedule] ${dto.reason}` : appt.notes,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .eq('clinic_id', clinic_id)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async remove(clinic_id, id) {
        const appt = await this.findOne(clinic_id, id);
        if (appt.status === shared_types_1.AppointmentStatus.ENGAGED || appt.status === shared_types_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Tidak bisa menghapus appointment yang sedang berjalan atau selesai');
        }
        const { error } = await this.supabase
            .from('appointments')
            .update({ status: shared_types_1.AppointmentStatus.CANCEL, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('clinic_id', clinic_id);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return { message: 'Appointment berhasil dibatalkan' };
    }
    async getTodaySummary(clinic_id) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await this.supabase
            .from('appointments')
            .select('status')
            .eq('clinic_id', clinic_id)
            .eq('scheduled_date', today);
        if (error)
            throw new common_1.BadRequestException(error.message);
        return (data || []).reduce((acc, a) => {
            acc[a.status] = (acc[a.status] ?? 0) + 1;
            return acc;
        }, {});
    }
    async checkConflict(clinic_id, doctor_id, date, time, duration, excludeId) {
        const [h, m] = time.split(':').map(Number);
        const startMin = h * 60 + m;
        const endMin = startMin + duration;
        const { data } = await this.supabase
            .from('appointments')
            .select('id, scheduled_time, duration_minutes, status')
            .eq('clinic_id', clinic_id)
            .eq('doctor_id', doctor_id)
            .eq('scheduled_date', date)
            .not('status', 'in', `(${shared_types_1.AppointmentStatus.CANCEL},${shared_types_1.AppointmentStatus.RESCHEDULE})`);
        for (const existing of data ?? []) {
            if (excludeId && existing.id === excludeId)
                continue;
            const [eh, em] = existing.scheduled_time.split(':').map(Number);
            const eStart = eh * 60 + em;
            const eEnd = eStart + existing.duration_minutes;
            if (startMin < eEnd && endMin > eStart) {
                throw new common_1.BadRequestException(`Dokter sudah memiliki appointment pada ${existing.scheduled_time} — terjadi tumpang tindih jadwal`);
            }
        }
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = AppointmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map