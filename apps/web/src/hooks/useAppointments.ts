import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Appointment, AppointmentWithRelations,
  AppointmentStatus, ApiResponse, PaginationMeta,
} from '@klinik/shared-types';

// ─── Query Keys ───────────────────────────────────────────
export const appointmentKeys = {
  all:     ['appointments'] as const,
  lists:   () => [...appointmentKeys.all, 'list'] as const,
  list:    (params: AppointmentParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail:  (id: string) => [...appointmentKeys.details(), id] as const,
  summary: () => [...appointmentKeys.all, 'today-summary'] as const,
};

// ─── Types ────────────────────────────────────────────────
export interface AppointmentParams {
  date?: string;
  doctor_id?: string;
  patient_id?: string;
  status?: AppointmentStatus;
  view?: 'calendar' | 'list';
  cursor?: string;
  limit?: number;
}

interface AppointmentListResponse {
  data: AppointmentWithRelations[];
  meta: PaginationMeta;
}

// ─── Hooks ────────────────────────────────────────────────

/** Fetch appointments (calendar or list) */
export function useAppointments(params: AppointmentParams) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: async (): Promise<AppointmentListResponse> => {
      const { data } = await api.get<ApiResponse<AppointmentWithRelations[]>>(
        '/appointments',
        { params },
      );
      return data as unknown as AppointmentListResponse;
    },
    staleTime: 30_000, // 30s — calendar is near-realtime
    refetchInterval: 60_000, // auto-refresh every 1min
  });
}

/** Fetch single appointment */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async (): Promise<AppointmentWithRelations> => {
      const { data } = await api.get<ApiResponse<AppointmentWithRelations>>(
        `/appointments/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/** Today's appointment count per status */
export function useTodaySummary() {
  return useQuery({
    queryKey: appointmentKeys.summary(),
    queryFn: async (): Promise<Record<AppointmentStatus, number>> => {
      const { data } = await api.get('/appointments/today/summary');
      return data.data;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

// ─── Mutations ────────────────────────────────────────────

export interface CreateAppointmentInput {
  patient_id: string;
  doctor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes?: number;
  treatment_ids: string[];
  status?: AppointmentStatus;
  notes?: string;
  source?: 'walk_in' | 'online' | 'phone';
}

/** Create appointment */
export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAppointmentInput): Promise<Appointment> => {
      const { data } = await api.post<ApiResponse<Appointment>>('/appointments', input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
      qc.invalidateQueries({ queryKey: appointmentKeys.summary() });
    },
  });
}

/** Update appointment status */
export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, status, notes,
    }: { id: string; status: AppointmentStatus; notes?: string }): Promise<Appointment> => {
      const { data } = await api.patch<ApiResponse<Appointment>>(
        `/appointments/${id}/status`,
        { status, notes },
      );
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
      qc.invalidateQueries({ queryKey: appointmentKeys.summary() });
    },
  });
}

/** Reschedule appointment */
export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, scheduled_date, scheduled_time, reason,
    }: { id: string; scheduled_date: string; scheduled_time: string; reason?: string }) => {
      const { data } = await api.put<ApiResponse<Appointment>>(
        `/appointments/${id}/reschedule`,
        { scheduled_date, scheduled_time, reason },
      );
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/** Cancel appointment */
export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/appointments/${id}`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
      qc.invalidateQueries({ queryKey: appointmentKeys.summary() });
    },
  });
}
