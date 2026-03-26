import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';

@Injectable()
export class TreatmentsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient) {}

  async findAll(clinic_id: string, category?: string, active = true) {
    let q = this.sb.from('treatments').select('*,share_code:share_codes(id,code,name,doctor_pct,clinic_pct)').eq('clinic_id', clinic_id).order('category').order('name');
    if (active) q = q.eq('is_active', true);
    if (category) q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async create(clinic_id: string, dto: any) {
    const { data, error } = await this.sb.from('treatments').insert({ clinic_id, ...dto }).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(clinic_id: string, id: string, dto: any) {
    const { data, error } = await this.sb.from('treatments').update({ ...dto, updated_at: new Date().toISOString() }).eq('id', id).eq('clinic_id', clinic_id).select().single();
    if (error || !data) throw new NotFoundException('Treatment tidak ditemukan');
    return data;
  }

  async getCategories(clinic_id: string) {
    const { data } = await this.sb.from('treatments').select('category').eq('clinic_id', clinic_id).eq('is_active', true);
    return [...new Set((data ?? []).map((r) => r.category))].sort();
  }
}
