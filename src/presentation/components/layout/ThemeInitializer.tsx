'use client';

import { useEffect } from 'react';
import { applyThemePreference, getStoredThemePreference } from '@/presentation/utils/theme-preference';

export function ThemeInitializer() {
  useEffect(() => {
    applyThemePreference(getStoredThemePreference());
  }, []);

  return null;
}

