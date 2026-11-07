'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import Image from 'next/image';
import { UserPlus, Mail, Phone, Lock, User, AlertCircle, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await register({
      fullName,
      email,
      phone,
      password,
      role,
    });
    if (success) {
      if (role === 'LANDLORD') {
        router.push('/landlord');
      } else {
        router.push('/tenant');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="Tổ Ấm" width={140} height={34} />
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">{t('registerTitle')}</h2>
          <p className="mt-2 text-sm text-stone-500">{t('registerSubtitle')}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">{t('fullName')}</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">{t('phone')}</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                placeholder="0912345678"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">{t('password')}</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-2">{t('role')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('TENANT')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  role === 'TENANT'
                    ? 'border-teal-700 bg-teal-50 text-teal-800 ring-1 ring-teal-700'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <User size={15} />
                <span>Người thuê phòng</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('LANDLORD')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  role === 'LANDLORD'
                    ? 'border-teal-700 bg-teal-50 text-teal-800 ring-1 ring-teal-700'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Building2 size={15} />
                <span>Chủ cho thuê</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none transition disabled:opacity-50"
          >
            <UserPlus size={16} />
            <span>{isLoading ? 'Đang khởi tạo tài khoản...' : t('registerBtn')}</span>
          </button>
        </form>

        <div className="text-center text-xs text-stone-500">
          <span>{t('haveAccount')} </span>
          <Link href="/login" className="font-semibold text-teal-700 hover:underline">
            {t('loginBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

