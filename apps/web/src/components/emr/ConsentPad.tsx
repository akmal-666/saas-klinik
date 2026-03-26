'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { PenLine, RotateCcw, Check, AlertCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsentPadProps {
  clinicName?: string;
  doctorName?: string;
  patientName?: string;
  treatments?: string[];
  onSigned: (signatureDataUrl: string) => void;
  onClear?: () => void;
  signed?: boolean;
  signedAt?: string;
  signerName?: string;
}

export function ConsentPad({
  clinicName = 'Audy Dental',
  doctorName,
  patientName,
  treatments = [],
  onSigned,
  onClear,
  signed = false,
  signedAt,
  signerName,
}: ConsentPadProps) {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]   = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const [agreed, setAgreed]     = useState(signed);
  const [lastPos, setLastPos]   = useState({ x: 0, y: 0 });

  useEffect(() => {
    setAgreed(signed);
  }, [signed]);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = '#0f1d35';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (signed) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setLastPos(pos);
    setDrawing(true);
  }, [signed]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || signed) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
    setHasStroke(true);
  }, [drawing, signed]);

  const stopDraw = useCallback(() => {
    setDrawing(false);
  }, []);

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onClear?.();
  };

  const submitSignature = () => {
    if (!hasStroke || !agreed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSigned(dataUrl);
  };

  return (
    <div className="border border-gray-200 rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <Shield size={14} className="text-blue-500" />
        <span className="text-[12px] font-bold text-gray-700">Informed Consent Digital</span>
        {signed && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
            <Check size={9} />
            Ditandatangani
          </span>
        )}
      </div>

      {/* Consent text */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="text-[11px] text-gray-600 leading-[1.75] space-y-2">
          <p>
            Saya yang bertanda tangan di bawah ini menyatakan bahwa saya{' '}
            <strong className="text-gray-800">{patientName ? `(${patientName})` : ''}</strong>{' '}
            telah mendapat penjelasan yang cukup dari{' '}
            <strong className="text-gray-800">{doctorName || 'dokter yang merawat'}</strong>{' '}
            di <strong className="text-gray-800">{clinicName}</strong> mengenai:
          </p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li>Kondisi kesehatan saya saat ini</li>
            <li>Rencana tindakan medis yang akan dilakukan{treatments.length > 0 && `: ${treatments.join(', ')}`}</li>
            <li>Risiko dan manfaat dari tindakan tersebut</li>
            <li>Alternatif pengobatan yang tersedia</li>
            <li>Konsekuensi apabila tindakan tidak dilakukan</li>
          </ul>
          <p>
            Dengan ini saya <strong className="text-gray-800">menyetujui dan bersedia</strong> menjalani prosedur
            yang telah dijelaskan. Saya memahami bahwa saya dapat mengajukan pertanyaan
            kapan saja dan berhak untuk menolak atau membatalkan persetujuan ini.
          </p>
        </div>

        {/* Checkbox agreement */}
        <label className={cn(
          'flex items-start gap-2.5 mt-3 p-3 rounded-lg border cursor-pointer transition-all',
          agreed
            ? 'bg-green-50 border-green-200'
            : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-blue-50',
          signed && 'cursor-default',
        )}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => !signed && setAgreed(e.target.checked)}
            disabled={signed}
            className="mt-0.5 accent-blue-600 cursor-pointer"
          />
          <span className="text-[11px] text-gray-700 leading-tight">
            Saya telah membaca dan <strong>memahami</strong> seluruh informasi di atas dan
            menyetujui dilakukannya tindakan medis tersebut.
          </span>
        </label>
      </div>

      {/* Signature area */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5">
            <PenLine size={12} className="text-gray-400" />
            {signed ? 'Tanda Tangan' : 'Tanda Tangan Pasien / Wali'}
          </span>
          {!signed && (
            <button
              type="button"
              onClick={clearPad}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw size={10} />
              Hapus
            </button>
          )}
        </div>

        <div className={cn(
          'border rounded-lg overflow-hidden relative',
          signed ? 'border-green-200 bg-green-50/30' : 'border-dashed border-gray-300 hover:border-blue-300',
          !signed && agreed && 'border-blue-300',
        )}>
          <canvas
            ref={canvasRef}
            width={560}
            height={120}
            className="w-full block"
            style={{ cursor: signed ? 'default' : agreed ? 'crosshair' : 'not-allowed', height: 120 }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasStroke && !signed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[11px] text-gray-300">
                {agreed ? 'Tanda tangan di sini' : 'Centang persetujuan terlebih dahulu'}
              </span>
            </div>
          )}
          {signed && signedAt && (
            <div className="absolute bottom-2 right-3 text-[9px] text-green-500 font-medium">
              ✓ {signerName} — {new Date(signedAt).toLocaleString('id-ID')}
            </div>
          )}
        </div>

        {!agreed && !signed && (
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-600">
            <AlertCircle size={10} />
            Centang persetujuan di atas sebelum menandatangani
          </div>
        )}

        {!signed && (
          <button
            type="button"
            onClick={submitSignature}
            disabled={!hasStroke || !agreed}
            className={cn(
              'mt-3 w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all',
              hasStroke && agreed
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            )}
          >
            <Check size={13} />
            Simpan Tanda Tangan & Konfirmasi Consent
          </button>
        )}
      </div>
    </div>
  );
}
