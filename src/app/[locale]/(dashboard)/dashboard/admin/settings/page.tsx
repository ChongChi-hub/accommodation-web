'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminSettings } from '@/presentation/hooks/useAdminSettings';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Settings, ShieldCheck, CreditCard, Server, Save, RefreshCw } from 'lucide-react';

function AdminSettingsContent() {
  const t = useTranslations('admin.settings');
  const {
    maintenanceMode,
    setMaintenanceMode,
    vietQrActive,
    setVietQrActive,
    autoApproveRooms,
    setAutoApproveRooms,
    require2FAStaff,
    setRequire2FAStaff,
    sessionTimeoutMinutes,
    setSessionTimeoutMinutes,
    maxLoginAttempts,
    setMaxLoginAttempts,
    supportHotline,
    setSupportHotline,
    commissionRate,
    setCommissionRate,
    isSaving,
    isLoading,
    error,
    retry,
    handleSave,
    handleClearCache,
  } = useAdminSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState title={t('errorTitle')} message={t('errorDesc')} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Settings className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            {t('btnClearCache')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? t('btnSaving') : t('btnSave')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operations & System Status */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('sectionOps')}
              </h2>
              <p className="text-xs text-foreground-muted">
                {t('sectionOpsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border bg-surface-muted/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-foreground">
                  {t('maintenance')}
                </p>
                <p className="text-[11px] text-foreground-muted mt-0.5">{t('maintenanceDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-teal-700 cursor-pointer"
              />
            </div>

            <div className="border border-border bg-surface-muted/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-foreground">
                  {t('autoApprove')}
                </p>
                <p className="text-[11px] text-foreground-muted mt-0.5">{t('autoApproveDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={autoApproveRooms}
                onChange={(e) => setAutoApproveRooms(e.target.checked)}
                className="w-4 h-4 accent-teal-700 cursor-pointer"
              />
            </div>

            <div>
              <Input
                label={t('supportHotline')}
                value={supportHotline}
                onChange={(e) => setSupportHotline(e.target.value)}
              />
            </div>

            <div>
              <Input
                label={t('commissionRate')}
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Payment Configuration */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('sectionPayment')}
              </h2>
              <p className="text-xs text-foreground-muted">
                {t('sectionPaymentDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border bg-surface-muted/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-foreground">
                  {t('vietQr')}
                </p>
                <p className="text-[11px] text-foreground-muted mt-0.5">{t('vietQrDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={vietQrActive}
                onChange={(e) => setVietQrActive(e.target.checked)}
                className="w-4 h-4 accent-teal-700 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Security Configuration */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('sectionSecurity')}
              </h2>
              <p className="text-xs text-foreground-muted">
                {t('sectionSecurityDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label={t('sessionTimeout')}
                type="number"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
              />
            </div>

            <div>
              <Input
                label={t('maxLoginAttempts')}
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
              />
            </div>

            <div className="border border-border bg-surface-muted/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs text-foreground">
                  {t('require2FA')}
                </p>
                <p className="text-[11px] text-foreground-muted mt-0.5">{t('require2FADesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={require2FAStaff}
                onChange={(e) => setRequire2FAStaff(e.target.checked)}
                className="w-4 h-4 accent-teal-700 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminSettingsContent />
    </Suspense>
  );
}
