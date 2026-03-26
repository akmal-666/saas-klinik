import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';

@Injectable()
export class DoctorsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient) {}

  async findAll(clinic_id: string, includeSchedules = true) {
    const select = includeSchedules
      ? '*, schedules:doctor_schedules(*), share_code:share_codes(id,code,name,doctor_pct,clinic_pct)'
      : 'id,name,specialization,sip_number,photo_url,is_active';
    const { data, error } = await this.sb.from('doctors').select(select).eq('clinic_id', clinic_id).order('name');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(clinic_id: string, id: string) {
    const { data, error } = await this.sb.from('doctors')
      .select('*, schedules:doctor_schedules(*), leaves:doctor_leaves(start_date,end_date,reason), share_code:share_codes(*)')
      .eq('id', id).eq('clinic_id', clinic_id).single();
    if (error || !data) throw new NotFoundException('Dokter tidak ditemukan');
    return data;
  }

  async create(clinic_id: string, dto: any) {
    const { schedules, ...rest } = dto;
    const { data: doc, error } = await this.sb.from('doctors').insert({ clinic_id, ...rest }).select().single();
    if (error) throw new BadRequestException(error.message);
    if (schedules?.length) {
      await this.sb.from('doctor_schedules').insert(schedules.map((s: any) => ({ ...s, doctor_id: doc.id, clinic_id })));
    }
    return doc;
  }

  async update(clinic_id: string, id: string, dto: any) {
    const { schedules, ...rest } = dto;
    const { data, error } = await this.sb.from('doctors').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id).eq('clinic_id', clinic_id).select().single();
    if (error || !data) throw new NotFoundException('Dokter tidak ditemukan');
    if (schedules) {
      await this.sb.from('doctor_schedules').delete().eq('doctor_id', id);
      if (schedules.length) await this.sb.from('doctor_schedules').insert(schedules.map((s: any) => ({ ...s, doctor_id: id, clinic_id })));
    }
    return data;
  }

  async getAvailability(clinic_id: string, doctor_id: string, date: string) {
    const { data: appts } = await this.sb.from('appointments').select('scheduled_time,duration_minutes,status').eq('doctor_id', doctor_id).eq('clinic_id', clinic_id).eq('scheduled_date', date).not('status','in','(cancel,reschedule)');
    const { data: leaves } = await this.sb.from('doctor_leaves').select('start_date,end_date').eq('doctor_id', doctor_id).lte('start_date', date).gte('end_date', date);
    return { appointments: appts ?? [], on_leave: (leaves?.length ?? 0) > 0 };
  }
}
