'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Calendar, Clock, User, Stethoscope, FileText, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentStatus } from '@klinik/shared-types';
import { TIME_SLOTS } from '@klinik/shared-constants';
import { cn, formatRupiah } from '@/lib/utils';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { MultiSelect, MultiSelectOption } from '@/components/ui/MultiSelect';

// ─── Validation schema ────────────────────────────────────
const schema = z.object({
  patient_id:       z.string().min(1, 'Pilih pasien'),
  doctor_id:        z.string().min(1, 'Pilih dokter'),
  scheduled_date:   z.string().min(1, 'Pilih tanggal'),
  scheduled_time:   z.string().min(1, 'Pilih jam'),
  duration_minutes: z.number().min(15).max(180),
  treatment_ids:    z.array(z.string()).min(1, 'Pilih minimal 1 tindakan'),
  status:           z.nativeEnum(AppointmentStatus),
  notes:            z.string().optional(),
  source:           z.enum(['walk_in', 'online', 'phone']),
});

type FormValues = z.infer<typeof schema>;

// ─── Mock data (replaced by API queries in prod) ──────────
const MOCK_PATIENTS = [
  { id: 'p1', label: 'Rizky Aditya Pratama',   rm: 'RM-20260323-00001' },
  { id: 'p2', label: 'Dewi Santoso Putri',      rm: 'RM-20260323-00002' },
  { id: 'p3', label: 'Budi Laksono',            rm: 'RM-20260323-00003' },
  { id: 'p4', label: 'Indah Permatasari',       rm: 'RM-20260323-00004' },
  { id: 'p5', label: 'Hendra Wijaya',           rm: 'RM-20260323-00005' },
  { id: 'p6', label: 'Sari Rahayu Wulandari',  rm: 'RM-20260323-00006' },
];

const MOCK_DOCTORS = [
  { id: 'd1', label: 'drg Christine Hendriono Sp.KG', spec: 'Konservasi' },
  { id: 'd2', label: 'drg Andrew Laurent Sp.Ort',     spec: 'Ortodonsi' },
  { id: 'd3', label: 'drg Jody Thia',                 spec: 'Bedah Mulut' },
  { id: 'd4', label: 'drg Nurvita Titi Ikawati Sp.KG',spec: 'Periodonsi' },
  { id: 'd5', label: 'drg Rontgen Audy',               spec: 'Radiologi' },
];

const MOCK_TREATMENTS: MultiSelectOption[] = [
  { id:'tr1',  group:'Konservasi',   label:'Tambal Gigi Komposit Anterior',   sublabel:'45 mnt', meta:'Rp 350.000' },
  { id:'tr2',  group:'Konservasi',   label:'Tambal Gigi Komposit Posterior',  sublabel:'60 mnt', meta:'Rp 450.000' },
  { id:'tr3',  group:'Konservasi',   label:'Perawatan Saluran Akar (PSA)',    sublabel:'90 mnt', meta:'Rp 750.000' },
  { id:'tr4',  group:'Konservasi',   label:'Inlay / Onlay Keramik',           sublabel:'120 mnt',meta:'Rp 1.200.000' },
  { id:'tr5',  group:'Periodonsi',   label:'Scaling & Polishing',             sublabel:'60 mnt', meta:'Rp 280.000' },
  { id:'tr6',  group:'Periodonsi',   label:'Kuretase Periodontal',            sublabel:'90 mnt', meta:'Rp 650.000' },
  { id:'tr7',  group:'Periodonsi',   label:'Gingivektomi',                    sublabel:'120 mnt',meta:'Rp 850.000' },
  { id:'tr8',  group:'Ortodonsi',    label:'Pasang Behel Metal',              sublabel:'90 mnt', meta:'Rp 4.500.000' },
  { id:'tr9',  group:'Ortodonsi',    label:'Kontrol Behel',                   sublabel:'30 mnt', meta:'Rp 250.000' },
  { id:'tr10', group:'Ortodonsi',    label:'Lepas Behel & Retainer',          sublabel:'60 mnt', meta:'Rp 1.200.000' },
  { id:'tr11', group:'Bedah Mulut',  label:'Pencabutan Gigi Susu',            sublabel:'20 mnt', meta:'Rp 120.000' },
  { id:'tr12', group:'Bedah Mulut',  label:'Pencabutan Gigi Permanen',        sublabel:'30 mnt', meta:'Rp 250.000' },
  { id:'tr13', group:'Bedah Mulut',  label:'Odontektomi (Wisdom Tooth)',      sublabel:'120 mnt',meta:'Rp 1.500.000' },
  { id:'tr14', group:'Estetik',      label:'Bleaching / Whitening',           sublabel:'90 mnt', meta:'Rp 1.800.000' },
  { id:'tr15', group:'Estetik',      label:'Veneer Keramik',                  sublabel:'120 mnt',meta:'Rp 2.500.000' },
  { id:'tr16', group:'Radiologi',    label:'Rontgen Periapikal',              sublabel:'10 mnt', meta:'Rp 80.000' },
  { id:'tr17', group:'Radiologi',    label:'Rontgen Panoramik',               sublabel:'15 mnt', meta:'Rp 250.000' },
];

// ─── Props ────────────────────────────────────────────────
interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  defaultStatus?: AppointmentStatus;
  defaultDoctorId?: string;
  defaultTime?: string;
  defaultDate?: string;
}

