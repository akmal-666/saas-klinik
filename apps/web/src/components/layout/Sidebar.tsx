'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Calendar, FileText, CreditCard,
  BarChart2, Settings, Users, Clock, Package, Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',    icon: LayoutGrid, label: 'Dashboard' },
  { href: '/appointment',  icon: Calendar,   label: 'Appointment' },
  { href: '/emr',          icon: FileText,   label: 'Rekam Medis' },
  { href: '/kasir',        icon: CreditCard, label: 'Kasir' },
  { href: '/report',       icon: BarChart2,  label: 'Laporan' },
  null,
  { href: '/masterdata',   icon: Package,    label: 'Master Data' },
  { href: '/payroll',      icon: Banknote,   label: 'Payroll' },
  { href: '/settings',     icon: Settings,   label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[60px] bg-[#0f1d35] flex flex-col items-center flex-shrink-0 z-20">
      {/* Logo */}
      <div className="w-[60px] h-[54px] flex items-center justify-center border-b border-[#1a2d4a] flex-shrink-0">
        <div className="w-[38px] h-[38px] bg-white rounded-lg flex flex-col items-center justify-center">
          <span className="text-[8px] font-extrabold text-[#0f1d35] leading-none tracking-wide">AUDY</span>
          <span className="text-[6px] font-semibold text-blue-600 tracking-[1px]">DENTAL</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col items-center py-2 gap-0.5 flex-1">
        {NAV_ITEMS.map((item, i) => {
          if (item === null) {
            return <div key={i} className="w-8 h-px bg-[#1a2d4a] my-1" />;
          }
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'group relative w-11 h-11 flex items-center justify-center rounded-[10px] transition-all',
                isActive
                  ? 'bg-[#1a4a8a] text-white'
                  : 'text-[#6b8ab8] hover:bg-[#1a2d4a] hover:text-white',
              )}
            >
              <Icon size={18} strokeWidth={1.8} />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-[56px] z-50 whitespace-nowrap bg-[#0f1d35] text-white text-[11px] font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
