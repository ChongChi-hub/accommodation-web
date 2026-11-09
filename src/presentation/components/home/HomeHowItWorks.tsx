'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, CalendarCheck, ShieldCheck, HelpCircle } from 'lucide-react';
import { Reveal, Stagger } from '@/presentation/components/motion';

const STEPS = [
  {
    step: 1,
    icon: Search,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    isUpcoming: false,
  },
  {
    step: 2,
    icon: CalendarCheck,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    isUpcoming: false,
  },
  {
    step: 3,
    icon: ShieldCheck,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    isUpcoming: true, // "Sắp có" badge for digital contract / wallet escrow
  },
];

export function HomeHowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-stone-900 border-b border-stone-200/60 dark:border-stone-800 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <Reveal variant="fadeUp" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            {t('sectionSubtitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
            {t('sectionTitle')}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
            {t('sectionDescription')}
          </p>
        </Reveal>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div
            className="hidden md:block absolute top-1/2 left-16 right-16 h-0.5 border-t-2 border-dashed border-teal-200 dark:border-teal-900/60 -translate-y-8 z-0"
            aria-hidden="true"
          />

          <Reveal variant="fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {STEPS.map((stepItem) => {
                const Icon = stepItem.icon;
                return (
                  <div
                    key={stepItem.step}
                    className="bg-stone-50/80 dark:bg-stone-800/60 rounded-2xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-700/60 flex flex-col items-center text-center relative group hover-lift transition-all duration-300"
                  >
                    {/* Step Number Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-teal-600/20 mb-4 group-hover:scale-110 transition-transform">
                      {stepItem.step}
                    </div>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Title & Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-bold text-stone-900 dark:text-white">
                        {t(`steps.${stepItem.titleKey}`)}
                      </h3>
                      {stepItem.isUpcoming && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {t('upcoming')}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {t(`steps.${stepItem.descKey}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
