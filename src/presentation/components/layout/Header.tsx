'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Home, Search, LogIn, UserPlus, LogOut, User, Globe, Building2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, initSession } = useAuthStore();

  useEffect(() => {
    initSession();
  }, [initSession]);

  const toggleLocale = () => {
    const nextLocale = locale === 'vi' ? 'en' : 'vi';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Tổ Ấm" width={140} height={34} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link href="/" className="hover:text-teal-700 transition flex items-center gap-1.5">
            <Home size={16} />
            <span>{t('home')}</span>
          </Link>
          <Link href="/rooms" className="hover:text-teal-700 transition flex items-center gap-1.5">
            <Search size={16} />
            <span>{t('rooms')}</span>
          </Link>
          <Link href="/landlord" className="hover:text-teal-700 transition flex items-center gap-1.5">
            <Building2 size={16} />
            <span>{t('postRoom')}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 text-xs font-semibold uppercase px-2.5 py-1.5 rounded-md border border-stone-200 text-stone-700 hover:bg-stone-50 transition"
            title="Đổi ngôn ngữ / Change language"
          >
            <Globe size={14} />
            <span>{locale}</span>
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.roles.includes('ADMIN') ? '/admin' : user.roles.includes('LANDLORD') ? '/landlord' : '/tenant'}
                className="flex items-center gap-2 text-sm font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition"
              >
                <User size={15} />
                <span>{user.fullName}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-1.5 text-stone-500 hover:text-red-600 transition"
                title={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-teal-700 px-3 py-1.5 transition"
              >
                <LogIn size={16} />
                <span>{t('login')}</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 px-3.5 py-1.5 rounded-lg transition shadow-sm"
              >
                <UserPlus size={16} />
                <span>{t('register')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

