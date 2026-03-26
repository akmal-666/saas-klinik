'use client';

import { useState } from 'react';
import {
  Calculator, ChevronDown, Check, Clock, Download,
  Banknote, TrendingUp, Users, FileText, Plus, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatRupiah } from '@/lib/utils';

const MOCK_PERIODS = [
  { id:'pp1', period:'Maret 2026',   start:'2026-03-01', end:'2026-03-31', status:'draft',    total:51_400_000 },
  { id:'pp2', period:'Februari 2026',start:'2026-02-01', end:'2026-02-28', status:'approved', total:48_200_000 },
  { id:'pp3', period:'Januari 2026', start:'2026-01-01', end:'2026-01-31', status:'paid',     total:55_700_000 },
];

const MOCK_ITEMS = [
  { id:'pi1', doctor:'drg Christine Hendriono Sp.KG', share:'SC-01', pct:40, tindakan:98, revenue:42_000_000, doctor_amt:16_800_000, clinic_amt:25_200_000, status:'pending', override:null },
  { id:'pi2', doctor:'drg Andrew Laurent Sp.Ort',     share:'SC-02', pct:50, tindakan:67, revenue:31_500_000, doctor_amt:15_750_000, clinic_amt:15_750_000, status:'pending', override:null },
  { id:'pi3', doctor:'drg Jody Thia',                 share:'SC-01', pct:40, tindakan:72, revenue:28_000_000, doctor_amt:11_200_000, clinic_amt:16_800_000, status:'paid',    override:null },
  { id:'pi4', doctor:'drg Nurvita Titi Ikawati Sp.KG',share:'SC-03', pct:45, tindakan:55, revenue:19_000_000, doctor_amt:8_550_000,  clinic_amt:10_450_000, status:'pending', override:500_000 },
  { id:'pi5', doctor:'drg Rontgen Audy',              share:'SC-01', pct:40, tindakan:20, revenue:8_000_000,  doctor_amt:3_200_000,  clinic_amt:4_800_000,  status:'pending', override:null },
];

const STATUS_BADGE: Record<string, string> = {
  draft:    'bg-blue-50 text-blue-600 border-blue-200',
  approved: 'bg-amber-50 text-amber-700 border-amber-200',
  paid:     'bg-green-50 text-green-700 border-green-200',
  pending:  'bg-gray-100 text-gray-500 border-gray-200',
};

