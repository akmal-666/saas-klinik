import {
  Injectable, NotFoundException, BadRequestException, Inject,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

export { CreatePatientDto, UpdatePatientDto };

@Injectable()
export class PatientsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient) {}

  async findAll(
    clinic_id: string,
    q?: string,
    cursor?: string,
    limit: number = 30,
  ) {
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

    if (q)      query = query.ilike('full_name', `%${q}%`);
    if (cursor) query = query.gt('id', cursor);
    query = query.limit(lim + 1);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);

    const hasMore = data.length > lim;
    const items   = hasMore ? data.slice(0, lim) : data;
    return {
      data: items,
      meta: {
        has_more:    hasMore,
        next_cursor: hasMore ? items[items.length - 1].id : null,
        total:       items.length,
        limit:       lim,
      },
    };
  }

  async findOne(clinic_id: string, id: string) {
    const { data, error } = await this.sb
      .from('patients')
      .select('*, insurance:insurances(*)')
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .single();
    if (error || !data) throw new NotFoundException('Pasien tidak ditemukan');
    return data;
  }

  async create(clinic_id: string, dto: CreatePatientDto) {
    const { data, error } = await this.sb
      .from('patients')
      .insert({ clinic_id, ...dto })
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(clinic_id: string, id: string, dto: UpdatePatientDto) {
    const { data, error } = await this.sb
      .from('patients')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Pasien tidak ditemukan');
    return data;
  }

  async deactivate(clinic_id: string, id: string) {
    const { data, error } = await this.sb
      .from('patients')
      .update({ is_active: false })
      .eq('id', id)
      .eq('clinic_id', clinic_id)
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Pasien tidak ditemukan');
    return data;
  }

  async searchByRm(clinic_id: string, rm: string) {
    const { data } = await this.sb
      .from('patients')
      .select('id, rm_number, full_name, date_of_birth, gender, phone, allergy')
      .eq('clinic_id', clinic_id)
      .ilike('rm_number', `%${rm}%`)
      .limit(10);
    return data ?? [];
  }
}
