'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { Check, ShieldCheck } from 'lucide-react';
import { useAuthPanelContext } from './AuthPanelContext';

export function CozyNeighborhoodSvg() {
  return (
    <svg
      viewBox="0 0 440 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-auto max-w-[380px] select-none"
    >
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="amberHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft nocturnal horizon halos */}
      <circle cx="348" cy="56" r="46" fill="url(#moonGlow)" className="auth-ambient-float" />
      <circle cx="155" cy="185" r="95" fill="url(#amberHalo)" className="auth-ambient-float" />

      {/* Crescent moon & subtle stars */}
      <path
        d="M356 36c-9.9 0-18 8.1-18 18s8.1 18 18 18c3.6 0 7-1.1 9.8-2.9-7.9-1.4-13.8-8.2-13.8-16.5s5.9-15.1 13.8-16.5A17.8 17.8 0 0 0 356 36Z"
        fill="#fef3c7"
      />
      <circle cx="72" cy="48" r="2" fill="#99f6e4" opacity="0.7" />
      <circle cx="136" cy="34" r="1.5" fill="#fef3c7" opacity="0.8" />
      <circle cx="240" cy="44" r="2" fill="#99f6e4" opacity="0.55" />
      <circle cx="395" cy="108" r="1.5" fill="#fef3c7" opacity="0.65" />

      {/* Distant skyline silhouettes */}
      <path
        d="M28 242h384v4H28v-4Z"
        fill="#0d3b37"
      />
      <rect x="44" y="138" width="66" height="104" rx="4" fill="#0d4440" />
      <rect x="330" y="148" width="66" height="94" rx="4" fill="#0d4440" />

      {/* Left House */}
      <path d="M88 128L142 84L196 128V242H88V128Z" fill="#134e4a" stroke="#115e59" strokeWidth="2" />
      <path d="M80 132L142 80L204 132" stroke="#5eead4" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Center Tall Townhouse */}
      <rect x="182" y="102" width="102" height="140" rx="4" fill="#0f5752" stroke="#14b8a6" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M174 104L233 66L292 104" fill="#0d4440" stroke="#5eead4" strokeOpacity="0.4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Right Cozy Home */}
      <path d="M276 140L322 106L368 140V242H276V140Z" fill="#134e4a" stroke="#115e59" strokeWidth="2" />
      <path d="M268 144L322 102L376 144" stroke="#5eead4" strokeOpacity="0.3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Doors */}
      <rect x="128" y="202" width="24" height="40" rx="12" fill="#042f2e" />
      <rect x="220" y="198" width="26" height="44" rx="4" fill="#042f2e" />
      <circle cx="241" cy="221" r="2" fill="#fbbf24" />
      <rect x="311" y="206" width="22" height="36" rx="11" fill="#042f2e" />

      {/* Warm Amber Glowing Windows with Staggered Gentle Loop */}
      <rect x="108" y="144" width="24" height="28" rx="3" fill="#f59e0b" className="auth-window-pulse" style={{ animationDelay: '0s' }} />
      <rect x="150" y="144" width="24" height="28" rx="3" fill="#fbbf24" className="auth-window-pulse" style={{ animationDelay: '1.2s' }} />

      <rect x="200" y="122" width="22" height="26" rx="3" fill="#fbbf24" className="auth-window-pulse" style={{ animationDelay: '0.6s' }} />
      <rect x="242" y="122" width="22" height="26" rx="3" fill="#f59e0b" className="auth-window-pulse" style={{ animationDelay: '2.1s' }} />

      <rect x="200" y="160" width="22" height="26" rx="3" fill="#fde68a" className="auth-window-pulse" style={{ animationDelay: '1.7s' }} />
      <rect x="242" y="160" width="22" height="26" rx="3" fill="#fbbf24" className="auth-window-pulse" style={{ animationDelay: '0.3s' }} />

      <rect x="294" y="156" width="22" height="24" rx="3" fill="#fbbf24" className="auth-window-pulse" style={{ animationDelay: '2.6s' }} />
      <rect x="330" y="156" width="22" height="24" rx="3" fill="#f59e0b" className="auth-window-pulse" style={{ animationDelay: '1.4s' }} />

      {/* Window Mullion Crossbars */}
      <path d="M120 144v28M108 158h24M211 122v26M200 135h22M253 160v26M242 173h22M305 156v24M294 168h22" stroke="#134e4a" strokeWidth="1.5" opacity="0.65" />

      {/* Trees */}
      <circle cx="66" cy="212" r="18" fill="#0f766e" />
      <circle cx="80" cy="222" r="14" fill="#115e59" />
      <rect x="70" y="226" width="4" height="16" fill="#042f2e" />

      <circle cx="384" cy="214" r="16" fill="#0f766e" />
      <rect x="382" y="226" width="4" height="16" fill="#042f2e" />
    </svg>
  );
}

export function BrandPanel() {
  const t = useTranslations('auth.brandPanel');
  const pathname = usePathname();
  const { intendedRole } = useAuthPanelContext();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVisChange = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  const isRegister = pathname.includes('/register');
  const isRecovery =
    pathname.includes('/forgot-password') ||
    pathname.includes('/reset-password') ||
    pathname.includes('/verify-email');

  let headline = t('loginHeadline');
  let points: string[] = [t('loginPoint1'), t('loginPoint2'), t('loginPoint3')];

  if (isRegister) {
    if (intendedRole === 'LANDLORD') {
      headline = t('registerLandlordHeadline');
      points = [t('registerLandlordPoint1'), t('registerLandlordPoint2'), t('registerLandlordPoint3')];
    } else {
      headline = t('registerTenantHeadline');
      points = [t('registerTenantPoint1'), t('registerTenantPoint2'), t('registerTenantPoint3')];
    }
  } else if (isRecovery) {
    headline = t('recoveryHeadline');
    points = [];
  }

  return (
    <aside
      data-paused={paused ? 'true' : 'false'}
      className="relative flex flex-col justify-between w-full h-full px-10 py-10 xl:px-14 xl:py-12 bg-gradient-to-br from-[#042f2e] via-[#0d4a46] to-[#134e4a] text-white overflow-hidden select-none"
    >
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl auth-ambient-float"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-2">
        <span className="inline-block text-xs font-bold tracking-[0.14em] uppercase text-amber-300">
          {t('eyebrow')}
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center my-6">
        <CozyNeighborhoodSvg />
      </div>

      <div
        key={`${isRegister ? intendedRole : isRecovery ? 'recovery' : 'login'}`}
        className="relative z-10 space-y-5 transition-opacity duration-300"
      >
        <h2 className="text-2xl xl:text-[26px] font-bold leading-snug text-white">
          {headline}
        </h2>

        {points.length > 0 ? (
          <ul className="space-y-3">
            {points.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-teal-50 leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 border border-white/15 text-sm text-teal-50">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-300 mt-0.5" />
            <p className="leading-relaxed">{t('recoveryDesc')}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

