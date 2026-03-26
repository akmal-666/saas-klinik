'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const schema = z.object({
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

function LoginPageInner() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  // Show expired message
  useEffect(() => {
    if (params.get('expired')) toast.warning('Sesi telah berakhir, silakan login kembali');
  }, [params]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@audydental.co.id', password: 'demo1234', remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setApiError('');
    try {
      const { data } = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { access_token, refresh_token, user } = data.data;

      document.cookie = `klinik_access_token=${access_token}; path=/; max-age=${values.remember ? 7 * 86400 : 86400}; SameSite=Lax`;

      login({
        user:   { id: user.id, email: user.email, name: user.name, role: user.role, clinic_id: user.clinic_id },
        clinic: { id: user.clinic_id, name: 'Audy Dental', branch: 'Muara Karang' },
        access_token,
        refresh_token,
      });

      toast.success(`Selamat datang, ${user.name.split(' ')[0]}!`);
      const redirect = params.get('redirect') || '/dashboard';
      router.replace(redirect);
    } catch (err: any) {
      // If backend is unreachable → auto fallback to demo mode
      const isNetworkError = !err?.response;
      if (isNetworkError) {
        toast.info('Backend tidak aktif — masuk dalam mode Demo');
        await demoLogin();
        return;
      }
      const msg = err?.response?.data?.error?.message || 'Email atau password salah';
      setApiError(msg);
    }
  };

  // Demo login shortcut — bypass API entirely
  const demoLogin = async () => {
    // Set cookie FIRST before calling login() to avoid race with middleware
    document.cookie = 'klinik_access_token=demo_token; path=/; max-age=86400; SameSite=Lax';

    login({
      user:   { id: 'u1', email: 'admin@audydental.co.id', name: 'Bukhori Akmal', role: 'admin_klinik' as any, clinic_id: 'c1' },
      clinic: { id: 'c1', name: 'Audy Dental', branch: 'Muara Karang' },
      access_token:  'demo_token',
      refresh_token: 'demo_refresh',
    });

    toast.success('Selamat datang, Bukhori! 👋');
    // Small delay so Zustand store persists before navigation
    await new Promise(r => setTimeout(r, 150));
    router.replace('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[45%] bg-[#0f1d35] flex-col items-center justify-center px-16 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}/>
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-2xl flex flex-col items-center justify-center mx-auto mb-8 shadow-[0_8px_32px_rgba(0,0,0,.3)]">
            <span className="text-base font-black text-[#0f1d35] leading-none tracking-tight">AUDY</span>
            <span className="text-[9px] font-bold text-blue-600 tracking-[2px] mt-0.5">DENTAL</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Klinik Management</h1>
          <p className="text-[#6b8ab8] text-sm leading-relaxed max-w-xs">
            Sistem manajemen klinik terintegrasi — appointment, EMR, kasir, dan laporan dalam satu platform.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3 text-left">
            {[
              ['Appointment & Kalender Dokter', 'Jadwal visual real-time'],
              ['Rekam Medis Digital (EMR)', 'SOAP + ICD-10 + SATUSEHAT'],
              ['Kasir Multi-Payment',        'Tunai, QRIS, Asuransi, Deposit'],
              ['Payroll Otomatis',            'Bagi hasil via kode share'],
            ].map(([title, sub]) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"/>
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white">{title}</div>
                  <div className="text-[10px] text-[#6b8ab8]">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-[#0f1d35] rounded-xl flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-white">AUDY</span>
              <span className="text-[5px] text-blue-400 tracking-widest">DENTAL</span>
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#0f1d35]">Klinik Management</div>
              <div className="text-[10px] text-gray-400">Audy Dental Muara Karang</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0f1d35] mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-gray-400 mb-7">Gunakan email dan password klinik Anda</p>

          {/* Error alert */}
          {apiError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-700">
              <AlertCircle size={15} className="flex-shrink-0"/>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="admin@klinik.com"
                className={cn(
                  'w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all',
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.08)]',
                )}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all pr-10',
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,.08)]',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('remember')} type="checkbox" className="accent-blue-600 w-3.5 h-3.5"/>
                <span className="text-[11px] text-gray-600">Ingat saya</span>
              </label>
              <button type="button" className="text-[11px] text-blue-500 hover:text-blue-700 font-medium">
                Lupa password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0f1d35] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2d4a] disabled:opacity-60 transition-colors mt-2"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin"/> : <LogIn size={15}/>}
              {isSubmitting ? 'Memproses...' : 'Masuk dengan Supabase'}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-1">
              Butuh backend aktif di port 3001
            </p>
          </form>

          {/* Demo button — prominent, above divider */}
          <div className="mt-3">
            <div className="relative flex items-center mb-3">
              <div className="flex-1 border-t border-gray-200"/>
              <span className="px-3 text-[10px] text-gray-400 bg-white">atau</span>
              <div className="flex-1 border-t border-gray-200"/>
            </div>
            <button
              type="button"
              onClick={demoLogin}
              className="w-full py-2.5 text-sm font-semibold rounded-lg border-2 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
            >
              🚀 Masuk sebagai Demo Admin
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-1.5">
              Tidak perlu backend — data contoh, langsung masuk
            </p>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-6">
            Audy Dental SaaS v1.0 · © 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center"><div className="text-gray-400 text-sm">Memuat...</div></div>}>
      <LoginPageInner />
    </Suspense>
  );
}
