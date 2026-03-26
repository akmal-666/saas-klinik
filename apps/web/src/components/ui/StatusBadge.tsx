'use client';
import { AppointmentStatus } from '@klinik/shared-types';
import { STATUS_CONFIG } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function StatusBadge({ status, size = 'md', dot = false }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
        cfg.bg, cfg.text, cfg.border,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
      {cfg.label}
    </span>
  );
}
