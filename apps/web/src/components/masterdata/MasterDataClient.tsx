'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit2, ToggleLeft, ChevronDown,
  User, Stethoscope, Package, Shield, Share2,
  Tag, Check, X, Clock, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatRupiah, formatDateId, getAge } from '@/lib/utils';

// ─── Mock data ────────────────────────────────────────────
const MOCK_DOCTORS = [
  { id:'d1', name:'drg Christine Hendriono Sp.KG', spec:'Konservasi Gigi', sip:'SIP/2020/001', phone:'08111000001', share_code:'SC-01', share_pct:40, active:true,  schedule:'Sen, Sel, Rab, Kam, Jum' },
  { id:'d2', name:'drg Andrew Laurent Sp.Ort',     spec:'Ortodonti',      sip:'SIP/2020/002', phone:'08111000002', share_code:'SC-02', share_pct:50, active:true,  schedule:'Sel, Kam, Sab' },
  { id:'d3', name:'drg Jody Thia',                 spec:'Bedah Mulut',    sip:'SIP/2021/003', phone:'08111000003', share_code:'SC-01', share_pct:40, active:true,  schedule:'Sen, Rab, Jum' },
  { id:'d4', name:'drg Nurvita Titi Ikawati Sp.KG',spec:'Periodonsi',     sip:'SIP/2021/004', phone:'08111000004', share_code:'SC-03', share_pct:45, active:true,  schedule:'Sen, Sel, Kam' },
  { id:'d5', name:'drg Rontgen Audy',               spec:'Radiologi',     sip:'SIP/2022/005', phone:'08111000005', share_code:'SC-01', share_pct:40, active:false, schedule:'Sen, Rab, Jum' },
];
const MOCK_PATIENTS = [
  { id:'p1', rm:'RM-20260323-00001', name:'Rizky Aditya Pratama',   dob:'1992-05-14', gender:'L', phone:'08211234567', allergy:'Penisilin',blood:'O+', insurance:'BPJS',    active:true },
  { id:'p2', rm:'RM-20260323-00002', name:'Dewi Santoso Putri',     dob:'1988-11-22', gender:'P', phone:'08221234568', allergy:null,       blood:'A+', insurance:null,      active:true },
  { id:'p3', rm:'RM-20260323-00003', name:'Budi Laksono',           dob:'1975-03-08', gender:'L', phone:'08231234569', allergy:'NSAID',    blood:'B-', insurance:'Allianz', active:true },
  { id:'p4', rm:'RM-20260323-00004', name:'Indah Permatasari',      dob:'1995-07-30', gender:'P', phone:'08241234570', allergy:null,       blood:'AB+',insurance:null,      active:true },
  { id:'p5', rm:'RM-20260323-00005', name:'Hendra Wijaya',          dob:'1983-12-01', gender:'L', phone:'08251234571', allergy:null,       blood:'O-', insurance:'BPJS',    active:true },
  { id:'p6', rm:'RM-20260323-00006', name:'Sari Rahayu Wulandari',  dob:'1997-04-18', gender:'P', phone:'08261234572', allergy:'Sulfa',    blood:'A-', insurance:null,      active:true },
  { id:'p7', rm:'RM-20220220-00007', name:'Ahmad Fauzi',            dob:'1970-09-25', gender:'L', phone:'08271234573', allergy:null,       blood:'B+', insurance:'AXA Mandiri',active:true },
  { id:'p8', rm:'RM-20260115-00008', name:'Rina Marlina',           dob:'2001-06-12', gender:'P', phone:'08281234574', allergy:null,       blood:'O+', insurance:null,      active:true },
];
const MOCK_TREATMENTS = [
  { id:'tr1', cat:'Konservasi', name:'Tambal Gigi Komposit Anterior',  price:350_000,  dur:45,  unit:'per gigi',      share:'SC-01', active:true },
  { id:'tr2', cat:'Konservasi', name:'Tambal Gigi Komposit Posterior', price:450_000,  dur:60,  unit:'per gigi',      share:'SC-01', active:true },
  { id:'tr3', cat:'Konservasi', name:'Perawatan Saluran Akar (PSA)',   price:750_000,  dur:90,  unit:'per kunjungan', share:'SC-01', active:true },
  { id:'tr5', cat:'Periodonsi', name:'Scaling & Polishing',            price:280_000,  dur:60,  unit:'per kunjungan', share:'SC-02', active:true },
  { id:'tr8', cat:'Ortodonsi',  name:'Pasang Behel Metal',             price:4_500_000,dur:90,  unit:'rahang',        share:'SC-03', active:true },
  { id:'tr9', cat:'Ortodonsi',  name:'Kontrol Behel',                  price:250_000,  dur:30,  unit:'kunjungan',     share:'SC-03', active:true },
  { id:'tr12',cat:'Bedah Mulut',name:'Pencabutan Gigi Permanen',       price:250_000,  dur:30,  unit:'per gigi',      share:'SC-01', active:true },
  { id:'tr13',cat:'Bedah Mulut',name:'Odontektomi (Wisdom Tooth)',     price:1_500_000,dur:120, unit:'per gigi',      share:'SC-01', active:true },
  { id:'tr14',cat:'Estetik',    name:'Bleaching / Whitening',          price:1_800_000,dur:90,  unit:'rahang',        share:'SC-02', active:true },
  { id:'tr17',cat:'Radiologi',  name:'Rontgen Panoramik',              price:250_000,  dur:15,  unit:'per foto',      share:'SC-01', active:true },
];
const MOCK_INSURANCES = [
  { id:'i1', name:'BPJS Kesehatan',     code:'BPJS', type:'Pemerintah', payment:'Transfer', contact:'1500400',     active:true },
  { id:'i2', name:'Allianz Life',        code:'ALZ',  type:'Swasta',     payment:'Transfer', contact:'1500136',     active:true },
  { id:'i3', name:'AXA Mandiri',         code:'AXA',  type:'Swasta',     payment:'Transfer', contact:'1500803',     active:true },
  { id:'i4', name:'Prudential Indonesia',code:'PRU',  type:'Swasta',     payment:'Transfer', contact:'1500085',     active:true },
];
const MOCK_SHARE_CODES = [
  { id:'sc1', code:'SC-01', name:'Standar Umum',    doctor_pct:40, clinic_pct:60 },
  { id:'sc2', code:'SC-02', name:'Spesialis Senior',doctor_pct:50, clinic_pct:50 },
  { id:'sc3', code:'SC-03', name:'Ortodontis',       doctor_pct:45, clinic_pct:55 },
];
const MOCK_PROMOS = [
  { id:'pr1', code:'DENTAL20',  name:'Diskon Dental 20%',  type:'Voucher',   discount:'20%',    valid:'1 Mar – 31 Mar 2026', used:14, active:true },
  { id:'pr2', code:'SCALING50K',name:'Scaling Promo',      type:'Campaign',  discount:'Rp 50K', valid:'15 Mar – 15 Apr 2026',used:7,  active:true },
  { id:'pr3', code:'NEWPASIEN',  name:'Pasien Baru',        type:'Campaign',  discount:'10%',    valid:'1 Jan – 31 Des 2026',  used:32, active:false },
];

