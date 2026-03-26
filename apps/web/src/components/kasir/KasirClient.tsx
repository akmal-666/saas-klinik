'use client';

import { useState, useCallback } from 'react';
import {
  Search, Plus, Trash2, Tag, CreditCard, Banknote,
  Smartphone, Building2, Shield, Wallet, Check,
  Printer, ChevronRight, AlertCircle, X, Loader2,
  Receipt, History, ArrowUpCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatRupiah, formatDateId, getAge } from '@/lib/utils';
import { PaymentMethod } from '@klinik/shared-types';
import { PAYMENT_METHOD_LABEL } from '@klinik/shared-constants';

// ─── Mock data ────────────────────────────────────────────
const MOCK_PATIENTS = [
  { id:'p1', rm:'RM-20260323-00001', name:'Rizky Aditya Pratama',  dob:'1992-05-14', gender:'L', phone:'08211234567', insurance:'BPJS',    deposit: 150_000 },
  { id:'p2', rm:'RM-20260323-00002', name:'Dewi Santoso Putri',    dob:'1988-11-22', gender:'P', phone:'08221234568', insurance:null,      deposit: 0 },
  { id:'p3', rm:'RM-20260323-00003', name:'Budi Laksono',          dob:'1975-03-08', gender:'L', phone:'08231234569', insurance:'Allianz', deposit: 500_000 },
  { id:'p4', rm:'RM-20260323-00004', name:'Indah Permatasari',     dob:'1995-07-30', gender:'P', phone:'08241234570', insurance:null,      deposit: 0 },
];

const MOCK_TREATMENTS = [
  { id:'tr1',  name:'Tambal Gigi Komposit Anterior',  price:350_000,  cat:'Konservasi', dur:45 },
  { id:'tr2',  name:'Tambal Gigi Komposit Posterior', price:450_000,  cat:'Konservasi', dur:60 },
  { id:'tr3',  name:'Perawatan Saluran Akar (PSA)',   price:750_000,  cat:'Konservasi', dur:90 },
  { id:'tr5',  name:'Scaling & Polishing',            price:280_000,  cat:'Periodonsi', dur:60 },
  { id:'tr8',  name:'Pasang Behel Metal',             price:4_500_000,cat:'Ortodonsi',  dur:90 },
  { id:'tr9',  name:'Kontrol Behel',                  price:250_000,  cat:'Ortodonsi',  dur:30 },
  { id:'tr11', name:'Pencabutan Gigi Susu',           price:120_000,  cat:'Bedah',      dur:20 },
  { id:'tr12', name:'Pencabutan Gigi Permanen',       price:250_000,  cat:'Bedah',      dur:30 },
  { id:'tr13', name:'Odontektomi (Wisdom Tooth)',     price:1_500_000,cat:'Bedah',      dur:120},
  { id:'tr14', name:'Bleaching / Whitening',          price:1_800_000,cat:'Estetik',    dur:90 },
  { id:'tr16', name:'Rontgen Periapikal',             price:80_000,   cat:'Radiologi',  dur:10 },
  { id:'tr17', name:'Rontgen Panoramik',              price:250_000,  cat:'Radiologi',  dur:15 },
];

const MOCK_INVOICES = [
  { id:'inv1', number:'INV-20260323-001', patient:'Rizky Aditya Pratama', date:'2026-03-23', total:430_000,  paid:430_000,  status:'paid',    method:'Tunai' },
  { id:'inv2', number:'INV-20260322-003', patient:'Budi Laksono',         date:'2026-03-22', total:250_000,  paid:250_000,  status:'paid',    method:'QRIS' },
  { id:'inv3', number:'INV-20260322-002', patient:'Dewi Santoso Putri',   date:'2026-03-22', total:280_000,  paid:0,        status:'partial', method:'Asuransi' },
  { id:'inv4', number:'INV-20260321-005', patient:'Indah Permatasari',    date:'2026-03-21', total:1_800_000,paid:900_000,  status:'partial', method:'Transfer' },
];

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  cash: Banknote, card: CreditCard, qris: Smartphone,
  transfer: Building2, insurance: Shield, deposit: Wallet,
};

// ─── Tab bar ─────────────────────────────────────────────
type Tab = 'checkout' | 'history' | 'deposit';

