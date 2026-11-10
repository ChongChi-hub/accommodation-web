'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Search, PlusCircle } from 'lucide-react';
import { Reveal } from '@/presentation/components/motion';
import { Button } from '@/presentation/components/ui/Button';

export function HomeFinalCta() {
  const t = useTranslations('finalCta');

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-teal-950 via-stone-900 to-stone-950 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center relative z-10">
        <Reveal variant="fadeUp">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-4">
            {t('badge')}
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {t('title')}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/rooms" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Search className="w-4 h-4" />}
                className="w-full sm:w-auto px-8 font-semibold shadow-lg shadow-teal-500/20"
              >
                {t('findRoomCta')}
              </Button>
            </Link>

            <Link href="/register?role=LANDLORD" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="w-full sm:w-auto px-8 font-semibold border-white/20 text-white hover:bg-white/10"
              >
                {t('postRoomCta')}
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

