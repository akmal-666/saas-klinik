import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';
import {
  Appointment,
  AppointmentStatus,
  AppointmentWithRelations,
  PaginationMeta,
} from '@klinik/shared-types';
import { APPOINTMENT_STATUS_FLOW } from '@klinik/shared-constants';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentStatusDto,
  AppointmentQueryDto,
  RescheduleAppointmentDto,
} from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient,
  ) {}

  // ─── LIST ───────────────────────────────────────────────

  async findAll(
    clinic_id: string,
    query: AppointmentQueryDto,
  ): Promise<{ data: AppointmentWithRelations[]; meta: PaginationMeta }> {
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

    if (query.date)      q = q.eq('scheduled_date', query.date);
    if (query.doctor_id) q = q.eq('doctor_id', query.doctor_id);
    if (query.patient_id)q = q.eq('patient_id', query.patient_id);
    if (query.status)    q = q.eq('status', query.status);

    // Cursor-based pagination
    const limit = query.limit ?? 50;
    if (query.cursor) {
      q = q.gt('id', query.cursor);
    }
    q = q.limit(limit + 1);

    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Flatten nested treatment join
    const mapped = items.map((a) => ({
      ...a,
      treatments: (a.treatments || []).map((t: any) => t.treatment),
    })) as AppointmentWithRelations[];

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

  // ─── FIND ONE ───────────────────────────────────────────

  async findOne(clinic_id: string, id: string): Promise<AppointmentWithRelations> {
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

    if (error || !data) throw new NotFoundException('Appointment tidak ditemukan');

    return {
      ...data,
      treatments: (data.treatments || []).map((t: any) => t.treatment),
    } as AppointmentWithRelations;
  }

  // ─── CREATE ─────────────────────────────────────────────

  async create(
    clinic_id: string,
    dto: CreateAppointmentDto,
    created_by: string,
  ): Promise<Appointment> {
    // 1. Validate no conflict
    await this.checkConflict(clinic_id, dto.doctor_id, dto.scheduled_date, dto.scheduled_time, dto.duration_minutes ?? 30);

    // 2. Insert appointment
    const { data: appt, error } = await this.supabase
      .from('appointments')
      .insert({
        clinic_id,
        patient_id:       dto.patient_id,
        doctor_id:        dto.doctor_id,
        scheduled_date:   dto.scheduled_date,
        scheduled_time:   dto.scheduled_time,
        duration_minutes: dto.duration_minutes ?? 30,
        status:           dto.status ?? AppointmentStatus.BOOKED,
        notes:            dto.notes ?? null,
        source:           dto.source ?? 'walk_in',
        reminder_sent:    false,
        created_by,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // 3. Insert treatment links (junction table)
    if (dto.treatment_ids?.length) {
      const { error: trError } = await this.supabase
        .from('appointment_treatments')
        .insert(
          dto.treatment_ids.map((tid) => ({
            appointment_id: appt.id,
            treatment_id:   tid,
          })),
        );
      if (trError) this.logger.warn('Treatment link error: ' + trError.message);
    }

    this.logger.log(`Appointment created: ${appt.id}`);
    return appt as Appointment;
  }

  // ─── UPDATE ─────────────────────────────────────────────

  async update(
    clinic_id: string,
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const existing = await this.findOne(clinic_id, id);

    // Check conflict if time changed
    if (dto.scheduled_date || dto.scheduled_time) {
      await this.checkConflict(
        clinic_id,
        dto.doctor_id ?? existing.doctor_id,
        dto.scheduled_date ?? existing.scheduled_date,
        dto.scheduled_time ?? existing.scheduled_time,
        dto.duration_minutes ?? existing.duration_minutes,
        id, // exclude self
      );
    }

    const { data, error } = await this.supabase
      .from('appointments')
      .update({
        ...(dto.patient_id       && { patient_id: dto.patient_id }),
        ...(dto.doctor_id        && { doctor_id: dto.doctor_id }),
        ...(dto.scheduled_date   && { scheduled_date: dto.scheduled_date }),
        ...(dto.scheduled_time   && { scheduled_time: dto.scheduled_time }),
        ...(dto.duration_minutes && { duration_minutes: dto.duration_minutes }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Update treatments if provided
    if (dto.treatment_ids) {
      await this.supabase.from('appointment_treatments').delete().eq('appointment_id', id);
      if (dto.treatment_ids.length) {
        await this.supabase.from('appointment_treatments').insert(
          dto.treatment_ids.map((tid) => ({ appointment_id: id, treatment_id: tid })),
        );
      }
    }

    return data as Appointment;
  }

  // ─── UPDATE STATUS ──────────────────────────────────────

  async updateStatus(
    clinic_id: string,
    id: string,
    dto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    const appt = await this.findOne(clinic_id, id);

    const allowedNext = APPOINTMENT_STATUS_FLOW[appt.status];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Status tidak bisa berubah dari ${appt.status} → ${dto.status}. ` +
        `Allowed: ${allowedNext.join(', ') || 'none'}`,
      );
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

    if (error) throw new BadRequestException(error.message);
    this.logger.log(`Appointment ${id}: ${appt.status} → ${dto.status}`);
    return data as Appointment;
  }

  // ─── RESCHEDULE ─────────────────────────────────────────

  async reschedule(
    clinic_id: string,
    id: string,
    dto: RescheduleAppointmentDto,
    updated_by: string,
  ): Promise<Appointment> {
    const appt = await this.findOne(clinic_id, id);

    await this.checkConflict(
      clinic_id,
      appt.doctor_id,
      dto.scheduled_date,
      dto.scheduled_time,
      appt.duration_minutes,
      id,
    );

    const { data, error } = await this.supabase
      .from('appointments')
      .update({
        scheduled_date: dto.scheduled_date,
        scheduled_time: dto.scheduled_time,
        status:         AppointmentStatus.RESCHEDULE,
        notes:          dto.reason ? `[Reschedule] ${dto.reason}` : appt.notes,
        updated_at:     new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data as Appointment;
  }

  // ─── DELETE (cancel) ────────────────────────────────────

  async remove(clinic_id: string, id: string): Promise<{ message: string }> {
    const appt = await this.findOne(clinic_id, id);
    if (appt.status === AppointmentStatus.ENGAGED || appt.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Tidak bisa menghapus appointment yang sedang berjalan atau selesai');
    }

    const { error } = await this.supabase
      .from('appointments')
      .update({ status: AppointmentStatus.CANCEL, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('clinic_id', clinic_id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Appointment berhasil dibatalkan' };
  }

  // ─── TODAY SUMMARY ──────────────────────────────────────

  async getTodaySummary(clinic_id: string): Promise<Record<AppointmentStatus, number>> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabase
      .from('appointments')
      .select('status')
      .eq('clinic_id', clinic_id)
      .eq('scheduled_date', today);

    if (error) throw new BadRequestException(error.message);

    return (data || []).reduce((acc, a) => {
      acc[a.status as AppointmentStatus] = (acc[a.status as AppointmentStatus] ?? 0) + 1;
      return acc;
    }, {} as Record<AppointmentStatus, number>);
  }

  // ─── CONFLICT CHECK ─────────────────────────────────────

  private async checkConflict(
    clinic_id: string,
    doctor_id: string,
    date: string,
    time: string,
    duration: number,
    excludeId?: string,
  ): Promise<void> {
    const [h, m] = time.split(':').map(Number);
    const startMin = h * 60 + m;
    const endMin   = startMin + duration;

    const { data } = await this.supabase
      .from('appointments')
      .select('id, scheduled_time, duration_minutes, status')
      .eq('clinic_id', clinic_id)
      .eq('doctor_id', doctor_id)
      .eq('scheduled_date', date)
      .not('status', 'in', `(${AppointmentStatus.CANCEL},${AppointmentStatus.RESCHEDULE})`);

    for (const existing of data ?? []) {
      if (excludeId && existing.id === excludeId) continue;
      const [eh, em] = existing.scheduled_time.split(':').map(Number);
      const eStart = eh * 60 + em;
      const eEnd   = eStart + existing.duration_minutes;
      if (startMin < eEnd && endMin > eStart) {
        throw new BadRequestException(
          `Dokter sudah memiliki appointment pada ${existing.scheduled_time} — terjadi tumpang tindih jadwal`,
        );
      }
    }
  }
}
