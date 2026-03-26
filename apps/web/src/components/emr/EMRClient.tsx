'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search, Plus, FileText, Activity, Camera, ChevronRight,
  User, Heart, Brain, Save, Download, ArrowLeft,
  Clock, Calendar, AlertCircle, Check, Loader2,
  Stethoscope, ClipboardList, X, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

import { cn, formatDateId, getAge, formatRupiah } from '@/lib/utils';
import { ICD10_DENTAL, ICD9_DENTAL } from '@klinik/shared-constants';
import { Icd10Select, Icd9Select } from './IcdSelect';
import { ConsentPad } from './ConsentPad';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppointmentStatus } from '@klinik/shared-types';

// ─── Mock data ────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id:'p1', rm:'RM-20260323-00001', name:'Rizky Aditya Pratama',   dob:'1992-05-14', gender:'L', phone:'08211234567', allergy:'Penisilin', blood:'O+', insurance:'BPJS' },
  { id:'p2', rm:'RM-20260323-00002', name:'Dewi Santoso Putri',     dob:'1988-11-22', gender:'P', phone:'08221234568', allergy:null, blood:'A+', insurance:null },
  { id:'p3', rm:'RM-20260323-00003', name:'Budi Laksono',           dob:'1975-03-08', gender:'L', phone:'08231234569', allergy:'NSAID', blood:'B-', insurance:'Allianz' },
  { id:'p4', rm:'RM-20260323-00004', name:'Indah Permatasari',      dob:'1995-07-30', gender:'P', phone:'08241234570', allergy:null, blood:'AB+', insurance:null },
  { id:'p5', rm:'RM-20260323-00005', name:'Hendra Wijaya',          dob:'1983-12-01', gender:'L', phone:'08251234571', allergy:null, blood:'O-', insurance:'BPJS' },
  { id:'p6', rm:'RM-20260323-00006', name:'Sari Rahayu Wulandari',  dob:'1997-04-18', gender:'P', phone:'08261234572', allergy:'Sulfa', blood:'A-', insurance:null },
  { id:'p7', rm:'RM-20220220-00007', name:'Ahmad Fauzi',            dob:'1970-09-25', gender:'L', phone:'08271234573', allergy:null, blood:'B+', insurance:'AXA Mandiri' },
  { id:'p8', rm:'RM-20260115-00008', name:'Rina Marlina',           dob:'2001-06-12', gender:'P', phone:'08281234574', allergy:null, blood:'O+', insurance:null },
];

const MOCK_DOCTORS = [
  { id:'d1', name:'drg Christine Hendriono Sp.KG', spec:'Konservasi Gigi' },
  { id:'d2', name:'drg Andrew Laurent Sp.Ort',     spec:'Ortodonti' },
  { id:'d3', name:'drg Jody Thia',                 spec:'Bedah Mulut' },
  { id:'d4', name:'drg Nurvita Titi Ikawati Sp.KG',spec:'Periodonsi' },
  { id:'d5', name:'drg Rontgen Audy',               spec:'Radiologi' },
];

const MOCK_TREATMENTS_SELECT = [
  { id:'tr1', cat:'Konservasi', name:'Tambal Gigi Komposit Anterior',  price:350000 },
  { id:'tr2', cat:'Konservasi', name:'Tambal Gigi Komposit Posterior', price:450000 },
  { id:'tr3', cat:'Konservasi', name:'Perawatan Saluran Akar (PSA)',   price:750000 },
  { id:'tr5', cat:'Periodonsi', name:'Scaling & Polishing',            price:280000 },
  { id:'tr8', cat:'Ortodonsi',  name:'Pasang Behel Metal',             price:4500000 },
  { id:'tr9', cat:'Ortodonsi',  name:'Kontrol Behel',                  price:250000 },
  { id:'tr11',cat:'Bedah',      name:'Pencabutan Gigi Susu',           price:120000 },
  { id:'tr12',cat:'Bedah',      name:'Pencabutan Gigi Permanen',       price:250000 },
  { id:'tr13',cat:'Bedah',      name:'Odontektomi (Wisdom Tooth)',     price:1500000 },
  { id:'tr14',cat:'Estetik',    name:'Bleaching / Whitening',          price:1800000 },
  { id:'tr16',cat:'Radiologi',  name:'Rontgen Periapikal',             price:80000 },
  { id:'tr17',cat:'Radiologi',  name:'Rontgen Panoramik',              price:250000 },
];

