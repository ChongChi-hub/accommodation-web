'use client';
import { useTranslations } from 'next-intl';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/presentation/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tAuto = useTranslations('autoI18n');
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
        {tAuto('k0455')}
      </h1>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
        {tAuto('k0456')}
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button
          size="sm"
          variant="primary"
          onClick={() => reset()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          {tAuto('k0457')}
        </Button>
        <Link href="/">
          <Button size="sm" variant="outline" leftIcon={<Home className="w-4 h-4" />}>
            {tAuto('k0458')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

