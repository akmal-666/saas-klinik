'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, FileText, CreditCard, TrendingUp,
  Users, UserPlus, Clock, CheckCircle2, ArrowRight,
  Activity, Wifi, WifiOff, RefreshCw, AlertTriangle,
  Banknote, Stethoscope, Plus, ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn, formatRupiah, formatDateId, getAge } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { AppointmentStatus } from '@klinik/shared-types';
import { STATUS_CONFIG } from '@/lib/utils';

// ─── Mock real-time data ──────────────────────
const TODAY = '2026-03-23';
const QUEUE = [
  { id:'q1', name:'Rizky Aditya Pratama',  rm:'RM-20260323-00001', time:'09:00', doctor:'drg Christine Hendriono', treatment:'Tambal Komposit', status: AppointmentStatus.ENGAGED,   wait:0 },
  { id:'q2', name:'Dewi Santoso Putri',    rm:'RM-20260323-00002', time:'09:30', doctor:'drg Andrew Laurent',      treatment:'Kontrol Behel',    status: AppointmentStatus.WAITING,   wait:12 },
  { id:'q3', name:'Budi Laksono',          rm:'RM-20260323-00003', time:'10:00', doctor:'drg Jody Thia',           treatment:'Pencabutan',       status: AppointmentStatus.CONFIRMED, wait:28 },
  { id:'q4', name:'Indah Permatasari',     rm:'RM-20260323-00004', time:'10:30', doctor:'drg Nurvita Titi',        treatment:'Scaling',          status: AppointmentStatus.BOOKED,    wait:55 },
  { id:'q5', name:'Hendra Wijaya',         rm:'RM-20260323-00005', time:'11:00', doctor:'drg Christine Hendriono', treatment:'Tambal Komposit',  status: AppointmentStatus.BOOKED,    wait:80 },
  { id:'q6', name:'Sari Rahayu',           rm:'RM-20260323-00006', time:'11:30', doctor:'drg Andrew Laurent',      treatment:'Pasang Behel',     status: AppointmentStatus.PREBOOK,   wait:105 },
  { id:'q7', name:'Ahmad Fauzi',           rm:'RM-20220220-00007', time:'13:00', doctor:'drg Rontgen Audy',        treatment:'Panoramik',        status: AppointmentStatus.BOOKED,    wait:null },
];

const STATS = {
  appt_today:     7,
  appt_done:      1,
  appt_waiting:   2,
  revenue_today:  8_200_000,
  revenue_month:  128_500_000,
  patients_today: 7,
  new_patients:   2,
  doctors_active: 5,
  pending_invoice:1_750_000,
  satusehat_pending: 3,
};

const RECENT_INVOICES = [
  { id:'inv1', patient:'Rizky Aditya Pratama', amount:430_000,   status:'paid',    method:'Tunai',    time:'09:47' },
  { id:'inv2', patient:'Budi Laksono',         amount:250_000,   status:'paid',    method:'QRIS',     time:'08:30' },
  { id:'inv3', patient:'Dewi Santoso',         amount:280_000,   status:'partial', method:'Asuransi', time:'kemarin' },
];

const QUICK_ACTIONS = [
  { label:'Tambah Appointment', icon:Calendar,   color:'bg-blue-50 text-blue-600 border-blue-200',    href:'/appointment' },
  { label:'Buat EMR Baru',      icon:FileText,   color:'bg-purple-50 text-purple-600 border-purple-200', href:'/emr' },
  { label:'Buka Kasir',         icon:CreditCard, color:'bg-amber-50 text-amber-600 border-amber-200',  href:'/kasir' },
  { label:'Daftarkan Pasien',   icon:UserPlus,   color:'bg-green-50 text-green-600 border-green-200',  href:'/masterdata' },
];

