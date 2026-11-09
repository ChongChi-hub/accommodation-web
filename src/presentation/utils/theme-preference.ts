export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'cozynest_theme';

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const val = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark') return val;
    return 'system';
  } catch {
    return 'system';
  }
}

export function applyThemePreference(pref: ThemePreference): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (pref === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, pref);
    }
  } catch {
    // Ignore storage quota failure
  }

  const prefersDark =
    pref === 'dark' ||
    (pref === 'system' &&
      Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));

  document.documentElement.classList.toggle('dark', prefersDark);
  return prefersDark;
}

