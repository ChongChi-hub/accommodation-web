'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from '@/i18n/routing';

interface HeaderHeroContextValue {
  hasHero: boolean;
  isScrolled: boolean;
  isHeroSearchInView: boolean;
  setHeroMounted: (mounted: boolean) => void;
  setHeroSearchInView: (inView: boolean) => void;
}

const HeaderHeroContext = createContext<HeaderHeroContextValue>({
  hasHero: false,
  isScrolled: false,
  isHeroSearchInView: false,
  setHeroMounted: () => {},
  setHeroSearchInView: () => {},
});

export function HeaderHeroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/';
  const [heroMounted, setHeroMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeroSearchInView, setIsHeroSearchInView] = useState(isHomeRoute);

  useEffect(() => {
    setIsHeroSearchInView(pathname === '/');
  }, [pathname]);

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  const handleSetHeroMounted = useCallback((mounted: boolean) => {
    setHeroMounted(mounted);
  }, []);

  const handleSetHeroSearchInView = useCallback((inView: boolean) => {
    setIsHeroSearchInView(inView);
  }, []);

  const hasHero = isHomeRoute || heroMounted;

  return (
    <HeaderHeroContext.Provider
      value={{
        hasHero,
        isScrolled,
        isHeroSearchInView,
        setHeroMounted: handleSetHeroMounted,
        setHeroSearchInView: handleSetHeroSearchInView,
      }}
    >
      {children}
    </HeaderHeroContext.Provider>
  );
}

export function useHeaderHero() {
  return useContext(HeaderHeroContext);
}

