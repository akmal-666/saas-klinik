'use client';

import { useState, useRef, useEffect, useDeferredValue } from 'react';
import { Search, X, Check, ChevronDown, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICD10_DENTAL, ICD9_DENTAL } from '@klinik/shared-constants';
import type { Icd10Item, Icd9Item } from '@klinik/shared-constants';

// ─── ICD-10 Multi-Select ──────────────────────────────────

interface Icd10SelectProps {
  value: string[];
  onChange: (codes: string[]) => void;
  placeholder?: string;
}

export function Icd10Select({ value, onChange, placeholder = 'Cari kode ICD-10...' }: Icd10SelectProps) {
  const [open, setOpen]   = useState(false);
  const [raw, setRaw]     = useState('');
  const query             = useDeferredValue(raw);
  const wrapRef           = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  // Filter: search code, description, or category
  const filtered = ICD10_DENTAL.filter((item) => {
    if (!query) return item.billable; // show billable only when no search
    const q = query.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 60);

  // Group by category
  const grouped = filtered.reduce<Record<string, Icd10Item[]>>((acc, i) => {
    const g = i.category;
    if (!acc[g]) acc[g] = [];
    acc[g].push(i);
    return acc;
  }, {});

  const toggle = (code: string) => {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  };

  const selectedItems = value
    .map((c) => ICD10_DENTAL.find((i) => i.code === c))
    .filter(Boolean) as Icd10Item[];

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger */}
      <div
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'min-h-9 flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 border rounded-lg bg-white cursor-pointer transition-all',
          open ? 'border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,.07)]' : 'border-gray-200 hover:border-blue-300',
        )}
      >
        {selectedItems.length === 0 ? (
          <span className="text-xs text-gray-400 py-0.5">{placeholder}</span>
        ) : (
          selectedItems.map((item) => (
            <span
              key={item.code}
              className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded px-1.5 py-0.5 text-[10px] font-semibold"
            >
              <span className="font-mono">{item.code}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(item.code); }} className="text-blue-300 hover:text-blue-600">
                <X size={9} />
              </button>
            </span>
          ))
        )}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          {value.length > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange([]); }} className="text-gray-300 hover:text-gray-500 p-0.5">
              <X size={11} />
            </button>
          )}
          <ChevronDown size={11} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[400] top-[calc(100%+4px)] left-0 right-0 bg-white border-[1.5px] border-blue-500 rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,.15)] overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-400">
              <Search size={12} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Ketik kode (K02.1) atau nama diagnosa..."
                className="text-xs outline-none w-full bg-transparent text-gray-700 placeholder:text-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
              {raw && (
                <button type="button" onClick={() => setRaw('')} className="text-gray-300 hover:text-gray-500">
                  <X size={10} />
                </button>
              )}
            </div>
            {!raw && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                <AlertCircle size={9} />
                Menampilkan kode billable saja. Ketik untuk mencari semua kode.
              </div>
            )}
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-[280px]">
            {Object.keys(grouped).length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">Kode ICD-10 tidak ditemukan</div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="sticky top-0 px-3 py-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em] bg-[#f8fafc] border-b border-gray-100 z-10">
                    {cat}
                  </div>
                  {items.map((item) => {
                    const selected = value.includes(item.code);
                    return (
                      <div
                        key={item.code}
                        onClick={() => toggle(item.code)}
                        className={cn(
                          'flex items-start gap-2.5 px-3 py-2 cursor-pointer transition-colors border-b border-gray-50 last:border-0',
                          selected ? 'bg-blue-50' : 'hover:bg-gray-50',
                        )}
                      >
                        {/* Checkbox */}
                        <div className={cn(
                          'mt-0.5 w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all',
                          selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white',
                        )}>
                          {selected && <Check size={9} strokeWidth={2.5} className="text-white" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              {item.code}
                            </span>
                            {!item.billable && (
                              <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                                Header
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-gray-800 font-medium mt-0.5 leading-tight">
                            {item.description}
                          </div>
                          {item.notes && (
                            <div className="text-[10px] text-gray-400 mt-0.5 italic">{item.notes}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{value.length} kode dipilih · Standar ICD-10 Kemenkes RI</span>
            {value.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="text-[10px] text-red-500 hover:underline font-medium">
                Hapus semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ICD-9 Multi-Select ───────────────────────────────────

interface Icd9SelectProps {
  value: string[];
  onChange: (codes: string[]) => void;
}

export function Icd9Select({ value, onChange }: Icd9SelectProps) {
  const [open, setOpen]   = useState(false);
  const [raw, setRaw]     = useState('');
  const query             = useDeferredValue(raw);
  const wrapRef           = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const filtered = ICD9_DENTAL.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const grouped = filtered.reduce<Record<string, Icd9Item[]>>((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i);
    return acc;
  }, {});

  const toggle = (code: string) => {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  };

  const selectedItems = value
    .map((c) => ICD9_DENTAL.find((i) => i.code === c))
    .filter(Boolean) as Icd9Item[];

  return (
    <div ref={wrapRef} className="relative">
      <div
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'min-h-9 flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 border rounded-lg bg-white cursor-pointer transition-all',
          open ? 'border-teal-500 shadow-[0_0_0_3px_rgba(13,148,136,.07)]' : 'border-gray-200 hover:border-teal-300',
        )}
      >
        {selectedItems.length === 0 ? (
          <span className="text-xs text-gray-400 py-0.5">Pilih kode tindakan ICD-9-CM...</span>
        ) : (
          selectedItems.map((item) => (
            <span
              key={item.code}
              className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 rounded px-1.5 py-0.5 text-[10px] font-semibold"
            >
              <span className="font-mono">{item.code}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(item.code); }} className="text-teal-300 hover:text-teal-600">
                <X size={9} />
              </button>
            </span>
          ))
        )}
        <div className="ml-auto flex-shrink-0">
          <ChevronDown size={11} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
        </div>
      </div>

      {open && (
        <div className="absolute z-[400] top-[calc(100%+4px)] left-0 right-0 bg-white border-[1.5px] border-teal-500 rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,.15)] overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-teal-400">
              <Search size={12} className="text-gray-400" />
              <input
                ref={inputRef}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="Cari kode atau nama tindakan..."
                className="text-xs outline-none w-full bg-transparent text-gray-700 placeholder:text-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
              {raw && <button type="button" onClick={() => setRaw('')} className="text-gray-300"><X size={10} /></button>}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[260px]">
            {Object.keys(grouped).length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">Kode ICD-9 tidak ditemukan</div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="sticky top-0 px-3 py-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em] bg-[#f0fdfa] border-b border-teal-50 z-10">
                    {cat}
                  </div>
                  {items.map((item) => {
                    const sel = value.includes(item.code);
                    return (
                      <div
                        key={item.code}
                        onClick={() => toggle(item.code)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors border-b border-gray-50 last:border-0',
                          sel ? 'bg-teal-50' : 'hover:bg-gray-50',
                        )}
                      >
                        <div className={cn(
                          'w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0',
                          sel ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-white',
                        )}>
                          {sel && <Check size={9} strokeWidth={2.5} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                              {item.code}
                            </span>
                          </div>
                          <div className="text-[12px] text-gray-800 font-medium mt-0.5">{item.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{value.length} tindakan dipilih · ICD-9-CM Kemenkes RI</span>
            {value.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="text-[10px] text-red-500 hover:underline font-medium">
                Hapus semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
