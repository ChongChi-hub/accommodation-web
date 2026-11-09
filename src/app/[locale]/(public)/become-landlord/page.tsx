'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { container } from '@/infrastructure/di/container';
import { APP_ROUTES } from '@/shared/routes';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { toast } from '@/presentation/stores/toast.store';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';

export default function BecomeLandlordPage() {
  const t = useTranslations('becomeLandlord');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const { user, isAuthenticated, refreshMe } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAlreadyLandlord = user?.roles?.includes('LANDLORD');
  const appStatus = user?.landlordApplication?.status;
  const hasPendingApplication =
    appStatus && appStatus !== 'NOT_APPLIED' && appStatus !== 'APPROVED';

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      if (container.auth.authRepository.applyLandlord) {
        await container.auth.authRepository.applyLandlord();
      }
      await refreshMe();
      toast.success(t('successToast'));
      router.push(APP_ROUTES.landlordKyc);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t('errorToast'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Breadcrumb items={[{ label: t('title') }]} />

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/70 text-primary dark:text-primary-300">
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('title')}</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-sm text-foreground-muted">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Sparkles className="w-5 h-5 text-primary" />, title: t('step1Title'), desc: t('step1Desc') },
          { icon: <ShieldCheck className="w-5 h-5 text-accent-600" />, title: t('step2Title'), desc: t('step2Desc') },
          { icon: <CheckCircle2 className="w-5 h-5 text-success" />, title: t('step3Title'), desc: t('step3Desc') },
        ].map((step) => (
          <Card key={step.title} className="p-5 space-y-2.5 bg-surface">
            <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center">
              {step.icon}
            </div>
            <h2 className="text-sm font-bold text-foreground">{step.title}</h2>
            <p className="text-xs text-foreground-muted leading-relaxed">{step.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {!isAuthenticated ? (
          <>
            <p className="text-xs sm:text-sm text-foreground-muted">{t('loginRequiredNotice')}</p>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login?returnUrl=/become-landlord"
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-muted"
              >
                {tNav('login')}
              </Link>
              <Link
                href="/register?role=landlord"
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-800"
              >
                {tNav('register')}
              </Link>
            </div>
          </>
        ) : isAlreadyLandlord ? (
          <>
            <p className="text-xs sm:text-sm font-medium text-success">{t('alreadyLandlordNotice')}</p>
            <Link
              href={APP_ROUTES.landlordHome}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-800 shrink-0"
            >
              <span>{t('actionGoLandlord')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : hasPendingApplication ? (
          <>
            <p className="text-xs sm:text-sm text-foreground-muted">{t('step2Desc')}</p>
            <Link
              href={APP_ROUTES.landlordKyc}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-800 shrink-0"
            >
              <span>{t('actionContinueKyc')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-foreground-muted">{t('step1Desc')}</p>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={handleApply}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? t('actionSubmitting') : t('actionStart')}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
