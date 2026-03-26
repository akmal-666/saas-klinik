import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';

@Injectable()
export class ReportsService {
  constructor(@Inject(SUPABASE_ADMIN) private readonly sb: SupabaseClient) {}

  async getRevenueReport(clinic_id: string, date_from: string, date_to: string, doctor_id?: string) {
    let q = this.sb.from('invoices')
      .select('id, total, status, created_at, patient_id, emr:emr_records!inner(doctor_id)')
      .eq('clinic_id', clinic_id).eq('status', 'paid')
      .gte('created_at', `${date_from}T00:00:00`)
      .lte('created_at', `${date_to}T23:59:59`);
    if (doctor_id) q = q.eq('emr_records.doctor_id', doctor_id);
    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);

    const totalRevenue = (data ?? []).reduce((s, i) => s + i.total, 0);

    // Group by day
    const byDay: Record<string, number> = {};
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

  async getVisitReport(clinic_id: string, date_from: string, date_to: string) {
    const { data: appts } = await this.sb.from('appointments')
      .select('id, status, patient_id, doctor_id, scheduled_date, source')
      .eq('clinic_id', clinic_id)
      .gte('scheduled_date', date_from)
      .lte('scheduled_date', date_to);

    const completed = (appts ?? []).filter(a => a.status === 'completed');
    const cancelled = (appts ?? []).filter(a => a.status === 'cancel');
    const uniquePatients = new Set((appts ?? []).map(a => a.patient_id));

    // New patients (first visit in range)
    const { data: newPatients } = await this.sb.from('patients')
      .select('id').eq('clinic_id', clinic_id)
      .gte('created_at', `${date_from}T00:00:00`)
      .lte('created_at', `${date_to}T23:59:59`);

    return {
      date_from, date_to,
      total_appointments: appts?.length ?? 0,
      total_completed:    completed.length,
      total_cancelled:    cancelled.length,
      total_unique_patients: uniquePatients.size,
      new_patients:       newPatients?.length ?? 0,
      returning_patients: uniquePatients.size - (newPatients?.length ?? 0),
      completion_rate:    appts?.length ? Math.round((completed.length / appts.length) * 100) : 0,
      cancel_rate:        appts?.length ? Math.round((cancelled.length / appts.length) * 100) : 0,
    };
  }

  async getDailySummary(clinic_id: string, date: string) {
    const [appts, invoices, payments, emrs] = await Promise.all([
      this.sb.from('appointments').select('id,status').eq('clinic_id', clinic_id).eq('scheduled_date', date),
      this.sb.from('invoices').select('id,total,status').eq('clinic_id', clinic_id).gte('created_at',`${date}T00:00:00`).lte('created_at',`${date}T23:59:59`),
      this.sb.from('payments').select('method,amount').eq('clinic_id', clinic_id).gte('paid_at',`${date}T00:00:00`).lte('paid_at',`${date}T23:59:59`),
      this.sb.from('emr_records').select('id').eq('clinic_id', clinic_id).eq('visit_date', date),
    ]);

    const totalRevenue = (payments.data ?? []).reduce((s, p) => s + p.amount, 0);
    const byMethod = (payments.data ?? []).reduce<Record<string,number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amount; return acc;
    }, {});

    return {
      date,
      appointments: {
        total:     appts.data?.length ?? 0,
        completed: appts.data?.filter(a=>a.status==='completed').length ?? 0,
        cancelled: appts.data?.filter(a=>a.status==='cancel').length ?? 0,
        waiting:   appts.data?.filter(a=>['waiting','engaged'].includes(a.status)).length ?? 0,
      },
      revenue: {
        total:    totalRevenue,
        by_method: byMethod,
        invoices: invoices.data?.length ?? 0,
      },
      emr_count: emrs.data?.length ?? 0,
    };
  }
}
