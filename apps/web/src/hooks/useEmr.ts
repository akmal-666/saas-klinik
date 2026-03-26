import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Icd10Item, Icd9Item } from '@klinik/shared-constants';

export const emrKeys = {
  all:        ['emr'] as const,
  lists:      () => [...emrKeys.all, 'list'] as const,
  list:       (p: object) => [...emrKeys.lists(), p] as const,
  detail:     (id: string) => [...emrKeys.all, 'detail', id] as const,
  history:    (pid: string) => [...emrKeys.all, 'history', pid] as const,
  icd10:      (q: string) => [...emrKeys.all, 'icd10', q] as const,
  icd9:       (q: string) => [...emrKeys.all, 'icd9', q] as const,
};

// ─── Patient history (left panel) ────────────────────────
export function usePatientHistory(patientId: string | null) {
  return useQuery({
    queryKey: emrKeys.history(patientId ?? ''),
    queryFn: async () => {
      const { data } = await api.get(`/emr/patients/${patientId}/history`);
      return data.data;
    },
    enabled: !!patientId,
    staleTime: 30_000,
  });
}

// ─── Single EMR detail ────────────────────────────────────
export function useEmrDetail(id: string | null) {
  return useQuery({
    queryKey: emrKeys.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await api.get(`/emr/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ─── ICD-10 search ───────────────────────────────────────
export function useIcd10Search(query: string) {
  return useQuery({
    queryKey: emrKeys.icd10(query),
    queryFn: async (): Promise<Icd10Item[]> => {
      const { data } = await api.get('/emr/icd10/search', { params: { q: query } });
      return data.data;
    },
    staleTime: 5 * 60_000, // ICD codes are static
    placeholderData: (prev) => prev,
  });
}

// ─── ICD-9 search ────────────────────────────────────────
export function useIcd9Search(query: string) {
  return useQuery({
    queryKey: emrKeys.icd9(query),
    queryFn: async (): Promise<Icd9Item[]> => {
      const { data } = await api.get('/emr/icd9/search', { params: { q: query } });
      return data.data;
    },
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

// ─── Create EMR ──────────────────────────────────────────
export function useCreateEmr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/emr', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: emrKeys.lists() });
    },
  });
}

// ─── Update EMR ──────────────────────────────────────────
export function useUpdateEmr(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.patch(`/emr/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: emrKeys.detail(id) });
    },
  });
}

// ─── Sign consent ─────────────────────────────────────────
export function useSignConsent(emrId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { signature_data: string; signer_name?: string }) => {
      const { data } = await api.post(`/emr/${emrId}/consent`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: emrKeys.detail(emrId) });
    },
  });
}