export function PayrollClient() {
  const [selectedPeriod, setSelected] = useState(MOCK_PERIODS[0]);
  const [calculating, setCalculating] = useState(false);

  const totalRevenue    = MOCK_ITEMS.reduce((s,i)=>s+i.revenue,0);
  const totalDoctors    = MOCK_ITEMS.reduce((s,i)=>s+(i.override??i.doctor_amt),0);
  const totalClinic     = totalRevenue - totalDoctors;

  const handleCalculate = async () => {
    setCalculating(true);
    await new Promise(r=>setTimeout(r,1000));
    setCalculating(false);
    toast.success('Payroll berhasil dihitung untuk periode Maret 2026');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[19px] font-bold text-[#0f1d35]">Payroll Dokter</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Kalkulasi bagi hasil dan penggajian dokter</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedPeriod.id}
              onChange={(e)=>setSelected(MOCK_PERIODS.find(p=>p.id===e.target.value)??MOCK_PERIODS[0])}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 outline-none pr-7"
            >
              {MOCK_PERIODS.map((p)=><option key={p.id} value={p.id}>{p.period}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {calculating ? <span className="animate-spin text-sm">⟳</span> : <Calculator size={13}/>}
            Hitung Payroll
          </button>
          {selectedPeriod.status==='draft' && (
            <button onClick={()=>toast.success('Periode diapprove')} className="flex items-center gap-1.5 px-3 py-2 bg-[#0f1d35] text-white text-xs font-medium rounded-lg hover:bg-[#1a2d4a]">
              <Check size={13}/>Approve
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
            <Download size={13}/>Export
          </button>
        </div>
      </div>

      {/* Period selector cards */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
        {MOCK_PERIODS.map((p)=>(
          <div
            key={p.id}
            onClick={()=>setSelected(p)}
            className={cn(
              'flex-shrink-0 px-4 py-3 rounded-[10px] border cursor-pointer transition-all min-w-[180px]',
              selectedPeriod.id===p.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200',
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold text-gray-800">{p.period}</span>
              <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-semibold border',STATUS_BADGE[p.status])}>
                {p.status==='draft'?'Draft':p.status==='approved'?'Approved':'Dibayar'}
              </span>
            </div>
            <div className="text-[15px] font-bold text-blue-600">{formatRupiah(p.total)}</div>
            <div className="text-[10px] text-gray-400">Total payroll dokter</div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label:'Total Revenue Klinik', value:formatRupiah(totalRevenue), icon:TrendingUp, color:'text-emerald-500 bg-emerald-50' },
          { label:'Total Payroll Dokter', value:formatRupiah(totalDoctors), icon:Users,      color:'text-blue-500 bg-blue-50' },
          { label:'Pendapatan Klinik',    value:formatRupiah(totalClinic),  icon:Banknote,   color:'text-purple-500 bg-purple-50' },
          { label:'Dokter Aktif',         value:'5 dokter',                 icon:Users,      color:'text-amber-500 bg-amber-50' },
        ].map(({ label, value, icon:Icon, color })=>(
          <div key={label} className="bg-white border border-gray-200 rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', color)}><Icon size={14}/></div>
              <span className="text-[11px] text-gray-400">{label}</span>
            </div>
            <div className="text-[17px] font-bold text-[#0f1d35]">{value}</div>
          </div>
        ))}
      </div>

      {/* Detail per dokter */}
      <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#0f1d35]">Detail Per Dokter — {selectedPeriod.period}</span>
          <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-semibold border',STATUS_BADGE[selectedPeriod.status])}>
            {selectedPeriod.status.charAt(0).toUpperCase()+selectedPeriod.status.slice(1)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-gray-200 bg-[#fafafa]">
              {['Dokter','Kode Share','Tindakan','Total Revenue','% Dokter','Jumlah Dokter','Override','Status','Aksi'].map((h)=>(
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {MOCK_ITEMS.map((item)=>(
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-[12px] font-semibold text-gray-800">{item.doctor}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">{item.share}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700">{item.tindakan}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-700">{formatRupiah(item.revenue)}</td>
                  <td className="px-4 py-3 text-xs text-blue-600 font-semibold">{item.pct}%</td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-bold text-emerald-600">
                      {formatRupiah(item.override ?? item.doctor_amt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.override ? (
                      <div>
                        <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-1.5 py-0.5 rounded">Override</span>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formatRupiah(item.override)}</div>
                      </div>
                    ) : <span className="text-gray-300 text-[10px]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border',item.status==='paid'?STATUS_BADGE.paid:STATUS_BADGE.pending)}>
                      {item.status==='paid'?'Dibayar':'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={()=>toast.success(`Cetak slip gaji ${item.doctor}`)} className="flex items-center gap-1 px-2 py-1 text-[10px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                        <FileText size={9}/>Slip
                      </button>
                      {item.status!=='paid' && (
                        <button onClick={()=>toast.success(`Payroll ${item.doctor} ditandai dibayar`)} className="flex items-center gap-1 px-2 py-1 text-[10px] bg-green-50 border border-green-200 rounded hover:bg-green-100 text-green-700">
                          <Check size={9}/>Bayar
                        </button>
                      )}
                      <button onClick={()=>{ const amt = prompt('Override amount:'); if(amt) toast.info(`Override: ${formatRupiah(Number(amt))}`); }} className="flex items-center gap-1 px-2 py-1 text-[10px] border border-gray-200 rounded hover:bg-gray-50 text-gray-600">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer totals */}
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-[#f8fafc]">
                <td className="px-4 py-3 text-[12px] font-bold text-gray-800" colSpan={2}>Total</td>
                <td className="px-4 py-3 text-xs font-bold text-gray-700">{MOCK_ITEMS.reduce((s,i)=>s+i.tindakan,0)}</td>
                <td className="px-4 py-3 text-xs font-bold">{formatRupiah(totalRevenue)}</td>
                <td className="px-4 py-3"/>
                <td className="px-4 py-3 text-[13px] font-bold text-emerald-600">{formatRupiah(totalDoctors)}</td>
                <td colSpan={3}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
