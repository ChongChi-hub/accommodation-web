'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Play, Pause, ChevronDown } from 'lucide-react';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { ParallaxLayer } from '@/presentation/components/motion/ParallaxLayer';
import { HomeHeroSearch } from './HomeHeroSearch';

const HERO_SLIDES = [
  MEDIA_MANIFEST['hero']['street'],
  MEDIA_MANIFEST['hero']['hcmc'],
  MEDIA_MANIFEST['hero']['interior'],
];

interface HomeHeroProps {
  hotProvinces?: { code: string; name: string }[];
}

export function HomeHero({ hotProvinces }: HomeHeroProps) {
  const t = useTranslations('hero');
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [canLoadLazy, setCanLoadLazy] = useState(false);
  const [isScrolledPast, setIsScrolledPast] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Lazy load slides 2 & 3 after window load event
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onLoad = () => setCanLoadLazy(true);
    if (document.readyState === 'complete') {
      setCanLoadLazy(true);
    } else {
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Check prefers-reduced-motion or saveData
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    if (mediaQuery.matches || nav.connection?.saveData) {
      setIsPlaying(false);
    }
  }, []);

  // Interval timer for slide transition (7 seconds)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Track scroll past hero to hide scroll down indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setIsScrolledPast(scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollDown = useCallback(() => {
    const nextSection = document.getElementById('categories-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[100svh] min-h-[640px] max-h-[1080px] overflow-hidden flex flex-col justify-between"
      aria-label="Khối giới thiệu CozyNest"
    >
      {/* Background Parallax Layer */}
      <ParallaxLayer speed={0.25} className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const isFirst = idx === 0;
            if (!isFirst && !canLoadLazy) return null;

            return (
              <div
                key={slide.slug}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                aria-hidden={!isActive}
              >
                <div
                  className={`relative w-full h-full ${
                    isActive && isPlaying ? 'hero-slide-zoom' : ''
                  }`}
                >
                  <Image
                    src={slide.webp1920}
                    alt={locale === 'vi' ? slide.altVi : slide.altEn}
                    fill
                    priority={isFirst}
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL={slide.blurDataURL}
                    className="object-cover object-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ParallaxLayer>

      {/* Scrim Overlays ensuring WCAG AA >= 4.5:1 text contrast */}
      <div
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-stone-950/80 via-stone-950/45 to-stone-950/90"
        aria-hidden="true"
      />

      {/* Spacer for Top Navbar */}
      <div className="relative z-20 pt-20" aria-hidden="true" />

      {/* Hero Center Content & Floating Search */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 max-w-5xl text-center flex flex-col items-center my-auto">
        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-teal-500/20 text-teal-200 border border-teal-400/30 backdrop-blur-md mb-4 animate-fade-in">
          {t('badge')}
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-3xl leading-tight drop-shadow-md">
          {t('title')}
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-stone-200/90 max-w-2xl font-normal leading-relaxed drop-shadow-sm">
          {t('subtitle')}
        </p>

        {/* Floating Search Card */}
        <div className="w-full mt-6 sm:mt-8">
          <HomeHeroSearch hotProvinces={hotProvinces} />
        </div>
      </div>

      {/* Hero Footer Controls: Slide indicator + Pause/Play + Scroll Down */}
      <div className="relative z-20 container mx-auto px-4 pb-6 flex items-center justify-between text-white/80">
        {/* Slide Indicators & Pause Button */}
        <div className="flex items-center gap-3 bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Danh sách ảnh trình chiếu">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.slug}
                type="button"
                role="tab"
                aria-selected={idx === currentSlide}
                aria-label={`Ảnh ${idx + 1}`}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-6 bg-teal-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-pressed={!isPlaying}
            aria-label={isPlaying ? t('pauseSlides') : t('playSlides')}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Scroll Down Indicator */}
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label={t('scrollDown')}
          className={`flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition-all duration-300 ${
            isScrolledPast ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-bounce'
          }`}
        >
          <span>{t('scrollDown')}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
