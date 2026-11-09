'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  applyThemePreference,
  getStoredThemePreference,
  ThemePreference,
} from '@/presentation/utils/theme-preference';
import { cn } from '@/lib/cn';

export function ThemePreferenceControl() {
  const tTheme = useTranslations('userMenu.theme');
  const [pref, setPref] = useState<ThemePreference>('system');

  useEffect(() => {
    setPref(getStoredThemePreference());
  }, []);

  const handleSelect = (next: ThemePreference) => {
    setPref(next);
    applyThemePreference(next);
  };

  const options: Array<{ key: ThemePreference; label: string; icon: React.ReactNode }> = [
    { key: 'light', label: tTheme('light'), icon: <Sun className="w-3.5 h-3.5" /> },
    { key: 'dark', label: tTheme('dark'), icon: <Moon className="w-3.5 h-3.5" /> },
    { key: 'system', label: tTheme('system'), icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-foreground-muted">{tTheme('label')}</p>
      <div
        role="radiogroup"
        aria-label={tTheme('label')}
        className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-muted border border-border/80"
      >
        {options.map((opt) => {
          const active = pref === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handleSelect(opt.key)}
              className={cn(
                'flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer',
                active
                  ? 'bg-surface text-primary dark:text-primary-300 shadow-xs font-semibold'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