export default function DashboardPage() {
  const router  = useRouter();
  const { user, clinic, isAuthenticated } = useAuthStore();

  // Redirect if not authenticated (e.g. direct URL access)
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const hasCookie = document.cookie.includes('klinik_access_token');
      if (!hasCookie) router.replace('/login');
    }
  }, [isAuthenticated, router]);
  const [time, setTime]  = useState(new Date());
  const [satuSehatOk, setSatuSehat] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const greeting = time.getHours() < 12 ? 'Selamat pagi' : time.getHours() < 17 ? 'Selamat siang' : 'Selamat sore';
  const dayLabel = format(time, "EEEE, d MMMM yyyy", { locale: localeId });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[11px] text-gray-400 mb-0.5">{dayLabel}</div>
          <h1 className="text-[20px] font-bold text-[#0f1d35]">{greeting}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn('w-1.5 h-1.5 rounded-full', satuSehatOk ? 'bg-green-500 animate-pulse' : 'bg-red-500')}/>
            <span className="text-[11px] text-gray-400">
              {satuSehatOk ? 'SATUSEHAT terhubung' : 'SATUSEHAT offline'}
              {STATS.satusehat_pending > 0 && ` · ${STATS.satusehat_pending} antrian sync`}
            </span>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50">
          <RefreshCw size={12}/>Refresh
        </button>
      </div>

      {/* ── KPI row ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:'Appointment Hari Ini', value: STATS.appt_today,         sub:`${STATS.appt_done} selesai · ${STATS.appt_waiting} waiting`, icon:Calendar,  color:'blue',   onClick:()=>router.push('/appointment') },
          { label:'Pendapatan Hari Ini',  value:formatRupiah(STATS.revenue_today), sub:`Total bulan: ${formatRupiah(STATS.revenue_month)}`,  icon:Banknote,  color:'green',  onClick:()=>router.push('/kasir') },
          { label:'Pasien Hari Ini',      value: STATS.patients_today,     sub:`${STATS.new_patients} pasien baru`,                          icon:Users,     color:'purple', onClick:()=>router.push('/emr') },
          { label:'Dokter Aktif',         value: STATS.doctors_active,     sub:'Hari ini',                                                   icon:Stethoscope,color:'amber', onClick:()=>router.push('/masterdata') },
        ].map(({ label, value, sub, icon:Icon, color, onClick }) => {
          const colors: Record<string,string> = {
            blue:   'bg-blue-50 text-blue-500 border-blue-100',
            green:  'bg-green-50 text-green-500 border-green-100',
            purple: 'bg-purple-50 text-purple-500 border-purple-100',
            amber:  'bg-amber-50 text-amber-500 border-amber-100',
          };
          return (
            <div key={label} onClick={onClick} className="bg-white border border-gray-200 rounded-[10px] p-4 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,.08)] hover:border-gray-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border', colors[color])}>
                  <Icon size={15}/>
                </div>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors"/>
              </div>
              <div className="text-[22px] font-black text-[#0f1d35] leading-none">{value}</div>
              <div className="text-[11px] text-gray-400 mt-1">{label}</div>
              <div className="text-[10px] text-gray-300 mt-0.5">{sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main grid ───────────────────────────── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Left 2/3 */}
        <div className="col-span-2 space-y-5">

          {/* Queue / waiting list */}
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                <span className="text-[13px] font-bold text-[#0f1d35]">Antrian Hari Ini</span>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{QUEUE.length}</span>
              </div>
              <button onClick={()=>router.push('/appointment')} className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium">
                Lihat semua<ChevronRight size={11}/>
              </button>
            </div>

            {/* Queue table */}
            <div className="divide-y divide-gray-50">
              {QUEUE.map((q, i) => {
                const cfg = STATUS_CONFIG[q.status];
                return (
                  <div key={q.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={()=>router.push('/appointment')}>
                    {/* Number */}
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0', i===0?'bg-[#0f1d35] text-white':'bg-gray-100 text-gray-500')}>
                      {i+1}
                    </div>
                    {/* Time */}
                    <div className="w-12 text-center flex-shrink-0">
                      <div className="text-[12px] font-bold text-gray-800">{q.time}</div>
                    </div>
                    {/* Patient */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-gray-900 truncate">{q.name}</div>
                      <div className="text-[10px] text-gray-400">{q.doctor.split(' ').slice(0,3).join(' ')} · {q.treatment}</div>
                    </div>
                    {/* Wait time */}
                    {q.wait !== null && q.wait > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 flex-shrink-0">
                        <Clock size={10}/>{q.wait} mnt
                      </div>
                    )}
                    {/* Status */}
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0', cfg.bg, cfg.text, cfg.border)}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending EMR SATUSEHAT */}
          {STATS.satusehat_pending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5"/>
              <div className="flex-1">
                <div className="text-[12px] font-bold text-amber-800">SATUSEHAT: {STATS.satusehat_pending} EMR menunggu sinkronisasi</div>
                <div className="text-[11px] text-amber-600 mt-0.5">Sync otomatis berjalan setiap 5 menit. Cek koneksi jika berlangsung lebih dari 30 menit.</div>
              </div>
              <button onClick={()=>router.push('/settings')} className="text-[11px] text-amber-700 font-semibold hover:underline flex-shrink-0">Lihat Settings</button>
            </div>
          )}

          {/* Recent invoices */}
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0f1d35]">Transaksi Terbaru</span>
              <button onClick={()=>router.push('/kasir')} className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 font-medium">
                Buka kasir<ChevronRight size={11}/>
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {RECENT_INVOICES.map((inv)=>(
                <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    inv.status==='paid'?'bg-green-50 text-green-500':'bg-amber-50 text-amber-500')}>
                    <CreditCard size={14}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-gray-800">{inv.patient}</div>
                    <div className="text-[10px] text-gray-400">{inv.method} · {inv.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-gray-800">{formatRupiah(inv.amount)}</div>
                    <span className={cn('text-[10px] font-semibold', inv.status==='paid'?'text-green-600':'text-amber-600')}>
                      {inv.status==='paid'?'Lunas':'Sebagian'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {STATS.pending_invoice > 0 && (
              <div className="px-5 py-2.5 bg-red-50 border-t border-red-100 flex justify-between text-[11px]">
                <span className="text-red-600 font-medium">Tagihan belum lunas</span>
                <span className="font-bold text-red-600">{formatRupiah(STATS.pending_invoice)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-5">

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-[#0f1d35]">Aksi Cepat</span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(({ label, icon:Icon, color, href })=>(
                <button
                  key={label}
                  onClick={()=>router.push(href)}
                  className={cn('flex flex-col items-center gap-2 p-3 rounded-lg border text-center hover:opacity-80 transition-all', color)}
                >
                  <Icon size={18}/>
                  <span className="text-[10px] font-semibold leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dokter on-duty */}
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#0f1d35]">Dokter Aktif Hari Ini</span>
              <span className="text-[10px] text-gray-400">{STATS.doctors_active} dokter</span>
            </div>
            <div className="p-3 space-y-2">
              {[
                { name:'drg Christine Hendriono', spec:'Konservasi', appt:3, engaged: true },
                { name:'drg Andrew Laurent',      spec:'Ortodonsi',  appt:2, engaged: false },
                { name:'drg Jody Thia',           spec:'Bedah',      appt:2, engaged: false },
                { name:'drg Nurvita Titi',        spec:'Periodonsi', appt:1, engaged: false },
                { name:'drg Rontgen Audy',        spec:'Radiologi',  appt:1, engaged: false },
              ].map((d)=>(
                <div key={d.name} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#0f1d35] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                    {d.name.split(' ').slice(1,3).map(n=>n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-gray-800 truncate">{d.name.split(' ').slice(0,3).join(' ')}</div>
                    <div className="text-[9px] text-gray-400">{d.spec}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] font-bold text-gray-700">{d.appt} appt</div>
                    {d.engaged && <div className="text-[9px] text-green-500 font-semibold">● Engaged</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue summary mini */}
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100">
              <span className="text-[13px] font-bold text-[#0f1d35]">Ringkasan Keuangan</span>
            </div>
            <div className="p-4 space-y-2.5">
              {[
                ['Total Invoice Hari Ini', formatRupiah(8_200_000), 'text-gray-800'],
                ['Sudah Dibayar',          formatRupiah(6_450_000), 'text-green-600'],
                ['Menunggu Pembayaran',    formatRupiah(1_750_000), 'text-amber-500'],
                ['Deposit Digunakan',      formatRupiah(0),         'text-gray-400'],
              ].map(([label, value, vc])=>(
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className={cn('text-[12px] font-bold', vc)}>{value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-dashed border-gray-200">
                <button onClick={()=>router.push('/report')} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-blue-500 font-medium hover:text-blue-700">
                  <TrendingUp size={11}/>Lihat Laporan Lengkap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
