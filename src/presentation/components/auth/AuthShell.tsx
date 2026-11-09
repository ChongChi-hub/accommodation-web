'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Moon, Sun, Globe } from 'lucide-react';
import { BrandPanel } from './BrandPanel';

function AuthBrandWordmark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg
        width="30"
        height="30"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6 22L24 6L42 22H36V40C36 41.1 35.1 42 34 42H14C12.9 42 12 41.1 12 40V22H6Z"
          className="fill-[#0F766E] dark:fill-[#2DD4BF]"
        />
        <circle cx="24" cy="20" r="4.5" className="fill-[#FAF7F2] dark:fill-[#0C0A09]" />
        <path
          d="M24 23.5C21 23.5 19 28 24 35C29 28 27 23.5 24 23.5Z"
          className="fill-[#FAF7F2] dark:fill-[#0C0A09]"
        />
        <path d="M28 10C32 10 36 12 37 16C33 16 29 14 28 10Z" fill="#F59E0B" />
      </svg>
      <span className="text-lg font-extrabold tracking-tight uppercase text-primary dark:text-primary-300">
        {label}
      </span>
    </span>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const tAuth = useTranslations('auth');
  const tBrand = useTranslations('brand');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cozynest_theme');
    const prefersDark =
      saved === 'dark' ||
      (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', prefersDark);
    setIsDark(prefersDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('cozynest_theme', next ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'vi' ? 'en' : 'vi';
    router.replace(pathname as any, { locale: nextLocale });
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[45%_55%] bg-background text-foreground transition-colors">
      {/* Persistent Desktop Left Brand Column (never remounts between auth pages) */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        <BrandPanel />
      </div>

      {/* Tablet & Mobile Thin Brand Header Strip */}
      <aside
        aria-label={tAuth('brandPanel.eyebrow')}
        className="lg:hidden relative overflow-hidden bg-gradient-to-r from-[#042f2e] via-[#0d4a46] to-[#134e4a] px-5 py-3 text-white flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#fbbf24" className="auth-window-pulse" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#f59e0b" className="auth-window-pulse" style={{ animationDelay: '0.8s' }} />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#f59e0b" className="auth-window-pulse" style={{ animationDelay: '1.6s' }} />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#fde68a" className="auth-window-pulse" style={{ animationDelay: '0.4s' }} />
          </svg>
          <span className="text-xs font-bold tracking-[0.12em] uppercase text-teal-50">
            {tAuth('brandPanel.eyebrow')}
          </span>
        </div>
      </aside>

      {/* Right Column: Navigation Header & Centered 400px Form Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="w-full px-5 sm:px-8 pt-5 pb-2 flex items-center justify-between">
          <Link
            href="/"
            aria-label={tBrand('name')}
            className="inline-flex items-center gap-2 rounded-lg px-1.5 py-1 -ml-1.5 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary transition-colors min-h-[44px]"
          >
            <AuthBrandWordmark label={tBrand('name')} />
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={`${locale.toUpperCase()} — ${tAuth('switchLanguage')}`}
              title={tAuth('switchLanguage')}
              className="inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-xs font-semibold text-foreground cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Globe className="w-4 h-4 text-primary dark:text-primary-400" aria-hidden="true" />
              <span className="uppercase">{locale}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? tAuth('switchThemeLight') : tAuth('switchThemeDark')}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-6 sm:px-8 sm:py-10">
          <div key={pathname} className="w-full max-w-[400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

