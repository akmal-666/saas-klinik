import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInYears } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { AppointmentStatus } from '@klinik/shared-types';

// ─── Tailwind class merge ─────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ─────────────────────────────────────────────
export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// ─── Date ─────────────────────────────────────────────────
export function formatDateId(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM yyyy', { locale: localeId });
}

export function formatDateTimeId(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMM yyyy, HH:mm', { locale: localeId });
}

export function getAge(dob: string): number {
  return differenceInYears(new Date(), parseISO(dob));
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// ─── Status utilities ─────────────────────────────────────
type StatusConfig = {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
};

export const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  [AppointmentStatus.PREBOOK]:    { label:'Pre-Booked', bg:'bg-sky-50',    text:'text-sky-700',    border:'border-sky-200',    dot:'bg-sky-500' },
  [AppointmentStatus.BOOKED]:     { label:'Booked',     bg:'bg-blue-50',   text:'text-blue-700',   border:'border-blue-200',   dot:'bg-blue-500' },
  [AppointmentStatus.CONFIRMED]:  { label:'Confirmed',  bg:'bg-teal-50',   text:'text-teal-700',   border:'border-teal-200',   dot:'bg-teal-500' },
  [AppointmentStatus.NOTIFIED]:   { label:'Notified',   bg:'bg-amber-50',  text:'text-amber-700',  border:'border-amber-200',  dot:'bg-amber-500' },
  [AppointmentStatus.WAITING]:    { label:'Waiting',    bg:'bg-orange-50', text:'text-orange-700', border:'border-orange-200', dot:'bg-orange-500' },
  [AppointmentStatus.ENGAGED]:    { label:'Engaged',    bg:'bg-green-50',  text:'text-green-700',  border:'border-green-200',  dot:'bg-green-500' },
  [AppointmentStatus.COMPLETED]:  { label:'Completed',  bg:'bg-slate-50',  text:'text-slate-600',  border:'border-slate-200',  dot:'bg-slate-400' },
  [AppointmentStatus.RESCHEDULE]: { label:'Reschedule', bg:'bg-violet-50', text:'text-violet-700', border:'border-violet-200', dot:'bg-violet-500' },
  [AppointmentStatus.CANCEL]:     { label:'Cancel',     bg:'bg-red-50',    text:'text-red-700',    border:'border-red-200',    dot:'bg-red-500' },
};

export function getStatusConfig(status: AppointmentStatus): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG[AppointmentStatus.BOOKED];
}

// ─── Time slot helpers ────────────────────────────────────
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Initials ─────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}
