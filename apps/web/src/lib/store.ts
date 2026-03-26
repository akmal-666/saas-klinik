import { create } from 'zustand';

const isBrowser = typeof window !== 'undefined';
import { persist } from 'zustand/middleware';
import { UserRole } from '@klinik/shared-types';
import { ROLE_PERMISSIONS, Permission } from '@klinik/shared-constants';

// ─── Auth Store ───────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinic_id: string;
  avatar_url?: string;
}

interface Clinic {
  id: string;
  name: string;
  branch: string;
  logo_url?: string;
}

interface AuthState {
  user: AuthUser | null;
  clinic: Clinic | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;

  login: (params: {
    user: AuthUser;
    clinic: Clinic;
    access_token: string;
    refresh_token: string;
  }) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  setClinic: (clinic: Clinic) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      clinic: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,

      login: ({ user, clinic, access_token, refresh_token }) => {
        if (isBrowser) localStorage.setItem('klinik_access_token', access_token);
        if (isBrowser) localStorage.setItem('klinik_refresh_token', refresh_token);
        set({ user, clinic, access_token, refresh_token, isAuthenticated: true });
      },

      logout: () => {
        if (isBrowser) localStorage.removeItem('klinik_access_token');
        if (isBrowser) localStorage.removeItem('klinik_refresh_token');
        set({ user: null, clinic: null, access_token: null, refresh_token: null, isAuthenticated: false });
      },

      hasPermission: (permission) => {
        const role = get().user?.role;
        if (!role) return false;
        return (ROLE_PERMISSIONS[role] || []).includes(permission);
      },

      setClinic: (clinic) => set({ clinic }),
    }),
    {
      name: 'klinik-auth',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null;
          return localStorage.getItem(key);
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') localStorage.setItem(key, value);
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') localStorage.removeItem(key);
        },
      },
      partialize: (s) => ({
        user: s.user,
        clinic: s.clinic,
        access_token: s.access_token,
        refresh_token: s.refresh_token,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);

// ─── UI Store ─────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  calendarDate: Date;
  calendarView: 'calendar' | 'list';
  activeModal: string | null;

  setSidebarOpen: (v: boolean) => void;
  setCalendarDate: (d: Date) => void;
  setCalendarView: (v: 'calendar' | 'list') => void;
  openModal: (name: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  calendarDate: new Date(),
  calendarView: 'calendar',
  activeModal: null,

  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setCalendarDate: (d) => set({ calendarDate: d }),
  setCalendarView: (v) => set({ calendarView: v }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
}));
