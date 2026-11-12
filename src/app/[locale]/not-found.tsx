'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Home, Search } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export default function NotFound() {
  const tAuto = useTranslations('autoI18n');
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-2xl mb-4">
        404
      </div>
      <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
        {tAuto('k0459')}
      </h1>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
        {tAuto('k0460')}
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link href="/">
          <Button size="sm" variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            {tAuto('k0461')}
          </Button>
        </Link>
        <Link href="/rooms">
          <Button size="sm" variant="outline" leftIcon={<Search className="w-4 h-4" />}>
            {tAuto('k0462')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

