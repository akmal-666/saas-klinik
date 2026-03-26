'use client';

import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Users, UserPlus, UserCheck, Download,
  ChevronDown, BarChart2, Activity, Package, FileText,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { cn, formatRupiah } from '@/lib/utils';

type ReportType = 'revenue' | 'visit' | 'treatment' | 'stock';

const TABS: { id: ReportType; label: string; icon: React.ElementType }[] = [
  { id:'revenue',   label:'Pendapatan',      icon:TrendingUp },
  { id:'visit',     label:'Kunjungan',        icon:Users },
  { id:'treatment', label:'Treatment',        icon:Activity },
  { id:'stock',     label:'Stok Barang',      icon:Package },
];

// Mock data
const DAILY_REVENUE = Array.from({ length: 23 }, (_, i) => ({
  day: i + 1,
  revenue: Math.floor(Math.random() * 7_000_000) + 1_500_000,
  visits: Math.floor(Math.random() * 18) + 4,
}));

const BY_DOCTOR = [
  { name: 'drg Christine Hendriono', spec:'Konservasi', revenue: 42_000_000, visits: 98,  pct: 32.7 },
  { name: 'drg Andrew Laurent',      spec:'Ortodonsi',  revenue: 31_500_000, visits: 67,  pct: 24.5 },
  { name: 'drg Jody Thia',           spec:'Bedah',      revenue: 28_000_000, visits: 72,  pct: 21.8 },
  { name: 'drg Nurvita Titi',        spec:'Periodonsi', revenue: 19_000_000, visits: 55,  pct: 14.8 },
  { name: 'drg Rontgen Audy',        spec:'Radiologi',  revenue:  8_000_000, visits: 20,  pct:  6.2 },
];

const TOP_TREATMENTS = [
  { name:'Scaling & Polishing',          count:87, revenue:24_360_000 },
  { name:'Tambal Komposit Posterior',    count:64, revenue:28_800_000 },
  { name:'Kontrol Behel',               count:52, revenue:13_000_000 },
  { name:'PSA Saluran Akar',            count:24, revenue:18_000_000 },
  { name:'Pencabutan Gigi Permanen',    count:38, revenue: 9_500_000 },
  { name:'Rontgen Panoramik',           count:31, revenue: 7_750_000 },
  { name:'Bleaching / Whitening',       count:18, revenue:32_400_000 },
  { name:'Odontektomi',                 count:12, revenue:18_000_000 },
];

const TOTAL_REVENUE = 128_500_000;
const MAX_DAY_REVENUE = Math.max(...DAILY_REVENUE.map(d => d.revenue));

export function ReportClient() {
  const [reportType, setReportType] = useState<ReportType>('revenue');
  const [dateFrom, setDateFrom] = useState('2026-03-01');
  const [dateTo, setDateTo]     = useState('2026-03-23');
  const [doctorFilter, setDoctor] = useState('');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[19px] font-bold text-[#0f1d35]">Laporan</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Analisis performa dan keuangan klinik</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
          <Download size={13}/>Export Excel
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-[10px] px-4 py-3 mb-5 flex-wrap">
        <span className="text-[11px] font-semibold text-gray-500">Periode:</span>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"/>
        <span className="text-gray-300">—</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-400"/>
        <div className="relative">
          <select value={doctorFilter} onChange={e=>setDoctor(e.target.value)} className="appearance-none border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-400 bg-white pr-7">
            <option value="">Semua Dokter</option>
            {BY_DOCTOR.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
        </div>
        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Tampilkan</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={()=>setReportType(id)} className={cn('flex items-center gap-2 px-5 py-3 text-xs font-medium border-b-2 transition-all', reportType===id?'border-blue-500 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700')}>
            <Icon size={13}/>{label}
          </button>
        ))}
      </div>

      {reportType === 'revenue'   && <RevenueTab />}
      {reportType === 'visit'     && <VisitTab />}
      {reportType === 'treatment' && <TreatmentTab />}
      {reportType === 'stock'     && <StockTab />}
    </div>
  );
}

