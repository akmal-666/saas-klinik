'use client';

import { useEffect, useRef } from 'react';
import {
  X, Clock, Calendar, User, Stethoscope, FileText,
  Activity, ChevronRight, Loader2, AlertCircle,
  CheckCircle2, ArrowRightCircle, RotateCcw, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentStatus } from '@klinik/shared-types';
import { APPOINTMENT_STATUS_FLOW } from '@klinik/shared-constants';
import { cn, formatDateId, getAge, formatRupiah, STATUS_CONFIG } from '@/lib/utils';
import { useAppointment, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Props {
  id: string;
  onClose: () => void;
}

// Status action configs with icons
const STATUS_ACTION_CONFIG: Partial<Record<AppointmentStatus, {
  label: string; icon: React.ElementType; variant: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}>> = {
  [AppointmentStatus.BOOKED]:     { label:'Konfirmasi',  icon:CheckCircle2,    variant:'primary' },
  [AppointmentStatus.CONFIRMED]:  { label:'Notifikasi',  icon:ArrowRightCircle,variant:'default' },
  [AppointmentStatus.NOTIFIED]:   { label:'Set Waiting', icon:Clock,           variant:'warning' },
  [AppointmentStatus.WAITING]:    { label:'Mulai Konsul',icon:Activity,        variant:'success' },
  [AppointmentStatus.ENGAGED]:    { label:'Selesai',     icon:CheckCircle2,    variant:'success' },
  [AppointmentStatus.RESCHEDULE]: { label:'Buka Kembali',icon:RotateCcw,       variant:'default' },
  [AppointmentStatus.CANCEL]:     { label:'Aktifkan',    icon:RotateCcw,       variant:'default' },
};

export function AppointmentDetailDrawer({ id, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { data: appt, isLoading, error } = useAppointment(id);
  const updateStatus = useUpdateAppointmentStatus();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Status diubah ke ${STATUS_CONFIG[newStatus].label}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Gagal mengubah status');
    }
  };

  const allowedNext = appt ? APPOINTMENT_STATUS_FLOW[appt.status as AppointmentStatus] : [];

  // Get the primary next action (first in flow)
  const primaryNext = allowedNext.find((s) =>
    ![AppointmentStatus.CANCEL, AppointmentStatus.RESCHEDULE].includes(s)
  );
  const primaryCfg = primaryNext ? STATUS_ACTION_CONFIG[primaryNext] : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[190] bg-[#0f1d35]/30 backdrop-blur-[1px]" onClick={onClose} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 z-[195] w-[420px] bg-white shadow-[−8px_0_32px_rgba(0,0,0,.12)] flex flex-col"
        style={{ boxShadow: '-8px 0 32px rgba(0,0,0,.12)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="text-[14px] font-bold text-[#0f1d35]">Detail Appointment</div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <DrawerSkeleton />
          ) : error || !appt ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
              <AlertCircle size={24} />
              <span className="text-sm">Data tidak ditemukan</span>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-5">

              {/* Status + primary action */}
              <div className="flex items-center justify-between">
                <StatusBadge status={appt.status as AppointmentStatus} dot size="md" />
                {primaryNext && primaryCfg && (
                  <button
                    onClick={() => handleStatusChange(primaryNext)}
                    disabled={updateStatus.isPending}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      primaryCfg.variant === 'success' && 'bg-emerald-600 text-white hover:bg-emerald-700',
                      primaryCfg.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                      primaryCfg.variant === 'warning' && 'bg-amber-500 text-white hover:bg-amber-600',
                      primaryCfg.variant === 'default' && 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {updateStatus.isPending
                      ? <Loader2 size={12} className="animate-spin" />
                      : <primaryCfg.icon size={12} />}
                    {primaryCfg.label}
                  </button>
                )}
              </div>

              {/* Patient card */}
              <SectionCard title="Pasien" icon={User}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0f1d35] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                    {appt.patient?.full_name?.split(' ').slice(0, 2).map((n) => n[0]).join('') ?? '?'}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#0f1d35]">{appt.patient?.full_name ?? '—'}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {appt.patient?.rm_number ?? '—'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {appt.patient?.date_of_birth ? getAge(appt.patient.date_of_birth) : '?'} thn
                        {' · '}
                        {appt.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </div>
                    {appt.patient?.allergy && appt.patient.allergy !== '-' && (
                      <div className="mt-1 inline-flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded border border-red-200">
                        <AlertCircle size={9} />
                        Alergi: {appt.patient.allergy}
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Schedule card */}
              <SectionCard title="Jadwal" icon={Calendar}>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Tanggal" value={formatDateId(appt.scheduled_date)} icon={Calendar} />
                  <InfoItem label="Jam" value={`${appt.scheduled_time} WIB`} icon={Clock} />
                  <InfoItem label="Durasi" value={`${appt.duration_minutes} menit`} icon={Clock} />
                  <InfoItem label="Sumber" value={{ walk_in:'Walk In', online:'Online', phone:'Telepon' }[appt.source] ?? appt.source} icon={User} />
                </div>
              </SectionCard>

              {/* Doctor card */}
              <SectionCard title="Dokter" icon={Stethoscope}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-gray-800">{appt.doctor?.name ?? '—'}</div>
                    <div className="text-[10px] text-gray-400">{appt.doctor?.specialization ?? ''}</div>
                  </div>
                </div>
              </SectionCard>

              {/* Treatments */}
              {appt.treatments && appt.treatments.length > 0 && (
                <SectionCard title="Tindakan / Treatment" icon={Activity}>
                  <div className="flex flex-col gap-2">
                    {appt.treatments.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-[12px] font-medium text-gray-800">{t.name}</div>
                          <div className="text-[10px] text-gray-400">{t.duration_minutes} mnt · {t.category}</div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600">{formatRupiah(t.price)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-200">
                      <span className="text-xs font-semibold text-gray-500">Estimasi Total</span>
                      <span className="text-[13px] font-bold text-blue-600">
                        {formatRupiah(appt.treatments.reduce((s, t) => s + t.price, 0))}
                      </span>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Notes */}
              {appt.notes && (
                <SectionCard title="Catatan" icon={FileText}>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{appt.notes}</p>
                </SectionCard>
              )}

              {/* All status actions */}
              {allowedNext.length > 0 && (
                <SectionCard title="Ubah Status" icon={ArrowRightCircle}>
                  <div className="flex flex-wrap gap-2">
                    {allowedNext.map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={updateStatus.isPending}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all disabled:opacity-50',
                            cfg.bg, cfg.text, cfg.border,
                            'hover:opacity-80',
                          )}
                        >
                          → {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* Meta */}
              <div className="text-[10px] text-gray-300 text-center pb-2">
                ID: {appt.id.substring(0, 8)}... · Dibuat {formatDateId(appt.created_at)}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {appt && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <button
              className="flex-1 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              onClick={onClose}
            >
              Tutup
            </button>
            <button className="flex-1 py-2 text-xs font-medium rounded-lg bg-[#0f1d35] text-white hover:bg-[#1a2d4a] flex items-center justify-center gap-1.5">
              <FileText size={12} />
              Buka EMR
            </button>
            <button className="flex-1 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-1.5">
              <ChevronRight size={12} />
              Kasir
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Section card ─────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-[10px] overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <Icon size={13} className="text-blue-500" />
        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ─── Info item ────────────────────────────────────────────
function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <Icon size={11} className="text-gray-300 flex-shrink-0" />
        <span className="text-[12px] font-semibold text-gray-800">{value}</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function DrawerSkeleton() {
  return (
    <div className="p-5 flex flex-col gap-4 animate-pulse">
      {[80, 120, 100, 140].map((h, i) => (
        <div key={i} className="bg-gray-100 rounded-[10px]" style={{ height: h }} />
      ))}
    </div>
  );
}