const MOCK_VISITS = [
  { id:'e1', date:'2026-03-23', doctor:'drg Christine Hendriono', icd10:['K02.1','K04.01'], status:'synced', summary:'Tambal komposit gigi 11, rontgen periapikal' },
  { id:'e2', date:'2026-02-10', doctor:'drg Nurvita Titi Ikawati',icd10:['Z29.0'],          status:'synced', summary:'Scaling & polishing, fluoride' },
  { id:'e3', date:'2025-11-05', doctor:'drg Christine Hendriono', icd10:['K04.5'],           status:'synced', summary:'PSA gigi 16 kunjungan pertama' },
];

// ─── Form schema ──────────────────────────────────────────
const emrSchema = z.object({
  doctor_id:    z.string().min(1, 'Pilih dokter'),
  visit_date:   z.string().min(1),
  soap_s:       z.string().min(1, 'Subjective wajib diisi'),
  soap_o:       z.string().min(1, 'Objective wajib diisi'),
  soap_a:       z.string().min(1, 'Assessment wajib diisi'),
  soap_p:       z.string().min(1, 'Plan wajib diisi'),
  bp:           z.string().optional(),
  pulse:        z.string().optional(),
  rr:           z.string().optional(),
  temp:         z.string().optional(),
  icd10_codes:  z.array(z.string()),
  icd9_codes:   z.array(z.string()),
  treatment_ids:z.array(z.string()),
  notes:        z.string().optional(),
});

type EmrForm = z.infer<typeof emrSchema>;

// ─── SOAP label config ────────────────────────────────────
const SOAP_CONFIG = [
  { key:'soap_s' as const, letter:'S', label:'Subjective', sublabel:'Keluhan utama dan riwayat penyakit pasien', rows:3,
    placeholder:'Pasien mengeluhkan nyeri pada gigi kanan atas sejak 3 hari lalu. Nyeri berdenyut, lebih sakit saat minum dingin...' },
  { key:'soap_o' as const, letter:'O', label:'Objective', sublabel:'Hasil pemeriksaan klinis', rows:3,
    placeholder:'Gigi 16 karies media. Tes vitalitas (+), perkusi (-), tekanan (-). Gingiva: kemerahan ringan. Radiografi: gambaran radiolusen periapikal minimal...' },
  { key:'soap_a' as const, letter:'A', label:'Assessment', sublabel:'Diagnosis klinis', rows:2,
    placeholder:'Karies media gigi 16 disertai pulpitis reversibel. K02.1 + K04.01' },
  { key:'soap_p' as const, letter:'P', label:'Plan', sublabel:'Rencana tindakan dan perawatan', rows:2,
    placeholder:'1. Penambalan komposit resin kelas II\n2. Rontgen periapikal kontrol\n3. Edukasi kebersihan mulut\n4. Recall 6 bulan' },
];

// ─── Section header ───────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color = 'blue' }: {
  icon: React.ElementType; title: string; subtitle?: string;
  color?: 'blue'|'teal'|'purple'|'amber'|'green'|'rose';
}) {
  const colors = {
    blue:   'text-blue-500 bg-blue-50 border-blue-100',
    teal:   'text-teal-500 bg-teal-50 border-teal-100',
    purple: 'text-purple-500 bg-purple-50 border-purple-100',
    amber:  'text-amber-500 bg-amber-50 border-amber-100',
    green:  'text-green-500 bg-green-50 border-green-100',
    rose:   'text-rose-500 bg-rose-50 border-rose-100',
  };
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center border', colors[color])}>
        <Icon size={14} />
      </div>
      <div>
        <div className="text-[13px] font-bold text-[#0f1d35]">{title}</div>
        {subtitle && <div className="text-[10px] text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
}

// ─── Form section wrapper ────────────────────────────────
function FormSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-[10px] p-5 mb-4', className)}>
      {children}
    </div>
  );
}