// ──────────────────────────────────────────────
// REVENUE TAB
// ──────────────────────────────────────────────
function RevenueTab() {
  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Pendapatan',  value:formatRupiah(128_500_000), change:'+8%',  up:true, icon:TrendingUp },
          { label:'Total Kunjungan',   value:'312',                     change:'+5%',  up:true, icon:Users },
          { label:'Pasien Baru',       value:'87',                      change:'+12%', up:true, icon:UserPlus },
          { label:'Avg per Kunjungan', value:formatRupiah(411_218),     change:'-2%',  up:false,icon:Activity },
        ].map(({ label, value, change, up, icon:Icon })=>(
          <div key={label} className="bg-white border border-gray-200 rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-400 font-medium">{label}</span>
              <Icon size={14} className="text-gray-300"/>
            </div>
            <div className="text-[18px] font-bold text-[#0f1d35]">{value}</div>
            <div className={cn('flex items-center gap-1 mt-1 text-[11px] font-semibold', up?'text-emerald-600':'text-red-500')}>
              {up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
              {change} vs bulan lalu
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Daily bar chart */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="text-[13px] font-bold text-[#0f1d35]">Pendapatan Harian — Maret 2026</div>
          </div>
          <div className="px-5 py-4">
            <BarChart data={DAILY_REVENUE} maxVal={MAX_DAY_REVENUE} />
          </div>
        </div>

        {/* By doctor donut-style */}
        <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="text-[13px] font-bold text-[#0f1d35]">Kontribusi Per Dokter</div>
          </div>
          <div className="p-4 space-y-2.5">
            {BY_DOCTOR.map((d, i)=>{
              const colors = ['bg-blue-500','bg-teal-500','bg-purple-500','bg-amber-500','bg-rose-400'];
              return (
                <div key={d.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-medium text-gray-700 truncate pr-2">{d.name.split(' ').slice(0,3).join(' ')}</span>
                    <span className="text-[10px] font-bold text-gray-600 flex-shrink-0">{d.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', colors[i%colors.length])} style={{ width:`${d.pct}%` }}/>
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{formatRupiah(d.revenue)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue by doctor table */}
      <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100"><div className="text-[13px] font-bold text-[#0f1d35]">Detail Pendapatan Per Dokter</div></div>
        <table className="w-full border-collapse">
          <thead><tr className="border-b border-gray-200 bg-[#fafafa]">
            {['Dokter','Spesialisasi','Kunjungan','Total Revenue','Kontribusi'].map(h=>(
              <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {BY_DOCTOR.map((d,i)=>(
              <tr key={d.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 text-xs font-semibold text-gray-800">{d.name}</td>
                <td className="px-5 py-3"><span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">{d.spec}</span></td>
                <td className="px-5 py-3 text-xs font-semibold">{d.visits}</td>
                <td className="px-5 py-3 text-xs font-bold text-emerald-600">{formatRupiah(d.revenue)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width:`${d.pct}%` }}/>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600">{d.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// VISIT TAB
// ──────────────────────────────────────────────
function VisitTab() {
  const stats = [
    { label:'Total Kunjungan',      value:'312', change:'+5%',  up:true },
    { label:'Pasien Baru',          value:'87',  change:'+12%', up:true },
    { label:'Pasien Returning',     value:'225', change:'+2%',  up:true },
    { label:'Rate Appointment',     value:'82%', change:'+3%',  up:true },
    { label:'Cancel Rate',          value:'6%',  change:'-1%',  up:true },
    { label:'Avg Durasi (mnt)',      value:'48',  change:'=',    up:true },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-white border border-gray-200 rounded-[10px] p-4">
            <div className="text-[10px] text-gray-400 mb-1">{s.label}</div>
            <div className="text-[20px] font-bold text-[#0f1d35]">{s.value}</div>
            <div className={cn('text-[11px] font-semibold mt-0.5', s.up?'text-emerald-600':'text-red-500')}>{s.change} vs bulan lalu</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-[10px] p-5">
        <div className="text-[13px] font-bold text-[#0f1d35] mb-4">Kunjungan Harian</div>
        <BarChart data={DAILY_REVENUE} maxVal={22} valueKey="visits" color="bg-purple-400"/>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TREATMENT TAB
// ──────────────────────────────────────────────
function TreatmentTab() {
  const maxCount = Math.max(...TOP_TREATMENTS.map(t => t.count));
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100"><div className="text-[13px] font-bold text-[#0f1d35]">Treatment Terpopuler (Maret 2026)</div></div>
        <div className="p-5 space-y-3">
          {TOP_TREATMENTS.map((t, i) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-300 w-5 text-right flex-shrink-0">{i+1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-gray-800 truncate">{t.name}</span>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-[11px] text-gray-500">{t.count}×</span>
                    <span className="text-[11px] font-bold text-emerald-600">{formatRupiah(t.revenue)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full" style={{ width:`${(t.count/maxCount)*100}%` }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// STOCK TAB
// ──────────────────────────────────────────────
function StockTab() {
  const items = [
    { name:'Komposit Anterior A2', cat:'Bahan Restorasi', stock:24, min:10, unit:'tube',  price:185_000 },
    { name:'Komposit Posterior P2',cat:'Bahan Restorasi', stock:8,  min:10, unit:'tube',  price:225_000 },
    { name:'Anestesi Lidokain 2%', cat:'Anestesi',        stock:150,min:50, unit:'ampul', price:12_000 },
    { name:'Benang Sutur 4-0',     cat:'Bedah',           stock:5,  min:10, unit:'box',   price:87_000 },
    { name:'Bracket Roth 0.022',   cat:'Ortodonsi',       stock:30, min:20, unit:'set',   price:320_000 },
    { name:'Kertas Artikulasi',    cat:'Diagnostik',      stock:45, min:15, unit:'bks',   price:25_000 },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="text-[13px] font-bold text-[#0f1d35]">Stok Barang</div>
        <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
          {items.filter(i=>i.stock<=i.min).length} item perlu restock
        </span>
      </div>
      <table className="w-full border-collapse">
        <thead><tr className="border-b border-gray-200 bg-[#fafafa]">
          {['Nama Barang','Kategori','Stok','Min. Stok','Status','Harga'].map(h=>(
            <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
          ))}
        </tr></thead>
        <tbody>{items.map((item)=>{
          const low = item.stock <= item.min;
          return (
            <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3 text-xs font-medium text-gray-800">{item.name}</td>
              <td className="px-5 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{item.cat}</span></td>
              <td className="px-5 py-3"><span className={cn('text-xs font-bold', low?'text-red-600':'text-gray-700')}>{item.stock} {item.unit}</span></td>
              <td className="px-5 py-3 text-xs text-gray-400">{item.min} {item.unit}</td>
              <td className="px-5 py-3">
                {low
                  ? <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-semibold">Perlu Restock</span>
                  : <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px]">Aman</span>}
              </td>
              <td className="px-5 py-3 text-xs font-semibold text-emerald-600">{formatRupiah(item.price)}</td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}

// ──────────────────────────────────────────────
// BAR CHART COMPONENT
// ──────────────────────────────────────────────
function BarChart({ data, maxVal, valueKey = 'revenue', color = 'bg-blue-500' }: {
  data: any[]; maxVal: number; valueKey?: string; color?: string;
}) {
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d, i) => {
        const val = d[valueKey];
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        const isMax = val === maxVal;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className={cn('w-full rounded-t transition-all', isMax ? 'bg-blue-600' : color, 'opacity-80 group-hover:opacity-100')}
                style={{ height: `${pct}%`, minHeight: 2 }}
                title={valueKey === 'revenue' ? formatRupiah(val) : String(val)}
              />
            </div>
            <span className="text-[8px] text-gray-400">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}
