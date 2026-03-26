'use client';

import { useState, useCallback } from 'react';
import { addDays, subDays, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  Plus, RefreshCw, Grid, List, ChevronLeft,
  ChevronRight, Calendar, Search, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn, STATUS_CONFIG, formatDateId, getInitials } from '@/lib/utils';
import { TIME_SLOTS } from '@klinik/shared-constants';
import { AppointmentStatus } from '@klinik/shared-types';
import type { AppointmentWithRelations, Doctor } from '@klinik/shared-types';

import {
  useAppointments,
  useUpdateAppointmentStatus,
  AppointmentParams,
} from '@/hooks/useAppointments';

import { AppointmentModal } from './AppointmentModal';
import { AppointmentDetailDrawer } from './AppointmentDetailDrawer';
import { StatusBadge } from '../ui/StatusBadge';

// ─── Mock doctors (replaced by real API query in production) ─
const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'drg Christine Hendriono Sp.KG', specialization: 'Konservasi' } as Doctor,
  { id: 'd2', name: 'drg Andrew Laurent Sp.Ort',     specialization: 'Ortodonsi' } as Doctor,
  { id: 'd3', name: 'drg Jody Thia',                 specialization: 'Bedah Mulut' } as Doctor,
  { id: 'd4', name: 'drg Nurvita Titi Ikawati Sp.KG',specialization: 'Periodonsi' } as Doctor,
  { id: 'd5', name: 'drg Rontgen Audy',               specialization: 'Radiologi' } as Doctor,
];

// ─── Status legend ────────────────────────────────────────
const LEGEND_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.PREBOOK, AppointmentStatus.BOOKED, AppointmentStatus.WAITING,
  AppointmentStatus.NOTIFIED, AppointmentStatus.CONFIRMED, AppointmentStatus.ENGAGED,
  AppointmentStatus.COMPLETED, AppointmentStatus.RESCHEDULE, AppointmentStatus.CANCEL,
];

