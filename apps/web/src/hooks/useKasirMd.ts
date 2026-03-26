import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';

// ══════════════════════════════════════════════
// KASIR HOOKS
// ══════════════════════════════════════════════

export const kasirKeys = {
  invoices:      (p: object) => ['kasir', 'invoices', p],
  invoice:       (id: string) => ['kasir', 'invoice', id],
  daily:         (date: string) => ['kasir', 'daily', date],
  deposit:       (pid: string) => ['kasir', 'deposit', pid],
};

export function useInvoices(params: object) {
  return useQuery({ queryKey: kasirKeys.invoices(params), queryFn: async () => { const { data } = await api.get('/kasir/invoices', { params }); return data; }, staleTime: 30_000 });
}
export function useInvoice(id: string | null) {
  return useQuery({ queryKey: kasirKeys.invoice(id ?? ''), queryFn: async () => { const { data } = await api.get(`/kasir/invoices/${id}`); return data.data; }, enabled: !!id });
}
export function useDailySummary(date?: string) {
  const d = date ?? format(new Date(), 'yyyy-MM-dd');
  return useQuery({ queryKey: kasirKeys.daily(d), queryFn: async () => { const { data } = await api.get('/kasir/invoices/daily-summary', { params: { date: d } }); return data.data; }, staleTime: 60_000 });
}
export function useDepositHistory(patientId: string | null) {
  return useQuery({ queryKey: kasirKeys.deposit(patientId ?? ''), queryFn: async () => { const { data } = await api.get(`/kasir/deposits/${patientId}`); return data.data; }, enabled: !!patientId });
}
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: any) => { const { data } = await api.post('/kasir/invoices', dto); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['kasir'] }) });
}
export function useAddPayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: any) => { const { data } = await api.post(`/kasir/invoices/${invoiceId}/payments`, dto); return data.data; }, onSuccess: () => { qc.invalidateQueries({ queryKey: kasirKeys.invoice(invoiceId) }); qc.invalidateQueries({ queryKey: ['kasir'] }); } });
}
export function useApplyVoucher(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (code: string) => { const { data } = await api.post(`/kasir/invoices/${invoiceId}/voucher`, { code }); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: kasirKeys.invoice(invoiceId) }) });
}
export function useTopUpDeposit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: any) => { const { data } = await api.post('/kasir/deposits/topup', dto); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['kasir', 'deposit'] }) });
}

// ══════════════════════════════════════════════
// MASTER DATA HOOKS
// ══════════════════════════════════════════════

export const mdKeys = {
  patients:   (p: object) => ['md', 'patients', p],
  doctors:    () => ['md', 'doctors'],
  treatments: (cat?: string) => ['md', 'treatments', cat ?? 'all'],
  insurances: () => ['md', 'insurances'],
  shareCodes: () => ['md', 'share-codes'],
  promos:     () => ['md', 'promos'],
};

export function useDoctors() {
  return useQuery({ queryKey: mdKeys.doctors(), queryFn: async () => { const { data } = await api.get('/doctors?full=1'); return data.data ?? []; }, staleTime: 5 * 60_000 });
}
export function useTreatments(category?: string) {
  return useQuery({ queryKey: mdKeys.treatments(category), queryFn: async () => { const { data } = await api.get('/treatments', { params: { category } }); return data.data ?? []; }, staleTime: 5 * 60_000 });
}
export function usePatients(params: object) {
  return useQuery({ queryKey: mdKeys.patients(params), queryFn: async () => { const { data } = await api.get('/patients', { params }); return data; }, staleTime: 30_000 });
}
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: any) => { const { data } = await api.post('/patients', dto); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['md', 'patients'] }) });
}
export function useCreateTreatment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: any) => { const { data } = await api.post('/treatments', dto); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['md', 'treatments'] }) });
}
export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: any) => { const { data } = await api.post('/doctors', dto); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: ['md', 'doctors'] }) });
}

// ══════════════════════════════════════════════
// PAYROLL HOOKS
// ══════════════════════════════════════════════

export const payrollKeys = {
  periods:  () => ['payroll', 'periods'],
  period:   (id: string) => ['payroll', 'period', id],
  summary:  (docId: string) => ['payroll', 'summary', docId],
};

export function usePayrollPeriods() {
  return useQuery({ queryKey: payrollKeys.periods(), queryFn: async () => { const { data } = await api.get('/payroll/periods'); return data.data ?? []; } });
}
export function usePayrollPeriod(id: string | null) {
  return useQuery({ queryKey: payrollKeys.period(id ?? ''), queryFn: async () => { const { data } = await api.get(`/payroll/periods/${id}`); return data.data; }, enabled: !!id });
}
export function useCalculatePayroll() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (dto: { period_start: string; period_end: string }) => { const { data } = await api.post('/payroll/periods/calculate', dto); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.periods() }) });
}
export function useApprovePayroll() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (id: string) => { const { data } = await api.patch(`/payroll/periods/${id}/approve`); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.periods() }) });
}
export function useMarkPayrollPaid() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async ({ periodId, itemId }: { periodId: string; itemId: string }) => { const { data } = await api.patch(`/payroll/periods/${periodId}/items/${itemId}/paid`); return data.data; }, onSuccess: () => qc.invalidateQueries({ queryKey: payrollKeys.periods() }) });
}

// ══════════════════════════════════════════════
// REPORT HOOKS
// ══════════════════════════════════════════════

export function useReportRevenue(params: { date_from: string; date_to: string; doctor_id?: string }) {
  return useQuery({
    queryKey: ['report', 'revenue', params],
    queryFn: async () => {
      // In prod: call /api/v1/reports/revenue
      // For now return mock aggregated data
      return {
        total_revenue: 128_500_000,
        total_invoices: 312,
        total_patients: 198,
        new_patients: 87,
        returning_patients: 111,
        avg_per_visit: 411_218,
        by_day: Array.from({ length: 23 }, (_, i) => ({
          date: `2026-03-${String(i + 1).padStart(2, '0')}`,
          revenue: Math.floor(Math.random() * 8_000_000) + 2_000_000,
          visits: Math.floor(Math.random() * 20) + 5,
        })),
        by_doctor: [
          { name: 'drg Christine Hendriono', revenue: 42_000_000, visits: 98 },
          { name: 'drg Andrew Laurent',      revenue: 31_500_000, visits: 67 },
          { name: 'drg Jody Thia',           revenue: 28_000_000, visits: 72 },
          { name: 'drg Nurvita Titi',        revenue: 19_000_000, visits: 55 },
          { name: 'drg Rontgen Audy',        revenue: 8_000_000,  visits: 20 },
        ],
        top_treatments: [
          { name: 'Scaling & Polishing',          count: 87, revenue: 24_360_000 },
          { name: 'Tambal Komposit Posterior',     count: 64, revenue: 28_800_000 },
          { name: 'Kontrol Behel',                 count: 52, revenue: 13_000_000 },
          { name: 'Pencabutan Gigi Permanen',      count: 38, revenue:  9_500_000 },
          { name: 'Rontgen Panoramik',             count: 31, revenue:  7_750_000 },
          { name: 'PSA (Perawatan Saluran Akar)',  count: 24, revenue: 18_000_000 },
        ],
      };
    },
    staleTime: 5 * 60_000,
  });
}
