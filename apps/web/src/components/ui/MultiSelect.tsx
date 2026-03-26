'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  id: string;
  label: string;
  sublabel?: string;
  meta?: string;
  group?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxTagsShown?: number;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  maxTagsShown = 3,
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const wrapRef             = useRef<HTMLDivElement>(null);
  const searchRef           = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const toggle = useCallback((id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }, [value, onChange]);

  const remove = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  }, [value, onChange]);

  const clear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  }, [onChange]);

  // Filter + group
  const filtered = options.filter(
    (o) =>
      !query ||
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.sublabel?.toLowerCase().includes(query.toLowerCase()) ||
      o.group?.toLowerCase().includes(query.toLowerCase()),
  );

  const groups = filtered.reduce<Record<string, MultiSelectOption[]>>((acc, o) => {
    const g = o.group ?? 'Lainnya';
    if (!acc[g]) acc[g] = [];
    acc[g].push(o);
    return acc;
  }, {});

  const selectedOptions = options.filter((o) => value.includes(o.id));

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          'min-h-9 flex items-center flex-wrap gap-1 px-2 py-1 border rounded-lg bg-white cursor-pointer transition-all',
          open
            ? 'border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,.07)]'
            : 'border-gray-200 hover:border-blue-400',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
        )}
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedOptions.length === 0 && (
            <span className="text-xs text-gray-400 py-0.5">{placeholder}</span>
          )}
          {selectedOptions.slice(0, maxTagsShown).map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded px-1.5 py-0.5 text-[10px] font-medium max-w-[160px]"
            >
              <span className="truncate">{o.label}</span>
              <button
                type="button"
                onClick={(e) => remove(o.id, e)}
                className="text-blue-300 hover:text-blue-600 flex-shrink-0 leading-none"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {selectedOptions.length > maxTagsShown && (
            <span className="bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-[10px] font-medium">
              +{selectedOptions.length - maxTagsShown} lainnya
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {value.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-gray-300 hover:text-gray-500 p-0.5 rounded"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown
            size={12}
            className={cn('text-gray-400 transition-transform', open && 'rotate-180')}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-[300] bg-white border-[1.5px] border-blue-500 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,.12)] overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
              <Search size={12} className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="bg-transparent text-xs outline-none w-full text-gray-700 placeholder:text-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-[220px]">
            {Object.keys(groups).length === 0 && (
              <div className="py-6 text-center text-xs text-gray-400">Tidak ditemukan</div>
            )}
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.08em] bg-gray-50 border-b border-gray-100">
                  {group}
                </div>
                {items.map((opt) => {
                  const selected = value.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggle(opt.id)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors',
                        selected ? 'bg-blue-50' : 'hover:bg-gray-50',
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all',
                          selected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 bg-white',
                        )}
                      >
                        {selected && <Check size={9} strokeWidth={2.5} className="text-white" />}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-gray-800 font-medium truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[10px] text-gray-400">{opt.sublabel}</div>
                        )}
                      </div>

                      {/* Meta (e.g. price) */}
                      {opt.meta && (
                        <div className="text-[11px] font-semibold text-emerald-600 flex-shrink-0">
                          {opt.meta}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{value.length} dipilih</span>
            {value.length > 0 && (
              <button
                type="button"
                onClick={(e) => { clear(e); }}
                className="text-[11px] text-red-500 hover:underline font-medium"
              >
                Hapus semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
