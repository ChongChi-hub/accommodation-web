'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import { applyThemePreference, getStoredThemePreference } from '@/presentation/utils/theme-preference';
import { cn } from '@/lib/cn';

export interface ThemeToggleProps {
  onHeroTop?: boolean;
  className?: string;
}

export function ThemeToggle({ onHeroTop = false, className }: ThemeToggleProps) {
  const tAria = useTranslations('header.aria');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(applyThemePreference(getStoredThemePreference()));
  }, []);

  const toggleTheme = () => {
    const nextPref = isDark ? 'light' : 'dark';
    const nextDark = applyThemePreference(nextPref);
    setIsDark(nextDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-xl border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        onHeroTop
          ? 'border-white/30 text-nav-on-hero hover:bg-white/15'
          : 'border-border text-nav-muted hover:text-nav-ink hover:bg-surface-muted',
        className
      )}
      aria-label={tAria('switchTheme')}
      title={tAria('switchTheme')}
    >
      {isDark ? <Sun className="w-4 h-4 text-accent-400" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
