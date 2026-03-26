'use client';

import { useState } from 'react';
import {
  Settings, Wifi, Bell, Shield, Users, Building2,
  Save, TestTube, Eye, EyeOff, Check, X, AlertCircle,
  ChevronRight, ToggleLeft, ToggleRight, Clock, FileText,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SettingsTab = 'general' | 'satusehat' | 'notifications' | 'roles' | 'users' | 'audit';

const TABS = [
  { id:'general',       label:'Klinik',       icon:Building2 },
  { id:'satusehat',     label:'SATUSEHAT',    icon:Wifi },
  { id:'notifications', label:'Notifikasi',   icon:Bell },
  { id:'roles',         label:'Hak Akses',    icon:Shield },
  { id:'users',         label:'Pengguna',     icon:Users },
  { id:'audit',         label:'Audit Log',    icon:FileText },
] as const;

const MOCK_USERS = [
  { id:'u1', name:'Bukhori Akmal',       email:'admin@audydental.co.id', role:'admin_klinik',  last_login:'23 Mar 2026, 08:00', active:true },
  { id:'u2', name:'drg Christine H.',     email:'christine@audydental.co.id',role:'dokter',     last_login:'23 Mar 2026, 09:00', active:true },
  { id:'u3', name:'Rima Resepsionis',     email:'rima@audydental.co.id',  role:'resepsionis',  last_login:'23 Mar 2026, 07:55', active:true },
  { id:'u4', name:'Andi Kasir',           email:'andi@audydental.co.id',  role:'kasir',        last_login:'22 Mar 2026, 17:30', active:true },
  { id:'u5', name:'Sari Apoteker',        email:'sari@audydental.co.id',  role:'apoteker',     last_login:'20 Mar 2026, 12:00', active:false },
];

const MOCK_AUDIT = [
  { id:'al1', user:'Bukhori Akmal', action:'UPDATE appointment status', table:'appointments', record_id:'a1', ts:'23 Mar 2026, 09:47' },
  { id:'al2', user:'Andi Kasir',    action:'CREATE invoice',            table:'invoices',     record_id:'inv1', ts:'23 Mar 2026, 09:45' },
  { id:'al3', user:'Rima Resepsionis',action:'CREATE appointment',      table:'appointments', record_id:'a7', ts:'23 Mar 2026, 09:20' },
  { id:'al4', user:'Bukhori Akmal', action:'UPDATE patient data',       table:'patients',     record_id:'p3', ts:'23 Mar 2026, 08:10' },
  { id:'al5', user:'drg Christine', action:'CREATE emr_record',         table:'emr_records',  record_id:'e1', ts:'23 Mar 2026, 07:55' },
];

const ROLE_LABELS: Record<string,string> = {
  super_admin:'Super Admin', admin_klinik:'Admin Klinik', dokter:'Dokter',
  resepsionis:'Resepsionis', kasir:'Kasir', apoteker:'Apoteker',
};

export function SettingsClient() {
  const [tab, setTab] = useState<SettingsTab>('general');

  return (
    <div className="flex h-[calc(100vh-54px)] overflow-hidden">
      {/* Sidebar nav */}
      <div className="w-48 bg-white border-r border-gray-200 flex-shrink-0 py-4">
        <div className="px-4 pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pengaturan</div>
        {TABS.map(({ id, label, icon:Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium border-l-2 transition-all',
              tab === id
                ? 'border-l-blue-500 bg-blue-50 text-blue-600'
                : 'border-l-transparent text-gray-600 hover:bg-gray-50',
            )}
          >
            <Icon size={13}/>{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#f4f6f9] p-6">
        {tab === 'general'       && <GeneralSettings />}
        {tab === 'satusehat'     && <SatuSehatSettings />}
        {tab === 'notifications' && <NotificationSettings />}
        {tab === 'roles'         && <RolesSettings />}
        {tab === 'users'         && <UsersSettings />}
        {tab === 'audit'         && <AuditSettings />}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────
function Section({ title, subtitle, children, actions }: { title:string; subtitle?:string; children:React.ReactNode; actions?:React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div><div className="text-[13px] font-bold text-[#0f1d35]">{title}</div>{subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{subtitle}</div>}</div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function Field({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {hint && <div className="text-[10px] text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}
const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 transition-all"/>
);
const Textarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 transition-all resize-none"/>
);
function SaveBtn({ onClick }: { onClick?:()=>void }) {
  return (
    <button onClick={onClick ?? (()=>toast.success('Pengaturan disimpan'))} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
      <Save size={12}/>Simpan
    </button>
  );
}

// ─── General ─────────────────────────────────
function GeneralSettings() {
  return (
    <>
      <Section title="Informasi Klinik" actions={<SaveBtn/>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Klinik"><Input defaultValue="Audy Dental"/></Field>
          <Field label="Cabang / Lokasi"><Input defaultValue="Muara Karang"/></Field>
          <Field label="No. Telepon"><Input defaultValue="021-12345678" type="tel"/></Field>
          <Field label="Email Klinik"><Input defaultValue="info@audydental.co.id" type="email"/></Field>
          <Field label="Alamat" hint="Alamat lengkap klinik">
            <Textarea defaultValue="Jl. Muara Karang Raya No. 23, Jakarta Utara 14450" rows={2}/>
          </Field>
          <div>
            <Field label="Zona Waktu"><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 bg-white appearance-none"><option>Asia/Jakarta (WIB, GMT+7)</option><option>Asia/Makassar (WITA, GMT+8)</option><option>Asia/Jayapura (WIT, GMT+9)</option></select></Field>
            <Field label="Format No. Rekam Medis" hint="Otomatis: RM-YYYYMMDD-XXXXX">
              <Input defaultValue="RM-YYYYMMDD-XXXXX" readOnly className="bg-gray-50 text-gray-500"/>
            </Field>
          </div>
        </div>
      </Section>
      <Section title="Format Invoice" actions={<SaveBtn/>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Format Nomor Invoice" hint="Otomatis: INV-YYYYMMDD-XXX">
            <Input defaultValue="INV-YYYYMMDD-XXX" readOnly className="bg-gray-50 text-gray-500"/>
          </Field>
          <Field label="Catatan Footer Invoice">
            <Textarea defaultValue="Terima kasih atas kunjungan Anda. Kesehatan gigi Anda adalah prioritas kami." rows={2}/>
          </Field>
        </div>
      </Section>
    </>
  );
}

// ─── SATUSEHAT ───────────────────────────────
function SatuSehatSettings() {
  const [enabled, setEnabled] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    await new Promise(r => setTimeout(r, 1200));
    setTesting(false);
    toast.success('Koneksi SATUSEHAT berhasil! Organization ID terverifikasi.');
  };

  return (
    <>
      {/* Status banner */}
      <div className={cn('flex items-center gap-3 p-4 rounded-[10px] border mb-4', enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')}>
        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400')}/>
        <div className="flex-1">
          <div className={cn('text-[12px] font-bold', enabled ? 'text-green-800' : 'text-gray-600')}>
            Sinkronisasi SATUSEHAT {enabled ? 'Aktif' : 'Non-aktif'}
          </div>
          <div className={cn('text-[11px] mt-0.5', enabled ? 'text-green-600' : 'text-gray-400')}>
            {enabled ? 'EMR akan otomatis dikirim ke platform SATUSEHAT Kemenkes setelah disimpan.' : 'Aktifkan untuk integrasi dengan platform SATUSEHAT Kemenkes RI.'}
          </div>
        </div>
        <button onClick={() => setEnabled(!enabled)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all" style={{ background: enabled ? '#0f1d35' : '#fff', color: enabled ? '#fff' : '#374151', borderColor: enabled ? '#0f1d35' : '#d1d5db' }}>
          {enabled ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
          {enabled ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>

      <Section title="Kredensial API SATUSEHAT" subtitle="Didapat dari https://satusehat.kemkes.go.id/platform" actions={<SaveBtn/>}>
        <Field label="Organization ID" hint="ID organisasi fasilitas kesehatan Anda di SATUSEHAT">
          <Input defaultValue="1000231829"/>
        </Field>
        <Field label="Client ID">
          <Input defaultValue="satusehat-client-id-xxx"/>
        </Field>
        <Field label="Client Secret">
          <div className="relative">
            <Input type={showSecret ? 'text' : 'password'} defaultValue="supersecretclientsecret"/>
            <button type="button" onClick={() => setShowSecret(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showSecret ? <EyeOff size={13}/> : <Eye size={13}/>}
            </button>
          </div>
        </Field>
        <Field label="Environment">
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 bg-white appearance-none">
            <option value="production">Production (api-satusehat.kemkes.go.id)</option>
            <option value="staging">Staging (api-sandbox.satusehat.kemkes.go.id)</option>
          </select>
        </Field>
        <div className="flex gap-2 mt-4">
          <button onClick={testConnection} disabled={testing} className="flex items-center gap-1.5 px-4 py-2 bg-[#0f1d35] text-white text-xs font-medium rounded-lg hover:bg-[#1a2d4a] disabled:opacity-60">
            {testing ? <RefreshCw size={12} className="animate-spin"/> : <TestTube size={12}/>}
            {testing ? 'Menguji...' : 'Test Koneksi'}
          </button>
          <button onClick={() => toast.info('Memulai sync manual untuk 3 EMR pending...')} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
            <RefreshCw size={12}/>Sync Manual (3 pending)
          </button>
        </div>
      </Section>

      <Section title="Status Sinkronisasi" subtitle="Riwayat pengiriman data ke SATUSEHAT">
        <div className="space-y-2">
          {[
            { emr:'EMR #e1 — Rizky Aditya (23/03)',  status:'synced', ts:'23 Mar 09:47' },
            { emr:'EMR #e2 — Dewi Santoso (10/02)',  status:'synced', ts:'10 Feb 11:20' },
            { emr:'EMR #e3 — Budi Laksono (05/11)',  status:'failed', ts:'5 Nov 14:33' },
            { emr:'EMR #e4 — Hendra Wijaya (today)', status:'pending',ts:'Menunggu...' },
          ].map((item) => (
            <div key={item.emr} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', item.status==='synced'?'bg-green-500':item.status==='failed'?'bg-red-500':'bg-amber-400')}/>
              <span className="text-[11px] text-gray-700 flex-1">{item.emr}</span>
              <span className={cn('text-[10px] font-semibold', item.status==='synced'?'text-green-600':item.status==='failed'?'text-red-600':'text-amber-500')}>
                {item.status==='synced'?'Terkirim':item.status==='failed'?'Gagal':'Pending'}
              </span>
              <span className="text-[10px] text-gray-400">{item.ts}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── Notifications ────────────────────────────
function NotificationSettings() {
  const notifs = [
    { id:'n1', label:'Reminder Appointment H-1',       channel:'WhatsApp', time:'08:00', enabled:true },
    { id:'n2', label:'Reminder Appointment H-0 (2 jam)',channel:'WhatsApp', time:'2 jam sebelum', enabled:true },
    { id:'n3', label:'Konfirmasi Booking',              channel:'WhatsApp + Email', time:'Saat booking', enabled:true },
    { id:'n4', label:'Invoice Lunas',                   channel:'Email',     time:'Saat pembayaran', enabled:true },
    { id:'n5', label:'Cancel Appointment',              channel:'WhatsApp',  time:'Saat cancel',     enabled:false },
    { id:'n6', label:'Antrian Dipanggil',               channel:'WhatsApp',  time:'Saat dipanggil',  enabled:true },
  ];
  const [states, setStates] = useState(() => Object.fromEntries(notifs.map(n=>[n.id,n.enabled])));

  return (
    <>
      <Section title="Template Notifikasi" subtitle="Konfigurasi pesan otomatis yang dikirim ke pasien" actions={<SaveBtn/>}>
        <div className="space-y-3">
          {notifs.map((n) => (
            <div key={n.id} className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-[12px] font-semibold text-gray-800">{n.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{n.channel} · {n.time}</div>
              </div>
              <button
                onClick={()=>setStates(s=>({...s,[n.id]:!s[n.id]}))}
                className={cn('flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-semibold border transition-all', states[n.id]?'bg-green-50 text-green-700 border-green-200':'bg-gray-100 text-gray-500 border-gray-200')}
              >
                {states[n.id] ? <><Check size={10}/>Aktif</> : <><X size={10}/>Non-aktif</>}
              </button>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Konfigurasi WhatsApp" actions={<SaveBtn/>}>
        <Field label="WhatsApp API URL"><Input defaultValue="https://api.whatsapp.com/v1" placeholder="https://..."/></Field>
        <Field label="API Key / Token"><Input type="password" defaultValue="wa-api-key-xxx"/></Field>
        <Field label="Nomor Pengirim (Klinik)"><Input defaultValue="+628111234567" type="tel"/></Field>
      </Section>
    </>
  );
}

// ─── Roles ────────────────────────────────────
function RolesSettings() {
  const roles = [
    { r:'Super Admin',    desc:'Akses penuh ke semua fitur dan semua klinik (SaaS owner)', perms:['Dashboard','Appointment','EMR','Kasir','Laporan','Master Data','Payroll','Settings','Users','Semua Klinik'] },
    { r:'Admin Klinik',   desc:'Akses penuh di klinik sendiri, kecuali konfigurasi SaaS',  perms:['Dashboard','Appointment','EMR','Kasir','Laporan','Master Data','Payroll','Settings Klinik','Users Klinik'] },
    { r:'Dokter',         desc:'Jadwal, EMR pasien sendiri, laporan performa pribadi',       perms:['Dashboard','Lihat Appointment','EMR Sendiri','Payroll Sendiri'] },
    { r:'Resepsionis',    desc:'Appointment, manajemen pasien, lihat kasir (tanpa refund)',  perms:['Dashboard','Appointment (Full)','Pasien','Lihat Kasir','Lihat EMR'] },
    { r:'Kasir',          desc:'Kasir penuh, invoice, deposit, laporan keuangan',            perms:['Dashboard','Kasir (Full)','Deposit','Laporan Keuangan'] },
    { r:'Apoteker',       desc:'Lihat resep dari EMR, kelola stok barang klinik',            perms:['Dashboard','Lihat EMR','Stok Barang'] },
  ];
  return (
    <Section title="Hak Akses & Role" subtitle="Konfigurasi permission per role pengguna">
      <div className="space-y-3">
        {roles.map(({ r, desc, perms }) => (
          <div key={r} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div>
                <span className="text-[12px] font-bold text-gray-800">{r}</span>
                <div className="text-[10px] text-gray-400 mt-0.5">{desc}</div>
              </div>
              <button onClick={()=>toast.info('Edit permission akan segera tersedia')} className="text-[11px] text-blue-500 hover:underline font-medium">Edit</button>
            </div>
            <div className="px-4 py-3 flex flex-wrap gap-1.5">
              {perms.map((p)=>(
                <span key={p} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-medium">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Users ────────────────────────────────────
function UsersSettings() {
  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={()=>toast.info('Form invite pengguna baru')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
          <Users size={12}/>Invite Pengguna Baru
        </button>
      </div>
      <Section title="Daftar Pengguna Aktif">
        <table className="w-full border-collapse">
          <thead><tr className="border-b border-gray-200">
            {['Nama','Email','Role','Login Terakhir','Status','Aksi'].map(h=>(
              <th key={h} className="text-left pb-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_USERS.map((u)=>(
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0f1d35] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                      {u.name.split(' ').slice(0,2).map(n=>n[0]).join('')}
                    </div>
                    <span className="text-[12px] font-semibold text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[11px] text-gray-500">{u.email}</td>
                <td className="py-3 pr-4">
                  <span className="bg-[#eef2ff] text-[#0f1d35] px-2 py-0.5 rounded text-[10px] font-semibold">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td className="py-3 pr-4 text-[11px] text-gray-400">{u.last_login}</td>
                <td className="py-3 pr-4">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', u.active?'bg-green-50 text-green-700 border-green-200':'bg-gray-100 text-gray-400 border-gray-200')}>
                    {u.active?'Aktif':'Non-aktif'}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-1.5">
                    <button onClick={()=>toast.info(`Edit ${u.name}`)} className="px-2 py-1 text-[10px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">Edit</button>
                    <button onClick={()=>toast.warning(`${u.name} dinonaktifkan`)} className="px-2 py-1 text-[10px] border border-red-200 rounded hover:bg-red-50 text-red-500">
                      {u.active?'Nonaktifkan':'Aktifkan'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

// ─── Audit Log ────────────────────────────────
function AuditSettings() {
  return (
    <Section title="Audit Log" subtitle="Rekam jejak aktivitas pengguna di sistem">
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-gray-200">
          {['Pengguna','Aksi','Tabel','Record ID','Waktu'].map(h=>(
            <th key={h} className="text-left pb-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-gray-100">
          {MOCK_AUDIT.map((log)=>(
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="py-2.5 pr-4 text-[11px] font-medium text-gray-800">{log.user}</td>
              <td className="py-2.5 pr-4">
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded',
                  log.action.startsWith('CREATE')?'bg-green-50 text-green-700':
                  log.action.startsWith('UPDATE')?'bg-blue-50 text-blue-700':
                  'bg-red-50 text-red-700')}>
                  {log.action}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-[11px] font-mono text-gray-500">{log.table}</td>
              <td className="py-2.5 pr-4 text-[11px] font-mono text-gray-400">{log.record_id}</td>
              <td className="py-2.5 text-[11px] text-gray-400">{log.ts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center">
        <button onClick={()=>toast.info('Memuat log lebih lama...')} className="text-[11px] text-blue-500 hover:underline">Muat lebih banyak</button>
      </div>
    </Section>
  );
}
