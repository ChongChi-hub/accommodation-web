'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCircle2, Building, ArrowRight, ShieldCheck, FileSpreadsheet, KeyRound } from 'lucide-react';
import { MEDIA_MANIFEST } from '@/shared/media-manifest';
import { Reveal, ImageReveal } from '@/presentation/components/motion';
import { Button } from '@/presentation/components/ui/Button';
import { useAuthStore } from '@/presentation/stores/auth.store';

const BENEFITS = [
  {
    icon: ShieldCheck,
    titleKey: 'benefit1Title',
    descKey: 'benefit1Desc',
  },
  {
    icon: FileSpreadsheet,
    titleKey: 'benefit2Title',
    descKey: 'benefit2Desc',
  },
  {
    icon: KeyRound,
    titleKey: 'benefit3Title',
    descKey: 'benefit3Desc',
  },
];

export function HomeLandlordSection() {
  const t = useTranslations('landlordSection');
  const locale = useLocale();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  const isLandlord = hasHydrated && isAuthenticated && user?.roles?.includes('LANDLORD');
  const isTenantOnly = hasHydrated && isAuthenticated && !isLandlord;

  const landlordAsset = MEDIA_MANIFEST['landlord']['landlord-keys'];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-stone-900 border-b border-stone-200/60 dark:border-stone-800 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Genuine Photography with ImageReveal */}
          <Reveal variant="fadeUp" className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-800 aspect-4/3 sm:aspect-16/10">
              <ImageReveal className="relative w-full h-full">
                <Image
                  src={landlordAsset.webp1080}
                  alt={locale === 'vi' ? landlordAsset.altVi : landlordAsset.altEn}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL={landlordAsset.blurDataURL}
                  className="object-cover object-center"
                />
              </ImageReveal>

              {/* Floating Highlight Card */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xs bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                      {t('cardTitle')}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {t('cardDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Benefits & Role-Aware CTA */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <Reveal variant="fadeUp">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                {t('sectionSubtitle')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 dark:text-white mt-1 leading-tight">
                {t('sectionTitle')}
              </h2>
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                {t('sectionDescription')}
              </p>
            </Reveal>

            {/* Benefits List */}
            <div className="mt-8 space-y-4">
              {BENEFITS.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <Reveal key={idx} variant="fadeUp" delayMs={idx * 100}>
                    <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-stone-50/60 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                          {t(`benefits.${b.titleKey}`)}
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                          {t(`benefits.${b.descKey}`)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Role-Aware CTA Button */}
            <Reveal variant="fadeUp" delayMs={350} className="mt-8">
              {isLandlord ? (
                <Link href="/dashboard/landlord/rooms/new">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
                    {t('ctaPostRoom')} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              ) : isTenantOnly ? (
                <Link href="/become-landlord">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
                    {t('ctaUpgradeRole')} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register?role=LANDLORD">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
                    {t('ctaRegisterLandlord')} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
