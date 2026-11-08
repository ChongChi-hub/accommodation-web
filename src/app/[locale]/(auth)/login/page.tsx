'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { container } from '@/infrastructure/di/container';
import Image from 'next/image';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { GoogleLoginButton } from '@/presentation/components/auth/GoogleLoginButton';

function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect');
  const action = searchParams.get('action');
  const roomId = searchParams.get('roomId');
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      if (action === 'bookmark' && roomId) {
        try {
          await container.bookmark.bookmarkRepository.addBookmark(Number(roomId));
        } catch {
          // bookmark error should not block redirection
        }
      }
      if (returnUrl) {
        router.push(returnUrl as any);
        return;
      }
      const user = useAuthStore.getState().user;
      if (user?.roles.includes('ADMIN')) {
        router.push('/dashboard/admin');
      } else if (user?.roles.includes('MODERATOR')) {
        router.push('/dashboard/moderator');
      } else if (user?.roles.includes('LANDLORD')) {
        router.push('/dashboard/landlord');
      } else {
        router.push('/dashboard/tenant');
      }
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="Tổ Ấm" width={140} height={34} />
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">{t('loginTitle')}</h2>
          <p className="mt-2 text-sm text-stone-500">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">{t('email')}</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-stone-700">{t('password')}</label>
              <Link href="/forgot-password" className="text-xs text-teal-700 hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                placeholder="******"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none transition disabled:opacity-50"
          >
            <LogIn size={16} />
            <span>{isLoading ? 'Đang xác thực...' : t('loginBtn')}</span>
          </button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2 text-stone-400">{t('or')}</span>
            </div>
          </div>

          <GoogleLoginButton label={t('googleLogin')} />
        </form>

        {/* Quick Demo Login Picker */}
        <div className="border-t border-stone-100 pt-5">
          <p className="text-xs text-stone-400 mb-2 font-medium">Đăng nhập nhanh với tài khoản Demo (pass: password123):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('tenant@cozynest.vn')}
              className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-700 hover:bg-teal-50 hover:border-teal-300 transition text-left"
            >
              Người thuê (Tenant)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('landlord@cozynest.vn')}
              className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-700 hover:bg-teal-50 hover:border-teal-300 transition text-left"
            >
              Chủ trọ (Landlord)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@cozynest.vn')}
              className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-700 hover:bg-teal-50 hover:border-teal-300 transition text-left"
            >
              Quản trị (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('moderator@cozynest.vn')}
              className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-700 hover:bg-teal-50 hover:border-teal-300 transition text-left"
            >
              Kiểm duyệt (Mod)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-500">
          <span>{t('noAccount')} </span>
          <Link href="/register" className="font-semibold text-teal-700 hover:underline">
            {t('registerBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-stone-50" />}>
      <LoginForm />
    </Suspense>
  );
}