export function KasirClient() {
  const [tab, setTab] = useState<Tab>('checkout');

  return (
    <div className="h-[calc(100vh-54px)] flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white px-6 flex-shrink-0">
        {([
          ['checkout', 'Checkout', Receipt],
          ['history',  'Riwayat Transaksi', History],
          ['deposit',  'Deposit Pasien', Wallet],
        ] as [Tab, string, React.ElementType][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 transition-all',
              tab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {tab === 'checkout' && <CheckoutTab />}
      {tab === 'history'  && <HistoryTab />}
      {tab === 'deposit'  && <DepositTab />}
    </div>
  );
}

// ══════════════════════════════════════════════
// CHECKOUT TAB
// ══════════════════════════════════════════════

interface CartItem { id: string; name: string; price: number; qty: number; cat: string; }

function CheckoutTab() {
  const [patientSearch, setPatientSearch] = useState('');
  const [patient, setPatient] = useState<typeof MOCK_PATIENTS[0] | null>(null);
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [payments, setPayments] = useState<{ method: PaymentMethod; amount: number }[]>([]);
  const [voucherCode, setVoucher] = useState('');
  const [discount, setDiscount]   = useState(0);
  const [voucherApplied, setVoucherApplied] = useState('');
  const [treatSearch, setTreatSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const filteredPatients = MOCK_PATIENTS.filter((p) =>
    !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.rm.includes(patientSearch),
  );
  const filteredTreatments = MOCK_TREATMENTS.filter((t) =>
    !treatSearch || t.name.toLowerCase().includes(treatSearch.toLowerCase()) || t.cat.toLowerCase().includes(treatSearch.toLowerCase()),
  );

  const addItem = (t: typeof MOCK_TREATMENTS[0]) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === t.id);
      return ex ? prev.map((i) => i.id === t.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...t, qty: 1 }];
    });
  };
  const removeItem  = (id: string) => setCart((p) => p.filter((i) => i.id !== id));
  const changeQty   = (id: string, d: number) => setCart((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalAfterDiscount = Math.max(0, subtotal - discount);
  const totalPaid   = payments.reduce((s, p) => s + p.amount, 0);
  const remaining   = totalAfterDiscount - totalPaid;

  const addPayment  = (method: PaymentMethod) => {
    const toPay = Math.max(0, remaining);
    if (toPay <= 0) return;
    if (method === PaymentMethod.DEPOSIT && patient) {
      if (patient.deposit <= 0) { toast.error('Saldo deposit kosong'); return; }
      const useAmount = Math.min(patient.deposit, toPay);
      setPayments((p) => [...p.filter((x) => x.method !== method), { method, amount: useAmount }]);
    } else {
      setPayments((p) => [...p.filter((x) => x.method !== method), { method, amount: toPay }]);
    }
  };
  const removePayment = (method: PaymentMethod) => setPayments((p) => p.filter((x) => x.method !== method));

  const applyVoucher = () => {
    if (!voucherCode.trim()) return;
    if (voucherCode.toUpperCase() === 'DENTAL20') {
      const d = Math.min(subtotal * 0.2, 500_000);
      setDiscount(d); setVoucherApplied('DENTAL20');
      toast.success(`Voucher DENTAL20 — diskon ${formatRupiah(d)}`);
    } else if (voucherCode.toUpperCase() === 'SCALING50K') {
      setDiscount(50_000); setVoucherApplied('SCALING50K');
      toast.success('Voucher SCALING50K — diskon Rp 50.000');
    } else {
      toast.error('Kode voucher tidak valid');
    }
  };

  const processPayment = async () => {
    if (!patient || cart.length === 0) return;
    if (remaining > 0) { toast.error(`Masih kurang ${formatRupiah(remaining)}`); return; }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    setProcessing(false);
    setShowReceipt(true);
  };

  const reset = () => {
    setPatient(null); setCart([]); setPayments([]);
    setVoucher(''); setDiscount(0); setVoucherApplied('');
    setShowReceipt(false);
  };

  if (showReceipt) return <ReceiptView patient={patient!} cart={cart} payments={payments} total={totalAfterDiscount} discount={discount} onClose={reset} />;

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left: patient + treatments */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Patient selector */}
        <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#0f1d35]">Pasien</span>
            {patient && <button onClick={() => setPatient(null)} className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1"><X size={11}/>Ganti</button>}
          </div>
          {patient ? (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0f1d35] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {patient.name.split(' ').slice(0,2).map((n)=>n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-gray-900">{patient.name}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-[10px] text-blue-600">{patient.rm}</span>
                  <span className="text-[10px] text-gray-400">{getAge(patient.dob)} thn</span>
                  {patient.insurance && <span className="text-[10px] bg-sky-50 text-sky-600 border border-sky-200 px-1.5 py-0.5 rounded">{patient.insurance}</span>}
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1"><Wallet size={9}/>Deposit: {formatRupiah(patient.deposit)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
                <Search size={12} className="text-gray-400"/>
                <input value={patientSearch} onChange={(e)=>setPatientSearch(e.target.value)} placeholder="Cari nama atau nomor RM..." className="text-xs bg-transparent outline-none flex-1 text-gray-700"/>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-gray-50">
                {filteredPatients.map((p)=>(
                  <div key={p.id} onClick={()=>{ setPatient(p); setPatientSearch(''); }} className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-blue-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600 flex-shrink-0">
                      {p.name.split(' ').slice(0,2).map((n)=>n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-gray-800">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{p.rm}</div>
                    </div>
                    {p.deposit > 0 && <span className="ml-auto text-[10px] text-emerald-600 font-semibold">{formatRupiah(p.deposit)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Treatment picker */}
        <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Search size={12} className="text-gray-400"/>
              <input value={treatSearch} onChange={(e)=>setTreatSearch(e.target.value)} placeholder="Cari treatment untuk ditambahkan..." className="text-xs bg-transparent outline-none flex-1 text-gray-700 placeholder:text-gray-400"/>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {filteredTreatments.map((t)=>(
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-gray-800">{t.name}</div>
                  <div className="text-[10px] text-gray-400">{t.cat} · {t.dur} mnt</div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">{formatRupiah(t.price)}</span>
                <button onClick={()=>addItem(t)} className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 flex-shrink-0"><Plus size={13}/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#0f1d35]">Item ({cart.length})</span>
              <button onClick={()=>setCart([])} className="text-[10px] text-red-400 hover:text-red-600">Hapus semua</button>
            </div>
            {cart.map((item)=>(
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-gray-800">{item.name}</div>
                  <div className="text-[10px] text-gray-400">{formatRupiah(item.price)} / item</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>changeQty(item.id,-1)} className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm leading-none">−</button>
                  <span className="text-xs font-semibold w-5 text-center">{item.qty}</span>
                  <button onClick={()=>changeQty(item.id,1)} className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 text-sm leading-none">+</button>
                </div>
                <span className="text-[12px] font-bold text-gray-800 min-w-[80px] text-right">{formatRupiah(item.price * item.qty)}</span>
                <button onClick={()=>removeItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: payment panel */}
      <div className="w-[320px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[13px] font-bold text-[#0f1d35]">Pembayaran</div>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Totals */}
          <div className="space-y-1.5">
            {[['Subtotal', formatRupiah(subtotal)],
              discount > 0 && [`Diskon (${voucherApplied})`, `− ${formatRupiah(discount)}`],
              ['Total', formatRupiah(totalAfterDiscount)],
            ].filter(Boolean).map(([l,v]: any) => (
              <div key={l} className={cn('flex justify-between text-xs', l==='Total'?'font-bold text-[#0f1d35] text-sm border-t border-dashed border-gray-200 pt-1.5 mt-1.5':'text-gray-500')}>
                <span>{l}</span><span className={l==='Total'?'text-blue-600':l.startsWith('Diskon')?'text-green-600':''}>{v}</span>
              </div>
            ))}
          </div>

          {/* Voucher */}
          {!voucherApplied ? (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <Tag size={11} className="text-gray-400"/>
                <input value={voucherCode} onChange={(e)=>setVoucher(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&applyVoucher()} placeholder="Kode voucher..." className="text-xs bg-transparent outline-none flex-1 text-gray-700"/>
              </div>
              <button onClick={applyVoucher} className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100">Pakai</button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-purple-700"><Tag size={11}/><span className="font-mono font-bold">{voucherApplied}</span> — {formatRupiah(discount)}</div>
              <button onClick={()=>{setDiscount(0);setVoucherApplied('');setVoucher('');}} className="text-purple-300 hover:text-red-500"><X size={12}/></button>
            </div>
          )}

          {/* Payment methods */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Metode Pembayaran</div>
            <div className="grid grid-cols-3 gap-2">
              {([
                [PaymentMethod.CASH,      'Tunai'],
                [PaymentMethod.CARD,      'Kartu'],
                [PaymentMethod.QRIS,      'QRIS'],
                [PaymentMethod.TRANSFER,  'Transfer'],
                [PaymentMethod.INSURANCE, 'Asuransi'],
                [PaymentMethod.DEPOSIT,   `Deposit${patient?` (${formatRupiah(patient.deposit)})`:''}`],
              ] as [PaymentMethod,string][]).map(([method, label]) => {
                const Icon = PAYMENT_ICONS[method];
                const active = payments.some((p)=>p.method===method);
                return (
                  <button
                    key={method}
                    onClick={()=> active ? removePayment(method) : addPayment(method)}
                    disabled={method===PaymentMethod.DEPOSIT && (!patient || patient.deposit<=0)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-[10px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                      active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50',
                    )}
                  >
                    <Icon size={15}/>{label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active payment amounts */}
          {payments.length > 0 && (
            <div className="space-y-2">
              {payments.map((p) => {
                const Icon = PAYMENT_ICONS[p.method];
                const label = PAYMENT_METHOD_LABEL[p.method];
                return (
                  <div key={p.method} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Icon size={13} className="text-gray-500 flex-shrink-0"/>
                    <span className="text-xs text-gray-700 flex-1">{label}</span>
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => setPayments((prev) => prev.map((x) => x.method===p.method ? { ...x, amount: parseFloat(e.target.value)||0 } : x))}
                      className="w-28 text-right text-xs font-semibold border-none bg-transparent outline-none text-gray-900"
                    />
                    <button onClick={()=>removePayment(p.method)} className="text-gray-300 hover:text-red-400"><X size={11}/></button>
                  </div>
                );
              })}
              <div className={cn('flex justify-between text-xs font-bold px-1', remaining>0?'text-red-500':'text-emerald-600')}>
                <span>{remaining>0?'Kurang':'Kembalian'}</span>
                <span>{formatRupiah(Math.abs(remaining))}</span>
              </div>
            </div>
          )}

          {/* Validation warnings */}
          {cart.length === 0 && <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"><AlertCircle size={12}/>Belum ada item</div>}
          {!patient && <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"><AlertCircle size={12}/>Pilih pasien</div>}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 space-y-2">
          <button
            onClick={processPayment}
            disabled={processing || cart.length===0 || !patient || remaining>0}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? <Loader2 size={13} className="animate-spin"/> : <Check size={13}/>}
            Proses Pembayaran {totalAfterDiscount>0 && `— ${formatRupiah(totalAfterDiscount)}`}
          </button>
          <button className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Printer size={12}/>Cetak Invoice Sementara
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// RECEIPT VIEW
// ──────────────────────────────────────────────
function ReceiptView({ patient, cart, payments, total, discount, onClose }: any) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-y-auto">
      <div className="bg-white rounded-[12px] w-96 shadow-[0_4px_24px_rgba(0,0,0,.12)] overflow-hidden">
        <div className="bg-[#0f1d35] text-white text-center px-6 py-5">
          <div className="text-xs font-bold tracking-[0.15em] opacity-70 mb-1">KLINIK AUDY DENTAL</div>
          <div className="text-[10px] opacity-50">Muara Karang · 021-12345678</div>
          <div className="mt-3 text-lg font-bold">Lunas ✓</div>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="flex justify-between text-xs text-gray-500"><span>Pasien</span><span className="font-semibold text-gray-800">{patient.name}</span></div>
          <div className="flex justify-between text-xs text-gray-500"><span>No. RM</span><span className="font-mono text-gray-600">{patient.rm}</span></div>
          <div className="flex justify-between text-xs text-gray-500"><span>Tanggal</span><span>{formatDateId(new Date().toISOString())}</span></div>
          <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5">
            {cart.map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-gray-700">{item.name} ×{item.qty}</span>
                <span className="font-medium">{formatRupiah(item.price*item.qty)}</span>
              </div>
            ))}
          </div>
          {discount>0 && <div className="flex justify-between text-xs text-green-600 border-t border-dashed border-gray-100 pt-2"><span>Diskon</span><span>− {formatRupiah(discount)}</span></div>}
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-200 pt-2">
            <span>Total</span><span className="text-blue-600">{formatRupiah(total)}</span>
          </div>
          <div className="space-y-1">
            {payments.map((p: any)=>(
              <div key={p.method} className="flex justify-between text-xs text-gray-500">
                <span>{PAYMENT_METHOD_LABEL[p.method]}</span><span>{formatRupiah(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-5 space-y-2">
          <button onClick={()=>window.print()} className="w-full flex items-center justify-center gap-2 py-2 bg-[#0f1d35] text-white text-xs font-medium rounded-lg hover:bg-[#1a2d4a]"><Printer size={12}/>Cetak Struk</button>
          <button onClick={onClose} className="w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Transaksi Baru</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// HISTORY TAB
// ──────────────────────────────────────────────
function HistoryTab() {
  const statusStyle: Record<string,string> = {
    paid:'bg-green-50 text-green-700 border-green-200',
    partial:'bg-amber-50 text-amber-700 border-amber-200',
    issued:'bg-blue-50 text-blue-700 border-blue-200',
    cancelled:'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-[#0f1d35]">Riwayat Transaksi</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Search size={12} className="text-gray-400"/>
            <input placeholder="Cari..." className="text-xs outline-none bg-transparent w-36"/>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50"><RefreshCw size={12}/>Export</button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-[#fafafa]">
              {['No. Invoice','Tanggal','Pasien','Total','Dibayar','Metode','Status','Aksi'].map((h)=>(
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_INVOICES.map((inv)=>(
              <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-[11px] text-gray-700">{inv.number}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{formatDateId(inv.date)}</td>
                <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{inv.patient}</td>
                <td className="px-4 py-2.5 text-xs font-semibold">{formatRupiah(inv.total)}</td>
                <td className="px-4 py-2.5 text-xs text-emerald-600 font-semibold">{formatRupiah(inv.paid)}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{inv.method}</td>
                <td className="px-4 py-2.5">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border',statusStyle[inv.status])}>
                    {inv.status==='paid'?'Lunas':inv.status==='partial'?'Sebagian':inv.status==='issued'?'Belum Bayar':'Batal'}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <button className="text-[11px] text-blue-500 hover:underline">Detail</button>
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
// DEPOSIT TAB
// ──────────────────────────────────────────────
function DepositTab() {
  const [selected, setSelected] = useState<typeof MOCK_PATIENTS[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const handleTopUp = () => {
    if (!selected || !amount || isNaN(Number(amount))) { toast.error('Lengkapi data'); return; }
    toast.success(`Top-up deposit ${formatRupiah(Number(amount))} berhasil untuk ${selected.name}`);
    setAmount(''); setSelected(null);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-start gap-6">
        {/* Top-up form */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <ArrowUpCircle size={14} className="text-emerald-500"/>
              <span className="text-[12px] font-bold text-[#0f1d35]">Top-up Deposit Pasien</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Pilih Pasien</label>
                <select onChange={(e)=>setSelected(MOCK_PATIENTS.find((p)=>p.id===e.target.value)||null)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-400 bg-white appearance-none">
                  <option value="">-- Pilih Pasien --</option>
                  {MOCK_PATIENTS.map((p)=><option key={p.id} value={p.id}>{p.name} ({p.rm})</option>)}
                </select>
              </div>
              {selected && (
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-[10px] text-emerald-600 font-medium">Saldo saat ini</div>
                  <div className="text-[15px] font-bold text-emerald-700">{formatRupiah(selected.deposit)}</div>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Jumlah Top-up</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                  <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0" className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-blue-400"/>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {[100_000,250_000,500_000,1_000_000].map((v)=>(
                    <button key={v} onClick={()=>setAmount(String(v))} className="flex-1 py-1 text-[9px] font-medium bg-gray-50 border border-gray-200 rounded text-gray-600 hover:bg-blue-50 hover:border-blue-200">
                      {v>=1_000_000?`${v/1_000_000}Jt`:`${v/1_000}K`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([PaymentMethod.CASH,PaymentMethod.QRIS,PaymentMethod.TRANSFER] as PaymentMethod[]).map((m)=>(
                    <button key={m} onClick={()=>setMethod(m)} className={cn('py-1.5 text-[10px] font-medium rounded-lg border',method===m?'bg-[#0f1d35] text-white border-[#0f1d35]':'bg-white text-gray-600 border-gray-200 hover:border-gray-300')}>
                      {PAYMENT_METHOD_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleTopUp} className="w-full py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700">
                Top-up Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Deposit list */}
        <div className="flex-1 bg-white border border-gray-200 rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100"><span className="text-[12px] font-bold text-[#0f1d35]">Saldo Deposit Semua Pasien</span></div>
          <table className="w-full border-collapse">
            <thead><tr className="border-b border-gray-200 bg-[#fafafa]">
              {['Pasien','No. RM','Saldo','Terakhir Transaksi','Aksi'].map((h)=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {MOCK_PATIENTS.map((p)=>(
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="text-[12px] font-semibold text-gray-800">{p.name}</div></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{p.rm}</td>
                  <td className="px-4 py-3"><span className={cn('text-[13px] font-bold',p.deposit>0?'text-emerald-600':'text-gray-400')}>{formatRupiah(p.deposit)}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">—</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>setSelected(p)} className="text-[11px] text-blue-500 hover:underline">Top-up</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
