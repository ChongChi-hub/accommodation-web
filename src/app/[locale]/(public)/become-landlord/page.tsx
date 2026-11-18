'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Mail, ShieldCheck, Sparkles } from 'lucide-react';
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

  const handleUpgrade = async () => {
    if (!user?.emailVerified) {
      toast.error('Vui lòng xác minh địa chỉ email trước khi nâng cấp.');
      router.push(APP_ROUTES.tenantSecurity);
      return;
    }
    if (!user?.kycVerified) {
      toast.error('Vui lòng hoàn tất xác thực CCCD (KYC) trước khi nâng cấp.');
      router.push(APP_ROUTES.tenantKyc);
      return;
    }
    setIsSubmitting(true);
    try {
      if (container.auth.authRepository.upgradeToLandlord) {
        await container.auth.authRepository.upgradeToLandlord();
      }
      await refreshMe();
      toast.success('Chúc mừng! Bạn đã nâng cấp thành công lên Chủ trọ.');
      router.push(APP_ROUTES.landlordHome);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Nâng cấp chủ trọ thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async () => {
    if (!user?.emailVerified) {
      toast.error('Vui lòng xác minh địa chỉ email trước khi nộp hồ sơ.');
      router.push(APP_ROUTES.tenantSecurity);
      return;
    }
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
        ) : !user?.emailVerified ? (
          <>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Yêu cầu xác minh địa chỉ email</span>
              </p>
              <p className="text-xs text-foreground-muted">
                Để đảm bảo an toàn và đủ điều kiện làm chủ trọ, bạn cần xác minh địa chỉ email trong Cài đặt tài khoản.
              </p>
            </div>
            <Link
              href={APP_ROUTES.tenantSecurity}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Xác minh email ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : !user?.kycVerified ? (
          <>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Yêu cầu xác thực CCCD (KYC)</span>
              </p>
              <p className="text-xs text-foreground-muted">
                Email đã được xác thực! Bước tiếp theo, bạn cần hoàn tất xác thực CCCD gắn chip để đủ điều kiện nâng cấp.
              </p>
            </div>
            <Link
              href={APP_ROUTES.tenantKyc}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-800 transition-colors shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Xác thực CCCD ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tài khoản đủ điều kiện nâng cấp!</span>
              </p>
              <p className="text-xs text-foreground-muted">
                Bạn đã xác minh cả Email và CCCD thành công. Bấm xác nhận bên dưới để chuyển sang tài khoản Chủ trọ.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={handleUpgrade}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Đang nâng cấp...' : 'Nâng cấp lên Chủ trọ ngay'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
