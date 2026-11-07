'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminReviews } from '@/presentation/hooks/useAdminReviews';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Star, EyeOff, Eye, MessageSquare } from 'lucide-react';

function AdminReviewsContent() {
  const t = useTranslations('admin.reviews');
  const {
    reviews,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    retry,
    toggleVisibility,
  } = useAdminReviews();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full rounded-2xl" />
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
            <MessageSquare className="w-6 h-6 text-primary-600" />
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl max-w-fit">
          {(['ALL', 'VISIBLE', 'HIDDEN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-900 text-primary-600 dark:text-primary-400 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {tab === 'ALL' && t('tabAll')}
              {tab === 'VISIBLE' && t('tabVisible')}
              {tab === 'HIDDEN' && t('tabHidden')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colAuthor')}</TableHead>
                <TableHead>{t('colRoom')}</TableHead>
                <TableHead>{t('colRating')}</TableHead>
                <TableHead>{t('colComment')}</TableHead>
                <TableHead>{t('colStatus')}</TableHead>
                <TableHead className="text-right">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {r.tenantName}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500 max-w-[200px] truncate">
                    {r.roomTitle}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-amber-500 flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {r.rating}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-600 dark:text-neutral-300 max-w-xs">
                    {r.comment}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'VISIBLE' ? 'success' : 'neutral'} size="sm">
                      {r.status === 'VISIBLE' ? t('statusVisible') : t('statusHidden')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVisibility(r.id)}
                    >
                      {r.status === 'VISIBLE' ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1" />
                          {t('btnHide')}
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          {t('btnShow')}
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminReviewsContent />
    </Suspense>
  );
}
