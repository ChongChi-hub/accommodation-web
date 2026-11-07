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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('btnClearCache')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t('btnSaving') : t('btnSave')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {t('sectionOps')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('sectionOpsDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  {t('maintenance')}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{t('maintenanceDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  {t('autoApprove')}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{t('autoApproveDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={autoApproveRooms}
                onChange={(e) => setAutoApproveRooms(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('supportHotline')}
              </label>
              <Input
                value={supportHotline}
                onChange={(e) => setSupportHotline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('commissionRate')}
              </label>
              <Input
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {t('sectionPayment')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('sectionPaymentDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  {t('vietQr')}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{t('vietQrDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={vietQrActive}
                onChange={(e) => setVietQrActive(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {t('sectionSecurity')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('sectionSecurityDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('sessionTimeout')}
              </label>
              <Input
                type="number"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('maxLoginAttempts')}
              </label>
              <Input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
              />
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                  {t('require2FA')}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{t('require2FADesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={require2FAStaff}
                onChange={(e) => setRequire2FAStaff(e.target.checked)}
                className="w-5 h-5 accent-primary-600 cursor-pointer"
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
