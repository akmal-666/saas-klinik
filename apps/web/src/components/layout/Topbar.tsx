'use client';
import { Bell, MapPin, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getInitials } from '@/lib/utils';

export function Topbar() {
  const { user, clinic } = useAuthStore();

  return (
    <header className="h-[54px] bg-white border-b border-gray-200 flex items-center px-5 gap-3 flex-shrink-0 z-10">
      <span className="text-sm font-bold text-[#0f1d35] whitespace-nowrap">
        Clinic Information System
      </span>
      <div className="w-px h-5 bg-gray-200" />

      {/* Global search */}
      <div className="flex items-center gap-2 bg-[#f4f6f9] border border-gray-200 rounded-lg px-3 py-1.5 w-52">
        <Search size={13} className="text-gray-400 flex-shrink-0" />
        <input
          placeholder="Cari pasien, appointment..."
          className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder:text-gray-400"
        />
      </div>

      <div className="flex-1" />

      {/* Clinic badge */}
      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 cursor-pointer">
        <MapPin size={13} className="text-blue-600" />
        <span className="text-xs text-blue-700 font-medium">
          {clinic?.name} {clinic?.branch}
        </span>
      </div>

      {/* Notifications */}
      <button className="relative w-[34px] h-[34px] flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
        <Bell size={15} />
        <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white" />
      </button>

      {/* User menu */}
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
        <div className="w-7 h-7 rounded-full bg-[#0f1d35] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
          {user ? getInitials(user.name) : '?'}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-900 leading-tight">{user?.name}</span>
          <span className="text-[10px] text-gray-400 capitalize">{user?.role.replace('_', ' ')}</span>
        </div>
        <ChevronDown size={12} className="text-gray-400" />
      </div>
    </header>
  );
}
