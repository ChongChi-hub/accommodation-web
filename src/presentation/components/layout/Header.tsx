'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Home, Search, LogIn, UserPlus, LogOut, User, Globe, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';

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

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.roles.includes('ADMIN') || user.roles.includes('MODERATOR')) return '/dashboard/admin';
    if (user.roles.includes('LANDLORD')) return '/dashboard/landlord';
    return '/dashboard/tenant';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Tổ Ấm" width={135} height={32} style={{ width: 'auto', height: 'auto' }} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
          <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-400 transition flex items-center gap-1.5">
            <Home size={16} />
            <span>{t('home')}</span>
          </Link>
          <Link href="/rooms" className="hover:text-teal-700 dark:hover:text-teal-400 transition flex items-center gap-1.5">
            <Search size={16} />
            <span>{t('rooms')}</span>
          </Link>
          <Link href="/dashboard/landlord/rooms/new" className="hover:text-teal-700 dark:hover:text-teal-400 transition flex items-center gap-1.5">
            <PlusCircle size={16} />
            <span>{t('postRoom')}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 text-xs font-semibold uppercase px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Đổi ngôn ngữ / Change language"
          >
            <Globe size={14} />
            <span>{locale}</span>
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900 transition"
              >
                <User size={14} />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-1.5 text-stone-500 hover:text-rose-600 transition cursor-pointer"
                title={t('logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-teal-700 dark:hover:text-teal-400 px-3 py-1.5 transition"
              >
                <LogIn size={15} />
                <span>{t('login')}</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 px-3.5 py-1.5 rounded-lg transition shadow-xs"
              >
                <UserPlus size={15} />
                <span>{t('register')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