// ─── Main EMR Client ──────────────────────────────────────
export function EMRClient() {
  const [searchQ, setSearchQ]         = useState('');
  const [selectedPatientId, setPatient] = useState<string | null>('p1');
  const [selectedVisitId, setVisit]   = useState<string | null>('e1');
  const [mode, setMode]               = useState<'view' | 'new'>('view');
  const [consentSigned, setConsent]   = useState(false);
  const [beforeImg, setBeforeImg]     = useState<string | null>(null);
  const [afterImg, setAfterImg]       = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef  = useRef<HTMLInputElement>(null);

  const patient = MOCK_PATIENTS.find((p) => p.id === selectedPatientId);
  const visit   = MOCK_VISITS.find((v) => v.id === selectedVisitId);
  const filteredPatients = MOCK_PATIENTS.filter((p) =>
    !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.rm.toLowerCase().includes(searchQ.toLowerCase()),
  );

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<EmrForm>({
    resolver: zodResolver(emrSchema),
    defaultValues: {
      doctor_id: 'd1',
      visit_date: format(new Date(), 'yyyy-MM-dd'),
      soap_s: '', soap_o: '', soap_a: '', soap_p: '',
      bp: '', pulse: '', rr: '', temp: '',
      icd10_codes: [], icd9_codes: [], treatment_ids: [],
      notes: '',
    },
  });

  const watchedTreatments = watch('treatment_ids');
  const watchedIcd10      = watch('icd10_codes');

  const handleImageUpload = useCallback((file: File, type: 'before'|'after') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'before') setBeforeImg(e.target?.result as string);
      else setAfterImg(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const onSubmit = async (data: EmrForm) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    toast.success('EMR berhasil disimpan dan antrian SATUSEHAT aktif');
    setMode('view');
  };

  const selectedDoctor = MOCK_DOCTORS.find((d) => d.id === watch('doctor_id'));
  const totalTreatment = watchedTreatments.reduce((s, id) => {
    return s + (MOCK_TREATMENTS_SELECT.find((t) => t.id === id)?.price ?? 0);
  }, 0);

  return (
    <div className="flex h-[calc(100vh-54px)] overflow-hidden">

      {/* ── LEFT PANEL: Patient list + visit history ──── */}
      <div className="w-[240px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Search size={12} className="text-gray-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Cari pasien / RM..."
              className="text-xs bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
            Pasien ({filteredPatients.length})
          </div>
          {filteredPatients.map((p) => {
            const active = selectedPatientId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => { setPatient(p.id); setVisit(MOCK_VISITS[0]?.id ?? null); setMode('view'); }}
                className={cn(
                  'px-3 py-2.5 cursor-pointer border-l-2 transition-all border-b border-gray-50',
                  active ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent hover:bg-gray-50',
                )}
              >
                <div className={cn('text-[12px] font-semibold truncate', active ? 'text-blue-700' : 'text-gray-800')}>
                  {p.name}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <span className="font-mono">{p.rm}</span>
                  {p.allergy && <span className="text-red-400">⚠ Alergi</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* New EMR button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => { setMode('new'); setVisit(null); reset(); setBeforeImg(null); setAfterImg(null); setConsent(false); }}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus size={13} />
            Buat EMR Baru
          </button>
        </div>
      </div>

      {/* ── MIDDLE PANEL: Visit history ──────────────── */}
      {selectedPatientId && (
        <div className="w-[200px] bg-[#fafafa] border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Patient mini card */}
          {patient && (
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full bg-[#0f1d35] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                  {patient.name.split(' ').slice(0,2).map((n)=>n[0]).join('')}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-800 leading-tight">{patient.name.split(' ').slice(0,2).join(' ')}</div>
                  <div className="text-[9px] text-gray-400">{patient.rm}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{getAge(patient.dob)} thn</span>
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{patient.blood}</span>
                {patient.allergy && <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded font-medium">Alergi: {patient.allergy}</span>}
                {patient.insurance && <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">{patient.insurance}</span>}
              </div>
            </div>
          )}

          {/* Visit list */}
          <div className="px-3 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Riwayat Kunjungan ({MOCK_VISITS.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_VISITS.map((v) => {
              const active = selectedVisitId === v.id && mode === 'view';
              return (
                <div
                  key={v.id}
                  onClick={() => { setVisit(v.id); setMode('view'); }}
                  className={cn(
                    'px-3 py-2.5 cursor-pointer border-b border-gray-100 transition-all',
                    active ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-white',
                  )}
                >
                  <div className="text-[11px] font-semibold text-gray-800">{formatDateId(v.date)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{v.doctor.split(' ').slice(0,3).join(' ')}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {v.icd10.slice(0,2).map((c) => (
                      <span key={c} className="font-mono text-[9px] bg-blue-50 border border-blue-100 text-blue-600 px-1 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                  {v.status === 'synced' && (
                    <div className="flex items-center gap-0.5 mt-1 text-[9px] text-green-500">
                      <Check size={8} />SATUSEHAT
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── RIGHT PANEL: EMR Form ──────────────────── */}
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9]">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Page header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-0.5">
                <span>EMR</span><ChevronRight size={10} />
                <span className="text-gray-700 font-semibold">{patient?.name ?? '—'}</span>
                {mode === 'new' && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">Kunjungan Baru</span>}
              </div>
              <div className="text-[13px] font-bold text-[#0f1d35]">
                {mode === 'new' ? 'Rekam Medis — Kunjungan Baru' : visit ? `Kunjungan ${formatDateId(visit.date)}` : 'Rekam Medis'}
              </div>
            </div>
            <div className="flex gap-2">
              {mode === 'view' && (
                <>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                    <Download size={12} />Export PDF
                  </button>
                  <button type="button" onClick={() => setMode('new')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    <Plus size={12} />Kunjungan Baru
                  </button>
                </>
              )}
              {mode === 'new' && (
                <>
                  <button type="button" onClick={() => setMode('view')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                    <ArrowLeft size={12} />Batal
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Simpan EMR
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 max-w-4xl mx-auto">

            {/* ── View mode: show existing EMR summary ── */}
            {mode === 'view' && visit && (
              <div className="space-y-4">
                <FormSection>
                  <SectionHeader icon={FileText} title="Ringkasan Kunjungan" color="blue" />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[['Tanggal', formatDateId(visit.date)],['Dokter', visit.doctor],['Diagnosis', visit.icd10.join(', ')],['Status SATUSEHAT','Synced ✓']].map(([l,v])=>(
                      <div key={l}>
                        <div className="text-[10px] text-gray-400 font-medium mb-0.5">{l}</div>
                        <div className="text-[12px] text-gray-800 font-medium">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-[11px] text-gray-600">{visit.summary}</div>
                </FormSection>
                <div className="text-center py-6 text-gray-400 text-sm">
                  <FileText size={28} className="mx-auto mb-2 opacity-30" />
                  Detail lengkap EMR tersimpan di server.<br/>
                  <button type="button" onClick={() => setMode('new')} className="mt-3 text-blue-500 text-xs hover:underline">
                    Buat kunjungan baru untuk pasien ini →
                  </button>
                </div>
              </div>
            )}

            {/* ── New EMR form ── */}
            {mode === 'new' && (
              <>
                {/* Header info */}
                <FormSection>
                  <SectionHeader icon={User} title="Informasi Kunjungan" color="blue" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Dokter <span className="text-red-400">*</span></label>
                      <select {...register('doctor_id')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 bg-white appearance-none">
                        {MOCK_DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Tanggal Kunjungan <span className="text-red-400">*</span></label>
                      <input {...register('visit_date')} type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400" />
                    </div>
                  </div>
                </FormSection>

                {/* Vitals */}
                <FormSection>
                  <SectionHeader icon={Heart} title="Tanda Vital" subtitle="Isi jika tersedia — semua opsional" color="rose" />
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { f:'bp' as const,    label:'Tekanan Darah', unit:'mmHg',  ph:'120/80' },
                      { f:'pulse' as const, label:'Nadi',          unit:'x/mnt', ph:'80' },
                      { f:'rr' as const,    label:'Respirasi',     unit:'x/mnt', ph:'18' },
                      { f:'temp' as const,  label:'Suhu',          unit:'°C',    ph:'36.5' },
                    ].map(({ f, label, unit, ph }) => (
                      <div key={f}>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                        <div className="relative">
                          <input {...register(f)} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-rose-400 pr-10" />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* SOAP Notes */}
                <FormSection>
                  <SectionHeader icon={ClipboardList} title="SOAP Notes" subtitle="Catatan klinis terstruktur" color="purple" />
                  <div className="space-y-4">
                    {SOAP_CONFIG.map(({ key, letter, label, sublabel, rows, placeholder }) => (
                      <div key={key}>
                        <label className="flex items-center gap-2 mb-1.5">
                          <span className="w-5 h-5 rounded bg-purple-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{letter}</span>
                          <span className="text-[12px] font-semibold text-gray-700">{label}</span>
                          <span className="text-[10px] text-gray-400">— {sublabel}</span>
                          {['soap_s','soap_o','soap_a','soap_p'].includes(key) && <span className="text-red-400 text-[10px]">*</span>}
                        </label>
                        <textarea
                          {...register(key)}
                          rows={rows}
                          placeholder={placeholder}
                          className={cn(
                            'w-full border rounded-lg px-3 py-2 text-xs outline-none transition-all resize-none placeholder:text-gray-300 leading-relaxed',
                            errors[key] ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-purple-400',
                          )}
                        />
                        {errors[key] && <span className="text-[10px] text-red-500 mt-0.5 block">{(errors[key] as any).message}</span>}
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* ICD-10 */}
                <FormSection>
                  <SectionHeader icon={Brain} title="Diagnosis — ICD-10" subtitle="Standar Kemenkes RI · Chapter K00-K14, S, Z" color="blue" />
                  <div className="mb-2">
                    <Controller
                      name="icd10_codes"
                      control={control}
                      render={({ field }) => (
                        <Icd10Select value={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                  {/* Selected codes display */}
                  {watchedIcd10.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {watchedIcd10.map((code) => {
                        const item = ICD10_DENTAL.find((i) => i.code === code);
                        if (!item) return null;
                        return (
                          <div key={code} className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <span className="font-mono text-[11px] font-bold text-blue-700 flex-shrink-0">{item.code}</span>
                            <span className="text-[11px] text-gray-700 flex-1">{item.description}</span>
                            <span className="text-[9px] text-gray-400">{item.category}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ICD-9 */}
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity size={13} className="text-teal-500" />
                      <span className="text-[13px] font-bold text-[#0f1d35]">Tindakan — ICD-9-CM</span>
                      <span className="text-[10px] text-gray-400">Prosedur yang dilakukan</span>
                    </div>
                    <Controller
                      name="icd9_codes"
                      control={control}
                      render={({ field }) => (
                        <Icd9Select value={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                </FormSection>

                {/* Treatment */}
                <FormSection>
                  <SectionHeader icon={Stethoscope} title="Treatment / Tindakan Klinis" subtitle="Treatment yang dilakukan pada kunjungan ini" color="teal" />
                  <div className="grid grid-cols-2 gap-2">
                    {MOCK_TREATMENTS_SELECT.map((t) => {
                      const sel = watchedTreatments.includes(t.id);
                      return (
                        <Controller
                          key={t.id}
                          name="treatment_ids"
                          control={control}
                          render={({ field }) => (
                            <div
                              onClick={() => field.onChange(sel ? field.value.filter((v)=>v!==t.id) : [...field.value,t.id])}
                              className={cn(
                                'flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all',
                                sel ? 'bg-teal-50 border-teal-300' : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50',
                              )}
                            >
                              <div className={cn('w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0',
                                sel ? 'bg-teal-600 border-teal-600' : 'border-gray-300')}>
                                {sel && <Check size={9} strokeWidth={2.5} className="text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-medium text-gray-800 truncate">{t.name}</div>
                                <div className="text-[9px] text-gray-400">{t.cat}</div>
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-600 flex-shrink-0">{formatRupiah(t.price)}</span>
                            </div>
                          )}
                        />
                      );
                    })}
                  </div>
                  {watchedTreatments.length > 0 && (
                    <div className="mt-3 flex justify-between items-center px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <span className="text-xs font-semibold text-gray-600">Estimasi Total</span>
                      <span className="text-[13px] font-bold text-emerald-600">{formatRupiah(totalTreatment)}</span>
                    </div>
                  )}
                </FormSection>

                {/* Before / After Photos */}
                <FormSection>
                  <SectionHeader icon={Camera} title="Foto Before / After" subtitle="Upload foto kondisi sebelum dan sesudah tindakan" color="amber" />
                  <div className="grid grid-cols-2 gap-4">
                    {(['before','after'] as const).map((type) => {
                      const img = type === 'before' ? beforeImg : afterImg;
                      const ref = type === 'before' ? beforeRef : afterRef;
                      return (
                        <div key={type}>
                          <div className={cn(
                            'border-2 border-dashed rounded-[10px] overflow-hidden transition-all cursor-pointer',
                            img ? 'border-gray-200' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30',
                          )} onClick={() => ref.current?.click()}>
                            {img ? (
                              <div className="relative">
                                <img src={img} alt={type} className="w-full h-36 object-cover" />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); type === 'before' ? setBeforeImg(null) : setAfterImg(null); }}
                                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ) : (
                              <div className="h-36 flex flex-col items-center justify-center gap-2">
                                <Upload size={20} className="text-gray-300" />
                                <span className="text-[11px] text-gray-400">Upload foto {type === 'before' ? 'SEBELUM' : 'SESUDAH'}</span>
                                <span className="text-[10px] text-gray-300">JPG, PNG, HEIC · max 5MB</span>
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            {type === 'before' ? 'Before' : 'After'}
                          </div>
                          <input
                            ref={ref}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, type); }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </FormSection>

                {/* Catatan */}
                <FormSection>
                  <SectionHeader icon={FileText} title="Catatan Tambahan" color="green" />
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Catatan klinis, instruksi pasca tindakan, resep obat, observasi khusus..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-green-400 transition-all resize-none placeholder:text-gray-300 leading-relaxed"
                  />
                </FormSection>

                {/* Informed Consent */}
                <FormSection>
                  <ConsentPad
                    clinicName="Audy Dental Muara Karang"
                    doctorName={selectedDoctor?.name}
                    patientName={patient?.name}
                    treatments={watchedTreatments.map((id) => MOCK_TREATMENTS_SELECT.find((t) => t.id === id)?.name ?? '')}
                    signed={consentSigned}
                    onSigned={(sig) => {
                      setConsent(true);
                      toast.success('Informed consent berhasil ditandatangani');
                    }}
                    onClear={() => setConsent(false)}
                  />
                </FormSection>

                {/* Save bar */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between -mx-6 mt-0">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      {watchedIcd10.length > 0 ? <Check size={12} className="text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      ICD-10 ({watchedIcd10.length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      {consentSigned ? <Check size={12} className="text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      Consent {consentSigned ? '✓' : '—'}
                    </span>
                    {totalTreatment > 0 && (
                      <span className="font-semibold text-emerald-600">{formatRupiah(totalTreatment)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setMode('view')} className="px-4 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                      Batal
                    </button>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      Simpan & Kirim ke SATUSEHAT
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
