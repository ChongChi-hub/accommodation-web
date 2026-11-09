'use client';

import React from 'react';
import { Building2, Info, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AuthIntendedRole } from './AuthPanelContext';

interface RoleCardProps {
  value: AuthIntendedRole;
  onChange: (role: AuthIntendedRole) => void;
  staggerIndex?: number;
}

export function RoleCard({ value, onChange, staggerIndex }: RoleCardProps) {
  const tAuth = useTranslations('auth');
  const isLandlord = value === 'LANDLORD';

  const options: Array<{
    role: AuthIntendedRole;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      role: 'TENANT',
      title: tAuth('roleTenant'),
      desc: tAuth('roleTenantDesc'),
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
    },
    {
      role: 'LANDLORD',
      title: tAuth('roleLandlord'),
      desc: tAuth('roleLandlordDesc'),
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <div
      className={`space-y-2.5 ${staggerIndex !== undefined ? 'auth-stagger' : ''}`}
      style={staggerIndex !== undefined ? ({ '--stagger': staggerIndex } as React.CSSProperties) : undefined}
    >
      <span id="register-role-label" className="block text-xs font-semibold uppercase tracking-wide text-foreground">
        {tAuth('role')}
      </span>

      <div role="radiogroup" aria-labelledby="register-role-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const selected = value === opt.role;
          return (
            <button
              key={opt.role}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.role)}
              className={`relative flex flex-col items-start gap-1.5 p-3.5 min-h-[44px] rounded-xl border text-left transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary ${
                selected
                  ? 'border-primary dark:border-primary-400 bg-primary-50/85 dark:bg-primary-950 text-primary-900 dark:text-primary-50 ring-2 ring-primary/25 dark:ring-primary-400/35 shadow-xs'
                  : 'border-border bg-surface text-foreground hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className={selected ? 'text-primary dark:text-primary-300' : 'text-foreground-muted'}>
                    {opt.icon}
                  </span>
                  <span>{opt.title}</span>
                </span>
                <span
                  className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-colors ${
                    selected ? 'border-primary bg-primary dark:border-primary-400 dark:bg-primary-400' : 'border-border'
                  }`}
                >
                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-stone-950" />}
                </span>
              </div>
              <p className={`text-xs leading-snug ${selected ? 'text-stone-700 dark:text-teal-100' : 'text-foreground-muted'}`}>
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Smooth collapsible Landlord KYC approval note */}
      <div
        className={`grid transition-all duration-250 ease-out ${
          isLandlord ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!isLandlord}
      >
        <div className="overflow-hidden">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-100">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5 leading-relaxed">
              <p className="font-semibold">{tAuth('landlordNoticeTitle')}</p>
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90">
                {tAuth('landlordNoticeDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

