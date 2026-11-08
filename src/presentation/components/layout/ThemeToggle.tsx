'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode =
      localStorage.getItem('cozynest_theme') === 'dark' ||
      (!('cozynest_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cozynest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cozynest_theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
      aria-label="Chuyển chế độ sáng/tối"
      title="Chế độ sáng / tối"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
    </button>
  );
}

