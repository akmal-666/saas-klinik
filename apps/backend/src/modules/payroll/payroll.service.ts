import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);
  constructor(@Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient) {}

  // ─── Calculate period ────────────────────────────────────
  async calculatePeriod(clinic_id: string, period_start: string, period_end: string, created_by: string) {
    // Get all active doctors
    const { data: doctors } = await this.sb.from('doctors')
      .select('id, name, share_code_id, share_code:share_codes(doctor_pct, clinic_pct, code, name)')
      .eq('clinic_id', clinic_id).eq('is_active', true);

    if (!doctors?.length) throw new BadRequestException('Tidak ada dokter aktif');

    // Create or get period
    const { data: period } = await this.sb.from('payroll_periods').insert({
      clinic_id, period_start, period_end, status: 'draft', total_amount: 0,
    }).select().single();

    const items = [];
    let grandTotal = 0;

    for (const doc of doctors) {
      const sc = doc.share_code as any;
      const doctorPct = sc?.doctor_pct ?? 40;
      const clinicPct = sc?.clinic_pct ?? 60;

      // Get paid invoices linked to this doctor via EMR
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
        doctor_id:     doc.id,
        share_code_id: doc.share_code_id,
        total_revenue: totalRevenue,
        doctor_pct:    doctorPct,
        doctor_amount: doctorAmount,
        clinic_amount: clinicAmount,
        status:        'pending',
      });
      grandTotal += doctorAmount;
    }

    // Insert items
    await this.sb.from('payroll_items').insert(items);

    // Update period total
    await this.sb.from('payroll_periods').update({ total_amount: grandTotal }).eq('id', period.id);

    this.logger.log(`Payroll calculated: ${period.id} — total ${grandTotal}`);
    return { ...period, items, total_amount: grandTotal };
  }

  // ─── List periods ─────────────────────────────────────────
  async listPeriods(clinic_id: string) {
    const { data, error } = await this.sb.from('payroll_periods')
      .select('*').eq('clinic_id', clinic_id).order('period_start', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─── Get period detail ────────────────────────────────────
  async getPeriod(clinic_id: string, id: string) {
    const { data: period, error } = await this.sb.from('payroll_periods').select('*').eq('id', id).eq('clinic_id', clinic_id).single();
    if (error || !period) throw new NotFoundException('Periode tidak ditemukan');
    const { data: items } = await this.sb.from('payroll_items')
      .select('*, doctor:doctors(id,name,specialization), share_code:share_codes(code,name,doctor_pct,clinic_pct)')
      .eq('payroll_period_id', id);
    return { ...period, items: items ?? [] };
  }

  // ─── Approve period ───────────────────────────────────────
  async approvePeriod(clinic_id: string, id: string, approved_by: string) {
    const period = await this.getPeriod(clinic_id, id);
    if (period.status !== 'draft') throw new BadRequestException('Hanya periode draft yang bisa diapprove');
    const { data } = await this.sb.from('payroll_periods')
      .update({ status: 'approved', approved_by, approved_at: new Date().toISOString() })
      .eq('id', id).select().single();
    return data;
  }

  // ─── Mark as paid + individual item ──────────────────────
  async markItemPaid(clinic_id: string, period_id: string, item_id: string) {
    await this.getPeriod(clinic_id, period_id);
    const { data } = await this.sb.from('payroll_items')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', item_id).eq('payroll_period_id', period_id).select().single();
    if (!data) throw new NotFoundException('Item tidak ditemukan');
    return data;
  }

  // ─── Manual override ──────────────────────────────────────
  async overrideItem(clinic_id: string, period_id: string, item_id: string, amount: number, reason: string) {
    await this.getPeriod(clinic_id, period_id);
    const { data } = await this.sb.from('payroll_items')
      .update({ override_amount: amount, override_reason: reason })
      .eq('id', item_id).eq('payroll_period_id', period_id).select().single();
    return data;
  }

  // ─── Doctor summary (for dashboard) ──────────────────────
  async getDoctorSummary(clinic_id: string, doctor_id: string, year: number) {
    const { data: items } = await this.sb
      .from('payroll_items')
      .select('*, period:payroll_periods!inner(period_start, period_end, status)')
      .eq('doctor_id', doctor_id)
      .filter('payroll_periods.clinic_id', 'eq', clinic_id);

    const monthly = (items ?? []).map((i) => ({
      month: (i.period as any).period_start,
      revenue: i.total_revenue,
      amount:  i.override_amount ?? i.doctor_amount,
      status:  i.status,
    }));

    return {
      doctor_id,
      year,
      total_revenue: monthly.reduce((s, m) => s + m.revenue, 0),
      total_earned:  monthly.reduce((s, m) => s + m.amount, 0),
      monthly,
    };
  }
}