// ─── Field wrapper ────────────────────────────────────────
function Field({
  label, required, error, children, icon: Icon,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 tracking-wide">
        {Icon && <Icon size={12} className="text-gray-400" />}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────
export function AppointmentModal({
  open, onClose,
  defaultStatus = AppointmentStatus.BOOKED,
  defaultDoctorId = '',
  defaultTime = '',
  defaultDate = new Date().toISOString().split('T')[0],
}: AppointmentModalProps) {
  const create = useCreateAppointment();

  const {
    register, control, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id:       '',
      doctor_id:        defaultDoctorId,
      scheduled_date:   defaultDate,
      scheduled_time:   defaultTime || '09:00',
      duration_minutes: 30,
      treatment_ids:    [],
      status:           defaultStatus,
      notes:            '',
      source:           'walk_in',
    },
  });

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      reset({
        patient_id:       '',
        doctor_id:        defaultDoctorId,
        scheduled_date:   defaultDate,
        scheduled_time:   defaultTime || '09:00',
        duration_minutes: 30,
        treatment_ids:    [],
        status:           defaultStatus,
        notes:            '',
        source:           'walk_in',
      });
    }
  }, [open, defaultDoctorId, defaultTime, defaultDate, defaultStatus, reset]);

  // Calculate total from selected treatments
  const selectedTreatments = watch('treatment_ids');
  const total = selectedTreatments.reduce((sum, id) => {
    const tr = MOCK_TREATMENTS.find((t) => t.id === id);
    if (!tr?.meta) return sum;
    return sum + parseInt(tr.meta.replace(/\D/g, ''), 10);
  }, 0);

  const onSubmit = async (values: FormValues) => {
    try {
      await create.mutateAsync(values);
      toast.success('Appointment berhasil dibuat');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Gagal membuat appointment');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f1d35]/50 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[12px] w-[580px] max-h-[92vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,.22)]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="text-[14px] font-bold text-[#0f1d35]">
              {defaultStatus === AppointmentStatus.PREBOOK ? 'Tambah Pre-book Appointment' : 'Tambah Appointment'}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Isi data jadwal pasien</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-5 flex flex-col gap-4">

            {/* Pasien */}
            <Field label="Pasien" required icon={User} error={errors.patient_id?.message}>
              <div className="relative">
                <Controller
                  name="patient_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={cn(
                        'w-full appearance-none border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white pr-8',
                        errors.patient_id ? 'border-red-300' : 'border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.07)]',
                      )}
                    >
                      <option value="">-- Pilih atau cari pasien --</option>
                      {MOCK_PATIENTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label} ({p.rm})
                        </option>
                      ))}
                    </select>
                  )}
                />
                <User size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            {/* Tanggal + Jam */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal" required icon={Calendar} error={errors.scheduled_date?.message}>
                <input
                  {...register('scheduled_date')}
                  type="date"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.07)] transition-all"
                />
              </Field>
              <Field label="Jam" required icon={Clock} error={errors.scheduled_time?.message}>
                <Controller
                  name="scheduled_time"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.07)] transition-all bg-white"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t} WIB</option>
                      ))}
                    </select>
                  )}
                />
              </Field>
            </div>

            {/* Dokter */}
            <Field label="Dokter" required icon={Stethoscope} error={errors.doctor_id?.message}>
              <Controller
                name="doctor_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {MOCK_DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label} — {d.spec}
                      </option>
                    ))}
                  </select>
                )}
              />
            </Field>

            {/* Treatment multi-select */}
            <Field label="Tindakan / Treatment" required icon={Activity} error={errors.treatment_ids?.message}>
              <Controller
                name="treatment_ids"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={MOCK_TREATMENTS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih satu atau beberapa tindakan..."
                    searchPlaceholder="Cari tindakan..."
                  />
                )}
              />
              {/* Selected treatment summary */}
              {selectedTreatments.length > 0 && (
                <div className="mt-1 space-y-1">
                  {MOCK_TREATMENTS.filter((t) => selectedTreatments.includes(t.id)).map((t) => (
                    <div key={t.id} className="flex justify-between items-center px-2.5 py-1.5 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-[12px] font-medium text-gray-800">{t.label}</span>
                        <span className="text-[10px] text-gray-400 ml-2">{t.sublabel}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600">{t.meta}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-2.5 py-1.5 border-t border-dashed border-gray-200 mt-1">
                    <span className="text-xs font-semibold text-gray-600">Estimasi Total</span>
                    <span className="text-[13px] font-bold text-blue-600">{formatRupiah(total)}</span>
                  </div>
                </div>
              )}
            </Field>

            {/* Status awal + Durasi */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status Awal" error={errors.status?.message}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all bg-white"
                    >
                      <option value={AppointmentStatus.BOOKED}>Book</option>
                      <option value={AppointmentStatus.PREBOOK}>Pre-Book</option>
                    </select>
                  )}
                />
              </Field>
              <Field label="Durasi (menit)" error={errors.duration_minutes?.message}>
                <Controller
                  name="duration_minutes"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all bg-white"
                    >
                      {[15, 30, 45, 60, 90, 120].map((d) => (
                        <option key={d} value={d}>{d} menit</option>
                      ))}
                    </select>
                  )}
                />
              </Field>
            </div>

            {/* Source */}
            <Field label="Sumber Booking" error={errors.source?.message}>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {([
                      ['walk_in', 'Walk In'],
                      ['phone', 'Telepon'],
                      ['online', 'Online'],
                    ] as const).map(([val, lbl]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => field.onChange(val)}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-medium border transition-all',
                          field.value === val
                            ? 'bg-[#0f1d35] text-white border-[#0f1d35]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                        )}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

            {/* Notes */}
            <Field label="Catatan untuk Dokter" icon={FileText}>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Keluhan pasien, catatan khusus untuk dokter..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
            <div className="text-[11px] text-gray-400">
              {selectedTreatments.length > 0 && (
                <span>Total estimasi: <strong className="text-blue-600">{formatRupiah(total)}</strong></span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Simpan Appointment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