// ─── Tab config ───────────────────────────────────────────
const TABS = [
  { id:'doctors',    label:'Dokter',       icon:Stethoscope, count: MOCK_DOCTORS.length },
  { id:'patients',   label:'Pasien',       icon:User,        count: MOCK_PATIENTS.length },
  { id:'treatments', label:'Treatment',    icon:Package,     count: MOCK_TREATMENTS.length },
  { id:'insurances', label:'Asuransi',     icon:Shield,      count: MOCK_INSURANCES.length },
  { id:'sharecodes', label:'Kode Share',   icon:Share2,      count: MOCK_SHARE_CODES.length },
  { id:'promos',     label:'Promo',        icon:Tag,         count: MOCK_PROMOS.length },
] as const;

type TabId = typeof TABS[number]['id'];

export function MasterDataClient() {
  const [tab, setTab] = useState<TabId>('doctors');
  const [searchQ, setSearchQ] = useState('');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[19px] font-bold text-[#0f1d35]">Master Data</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Kelola data referensi klinik</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Search size={12} className="text-gray-400"/>
            <input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder={`Cari ${TABS.find(t=>t.id===tab)?.label.toLowerCase()}...`} className="text-xs outline-none bg-transparent w-40 text-gray-700"/>
          </div>
          <button onClick={()=>toast.info('Form tambah akan muncul')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
            <Plus size={13}/>Tambah {TABS.find(t=>t.id===tab)?.label}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(({ id, label, icon:Icon, count }) => (
          <button
            key={id}
            onClick={()=>{ setTab(id); setSearchQ(''); }}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap',
              tab===id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon size={13}/>{label}
            <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-bold', tab===id?'bg-blue-100 text-blue-600':'bg-gray-100 text-gray-500')}>{count}</span>
          </button>
        ))}
      </div>

      {tab==='doctors'    && <DoctorsTable search={searchQ}/>}
      {tab==='patients'   && <PatientsTable search={searchQ}/>}
      {tab==='treatments' && <TreatmentsTable search={searchQ}/>}
      {tab==='insurances' && <InsurancesTable search={searchQ}/>}
      {tab==='sharecodes' && <ShareCodesTable search={searchQ}/>}
      {tab==='promos'     && <PromosTable search={searchQ}/>}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">{children}</div>;
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-xs', className)}>{children}</td>;
}
function ActiveBadge({ active }: { active: boolean }) {
  return <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', active?'bg-green-50 text-green-700 border-green-200':'bg-gray-100 text-gray-400 border-gray-200')}>{active?'Aktif':'Non-aktif'}</span>;
}

// ─── Doctors table ────────────────────────────────────────
function DoctorsTable({ search }: { search: string }) {
  const rows = MOCK_DOCTORS.filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.spec.toLowerCase().includes(search.toLowerCase()));
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr className="border-b-2 border-gray-200 bg-[#fafafa]">
            <Th>Nama Dokter</Th><Th>Spesialisasi</Th><Th>No. SIP</Th><Th>Kode Share</Th><Th>Jadwal</Th><Th>Status</Th><Th>Aksi</Th>
          </tr></thead>
          <tbody>{rows.map((d) => (
            <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
              <Td>
                <div className="font-semibold text-gray-900">{d.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{d.phone}</div>
              </Td>
              <Td><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-medium">{d.spec}</span></Td>
              <Td><span className="font-mono text-[11px] text-gray-600">{d.sip}</span></Td>
              <Td>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">{d.share_code}</span>
                <span className="text-[10px] text-gray-400 ml-1">({d.share_pct}%)</span>
              </Td>
              <Td className="text-gray-500">{d.schedule}</Td>
              <Td><ActiveBadge active={d.active}/></Td>
              <Td>
                <div className="flex gap-1.5">
                  <button onClick={()=>toast.info('Edit dokter')} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1"><Edit2 size={10}/>Edit</button>
                  <button onClick={()=>toast.info('Atur jadwal')} className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1"><Clock size={10}/>Jadwal</button>
                </div>
              </Td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Patients table ───────────────────────────────────────
function PatientsTable({ search }: { search: string }) {
  const rows = MOCK_PATIENTS.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.rm.includes(search));
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr className="border-b-2 border-gray-200 bg-[#fafafa]">
            <Th>No. RM</Th><Th>Nama Pasien</Th><Th>Usia / JK</Th><Th>Telepon</Th><Th>Gol. Darah</Th><Th>Asuransi</Th><Th>Alergi</Th><Th>Aksi</Th>
          </tr></thead>
          <tbody>{rows.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
              <Td><span className="font-mono text-[11px] text-blue-600">{p.rm}</span></Td>
              <Td className="font-semibold text-gray-900">{p.name}</Td>
              <Td><span className="text-gray-600">{getAge(p.dob)} thn / {p.gender}</span></Td>
              <Td className="text-gray-500">{p.phone}</Td>
              <Td><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">{p.blood}</span></Td>
              <Td>{p.insurance ? <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[10px]">{p.insurance}</span> : <span className="text-gray-300 text-[10px]">Umum</span>}</Td>
              <Td>{p.allergy ? <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-medium">{p.allergy}</span> : <span className="text-gray-300 text-[10px]">—</span>}</Td>
              <Td>
                <div className="flex gap-1.5">
                  <button className="px-2 py-1 text-[11px] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100">EMR</button>
                  <button className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">Edit</button>
                </div>
              </Td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Treatments table ─────────────────────────────────────
function TreatmentsTable({ search }: { search: string }) {
  const rows = MOCK_TREATMENTS.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase()));
  const cats = [...new Set(MOCK_TREATMENTS.map((t) => t.cat))];
  const [catFilter, setCatFilter] = useState('');
  const filtered = catFilter ? rows.filter((r) => r.cat === catFilter) : rows;
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={()=>setCatFilter('')} className={cn('px-3 py-1 rounded-full text-[11px] font-medium border',!catFilter?'bg-[#0f1d35] text-white border-[#0f1d35]':'bg-white text-gray-600 border-gray-200')}>Semua</button>
        {cats.map((c)=><button key={c} onClick={()=>setCatFilter(c)} className={cn('px-3 py-1 rounded-full text-[11px] font-medium border',catFilter===c?'bg-[#0f1d35] text-white border-[#0f1d35]':'bg-white text-gray-600 border-gray-200')}>{c}</button>)}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="border-b-2 border-gray-200 bg-[#fafafa]">
              <Th>Nama Treatment</Th><Th>Kategori</Th><Th>Harga</Th><Th>Durasi</Th><Th>Unit</Th><Th>Kode Share</Th><Th>Status</Th><Th>Aksi</Th>
            </tr></thead>
            <tbody>{filtered.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <Td className="font-medium text-gray-900">{t.name}</Td>
                <Td><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px]">{t.cat}</span></Td>
                <Td className="font-semibold text-emerald-600">{formatRupiah(t.price)}</Td>
                <Td className="text-gray-500">{t.dur} mnt</Td>
                <Td className="text-gray-400">{t.unit}</Td>
                <Td><span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">{t.share}</span></Td>
                <Td><ActiveBadge active={t.active}/></Td>
                <Td><button className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1"><Edit2 size={10}/>Edit</button></Td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Insurances table ─────────────────────────────────────
function InsurancesTable({ search }: { search: string }) {
  const rows = MOCK_INSURANCES.filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Card><div className="overflow-x-auto"><table className="w-full border-collapse">
      <thead><tr className="border-b-2 border-gray-200 bg-[#fafafa]">
        <Th>Nama</Th><Th>Kode</Th><Th>Tipe</Th><Th>Metode Bayar</Th><Th>Kontak</Th><Th>Status</Th><Th>Aksi</Th>
      </tr></thead>
      <tbody>{rows.map((i)=>(
        <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
          <Td className="font-semibold text-gray-900">{i.name}</Td>
          <Td><span className="font-mono text-[11px] bg-navy-50 text-[#0f1d35] bg-[#eef2ff] px-2 py-0.5 rounded font-bold">{i.code}</span></Td>
          <Td className="text-gray-600">{i.type}</Td>
          <Td><span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px]">{i.payment}</span></Td>
          <Td className="font-mono text-[11px] text-gray-500">{i.contact}</Td>
          <Td><ActiveBadge active={i.active}/></Td>
          <Td><button className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">Edit</button></Td>
        </tr>
      ))}</tbody>
    </table></div></Card>
  );
}

// ─── Share codes table ────────────────────────────────────
function ShareCodesTable({ search }: { search: string }) {
  const rows = MOCK_SHARE_CODES.filter((s) => !search || s.code.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Card><div className="overflow-x-auto"><table className="w-full border-collapse">
      <thead><tr className="border-b-2 border-gray-200 bg-[#fafafa]">
        <Th>Kode</Th><Th>Nama</Th><Th>% Dokter</Th><Th>% Klinik</Th><Th>Aksi</Th>
      </tr></thead>
      <tbody>{rows.map((s)=>(
        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
          <Td><span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-mono font-bold">{s.code}</span></Td>
          <Td className="font-medium text-gray-800">{s.name}</Td>
          <Td>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width:`${s.doctor_pct}%` }}/></div>
              <span className="font-bold text-blue-600 text-xs">{s.doctor_pct}%</span>
            </div>
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#0f1d35] rounded-full" style={{ width:`${s.clinic_pct}%` }}/></div>
              <span className="font-bold text-[#0f1d35] text-xs">{s.clinic_pct}%</span>
            </div>
          </Td>
          <Td><button className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">Edit</button></Td>
        </tr>
      ))}</tbody>
    </table></div></Card>
  );
}

// ─── Promos table ─────────────────────────────────────────
function PromosTable({ search }: { search: string }) {
  const rows = MOCK_PROMOS.filter((p) => !search || p.code.includes(search.toUpperCase()) || p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Card><div className="overflow-x-auto"><table className="w-full border-collapse">
      <thead><tr className="border-b-2 border-gray-200 bg-[#fafafa]">
        <Th>Kode</Th><Th>Nama</Th><Th>Tipe</Th><Th>Diskon</Th><Th>Masa Berlaku</Th><Th>Terpakai</Th><Th>Status</Th><Th>Aksi</Th>
      </tr></thead>
      <tbody>{rows.map((p)=>(
        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
          <Td><span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-mono font-bold">{p.code}</span></Td>
          <Td className="font-medium text-gray-800">{p.name}</Td>
          <Td><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{p.type}</span></Td>
          <Td className="font-bold text-emerald-600">{p.discount}</Td>
          <Td className="text-gray-500 text-[11px]">{p.valid}</Td>
          <Td><span className="text-xs font-semibold text-gray-700">{p.used}×</span></Td>
          <Td><ActiveBadge active={p.active}/></Td>
          <Td><button className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">Edit</button></Td>
        </tr>
      ))}</tbody>
    </table></div></Card>
  );
}