export function AppointmentClient() {
  const [date, setDate]           = useState(new Date());
  const [view, setView]           = useState<'calendar' | 'list'>('calendar');
  const [doctorFilter, setDoctor] = useState('');
  const [searchQ, setSearchQ]     = useState('');
  const [createOpen, setCreate]   = useState(false);
  const [createType, setCreateType] = useState<AppointmentStatus>(AppointmentStatus.BOOKED);
  const [prefillDoctor, setPrefillDoctor] = useState('');
  const [prefillTime, setPrefillTime]     = useState('');
  const [selectedId, setSelectedId]       = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const params: AppointmentParams = {
    date: dateStr,
    ...(doctorFilter && { doctor_id: doctorFilter }),
    view,
    limit: 200,
  };

  const { data, isLoading, refetch } = useAppointments(params);
  const updateStatus = useUpdateAppointmentStatus();

  const appointments = data?.data ?? [];

  // ─── Filter by search ───────────────────────────────────
  const filtered = searchQ
    ? appointments.filter((a) =>
        a.patient?.full_name.toLowerCase().includes(searchQ.toLowerCase()) ||
        a.patient?.rm_number.toLowerCase().includes(searchQ.toLowerCase()),
      )
    : appointments;

  // ─── Slot click → open create modal ─────────────────────
  const onSlotClick = useCallback((doctorId: string, time: string) => {
    setPrefillDoctor(doctorId);
    setPrefillTime(time);
    setCreateType(AppointmentStatus.BOOKED);
    setCreate(true);
  }, []);

  // ─── Header date display ─────────────────────────────────
  const dateLabel = format(date, 'd MMM yyyy', { locale: localeId });

  return (
    <div className="p-6">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1">
            <span>Appointment</span>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-semibold">List Appointment</span>
          </div>
          <h1 className="text-[19px] font-bold text-[#0f1d35]">List Appointment</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Lihat dan kelola jadwal appointment</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-1.5 px-3 py-[7px] text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            onClick={() => { /* navigate to add patient */ }}
          >
            <Plus size={13} />
            Tambah Data Pasien
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-[7px] text-xs font-medium rounded-lg bg-[#0f1d35] text-white hover:bg-[#1a2d4a]"
            onClick={() => { setCreateType(AppointmentStatus.PREBOOK); setCreate(true); }}
          >
            <Plus size={13} />
            Tambah Pre-book
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-[7px] text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => { setCreateType(AppointmentStatus.BOOKED); setCreate(true); }}
          >
            <Plus size={13} />
            Tambah Appointment
          </button>
        </div>
      </div>

      {/* ── Calendar toolbar ─────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
        {/* Date navigator */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setDate(subDays(date, 1))}
            className="w-[30px] h-[30px] flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="px-3 text-[13px] font-semibold text-[#0f1d35] border-x border-gray-200 h-[30px] flex items-center">
            {dateLabel}
          </span>
          <button
            onClick={() => setDate(addDays(date, 1))}
            className="w-[30px] h-[30px] flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        <button
          onClick={() => setDate(new Date())}
          className="h-[30px] px-3 text-xs font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Hari Ini
        </button>

        {/* Patient search */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 h-[30px] w-44">
          <Search size={12} className="text-gray-400" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari Pasien"
            className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder:text-gray-400"
          />
        </div>

        {/* Doctor filter */}
        <div className="relative">
          <select
            value={doctorFilter}
            onChange={(e) => setDoctor(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg h-[30px] pl-2.5 pr-7 text-xs text-gray-700 outline-none cursor-pointer w-48"
          >
            <option value="">Semua Dokter</option>
            {MOCK_DOCTORS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Calendar date picker icon */}
        <button className="w-[30px] h-[30px] bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Calendar size={13} />
        </button>

        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {(['calendar', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'flex items-center gap-1.5 px-3 h-[30px] text-xs transition-all',
                view === v
                  ? 'bg-[#0f1d35] text-white'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {v === 'calendar' ? <Grid size={12} /> : <List size={12} />}
              {v === 'calendar' ? 'Calendar view' : 'List View'}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => { refetch(); toast.success('Calendar diperbarui'); }}
          className="flex items-center gap-1.5 h-[30px] px-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={12} />
          Refresh Calendar
        </button>
      </div>

      {/* ── Status legend ────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {LEGEND_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <span
              key={s}
              className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-medium border', cfg.bg, cfg.text, cfg.border)}
            >
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* ── Calendar / List view ─────────────────────────── */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : view === 'calendar' ? (
        <CalendarGrid
          doctors={MOCK_DOCTORS}
          appointments={filtered}
          currentDate={date}
          onSlotClick={onSlotClick}
          onAppointmentClick={(id) => setSelectedId(id)}
        />
      ) : (
        <ListView
          appointments={filtered}
          onDetailClick={(id) => setSelectedId(id)}
        />
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      <AppointmentModal
        open={createOpen}
        onClose={() => setCreate(false)}
        defaultStatus={createType}
        defaultDoctorId={prefillDoctor}
        defaultTime={prefillTime}
        defaultDate={dateStr}
      />

      {selectedId && (
        <AppointmentDetailDrawer
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CALENDAR GRID
// ─────────────────────────────────────────────────────────

interface CalendarGridProps {
  doctors: Doctor[];
  appointments: AppointmentWithRelations[];
  currentDate: Date;
  onSlotClick: (doctorId: string, time: string) => void;
  onAppointmentClick: (id: string) => void;
}

function CalendarGrid({ doctors, appointments, currentDate, onSlotClick, onAppointmentClick }: CalendarGridProps) {
  // Build a lookup: doctorId+time → appointment
  const lookup = new Map<string, AppointmentWithRelations>();
  appointments.forEach((a) => {
    lookup.set(`${a.doctor_id}|${a.scheduled_time}`, a);
  });

  const dow = currentDate.getDay();

  // Approx available hours per doctor based on schedule
  const isAvailable = (doctorIdx: number, time: string): boolean => {
    const [h] = time.split(':').map(Number);
    // Simulate schedule data — in prod this comes from doctor_schedules join
    return h >= 8 && h < 17;
  };

  const colTemplate = `80px repeat(${doctors.length}, 1fr)`;

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 310px)' }}>
        <div style={{ minWidth: 900 }}>
          {/* Header row */}
          <div
            className="grid border-b-2 border-gray-200 sticky top-0 z-10 bg-white"
            style={{ gridTemplateColumns: colTemplate }}
          >
            <div className="px-3 py-2.5 text-[10px] text-gray-400 bg-white" />
            {doctors.map((d) => (
              <div
                key={d.id}
                className="px-3 py-2.5 text-[11px] font-semibold text-gray-700 border-r border-gray-200 bg-[#f8fafc] last:border-r-0"
              >
                {d.name}
              </div>
            ))}
          </div>

          {/* Time rows */}
          {TIME_SLOTS.map((time) => (
            <div
              key={time}
              className="grid border-b border-[#f1f5f9] last:border-b-0"
              style={{ gridTemplateColumns: colTemplate }}
            >
              {/* Time label */}
              <div className="px-2.5 py-2 text-[10px] text-gray-400 font-medium border-r border-gray-200 bg-[#fafafa] flex items-start justify-end pt-2.5 tracking-tight">
                {time} WIB
              </div>

              {/* Slots per doctor */}
              {doctors.map((d, di) => {
                const appt = lookup.get(`${d.id}|${time}`);
                const avail = isAvailable(di, time);

                return (
                  <div
                    key={d.id}
                    className={cn(
                      'border-r border-[#f1f5f9] last:border-r-0 relative h-[46px] transition-colors',
                      appt
                        ? 'cursor-pointer'
                        : avail
                          ? 'cursor-pointer hover:bg-[#f8fafc]'
                          : 'cursor-not-allowed',
                      !avail && !appt && 'bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,#f1f5f9_6px,#f1f5f9_8px)]',
                    )}
                    style={
                      !avail && !appt
                        ? { backgroundImage: 'repeating-linear-gradient(135deg,transparent,transparent 6px,#f1f5f9 6px,#f1f5f9 8px)' }
                        : undefined
                    }
                    onClick={() => {
                      if (appt) onAppointmentClick(appt.id);
                      else if (avail) onSlotClick(d.id, time);
                    }}
                  >
                    {appt && <AppointmentChip appointment={appt} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppointmentChip({ appointment: a }: { appointment: AppointmentWithRelations }) {
  const cfg = STATUS_CONFIG[a.status as AppointmentStatus];
  return (
    <div
      className={cn(
        'absolute inset-[2px_3px] rounded-[5px] px-2 py-1 flex flex-col justify-center border overflow-hidden',
        cfg.bg, cfg.border,
      )}
    >
      <div className={cn('text-[10px] font-semibold truncate', cfg.text)}>
        {a.patient?.full_name ?? '—'}
      </div>
      <div className={cn('text-[9px] opacity-70', cfg.text)}>
        {a.scheduled_time}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────────────────────

function ListView({
  appointments,
  onDetailClick,
}: {
  appointments: AppointmentWithRelations[];
  onDetailClick: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-gray-200 bg-[#fafafa]">
              {['No','Waktu','Pasien','No. RM','Dokter','Treatment','Status','Aksi'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                  Belum ada appointment untuk tanggal ini
                </td>
              </tr>
            )}
            {appointments
              .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
              .map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-[#f1f5f9] hover:bg-[#fafeff] transition-colors"
                >
                  <td className="px-3 py-2.5 text-[11px] text-gray-400">{i + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="text-xs font-semibold text-gray-900">{a.scheduled_time}</div>
                    <div className="text-[10px] text-gray-400">{a.duration_minutes} mnt</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-xs font-semibold text-gray-900">{a.patient?.full_name ?? '—'}</div>
                    <div className="text-[10px] text-gray-400">{a.patient?.phone ?? ''}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[11px] text-gray-600">{a.patient?.rm_number ?? '—'}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-700">{a.doctor?.name ?? '—'}</td>
                  <td className="px-3 py-2.5 max-w-[160px]">
                    <div className="text-xs text-gray-700 truncate" title={a.treatments?.map((t) => t.name).join(', ')}>
                      {a.treatments?.map((t) => t.name).join(', ') || '—'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={a.status as AppointmentStatus} />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => onDetailClick(a.id)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden animate-pulse">
      <div className="h-10 bg-gray-100 border-b border-gray-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex border-b border-[#f1f5f9]">
          <div className="w-20 h-12 bg-gray-50 border-r border-gray-200" />
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="flex-1 h-12 bg-white border-r border-[#f1f5f9]" />
          ))}
        </div>
      ))}
    </div>
  );
}
