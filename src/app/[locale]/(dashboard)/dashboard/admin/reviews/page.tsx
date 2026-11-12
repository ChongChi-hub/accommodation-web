'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminReviews } from '@/presentation/hooks/useAdminReviews';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Drawer } from '@/presentation/components/ui/Drawer';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Star, EyeOff, Eye, MessageSquare, Search, Building, User, ThumbsUp } from 'lucide-react';

function AdminReviewsContent() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('admin.reviews');
  const tCommon = useTranslations('common');
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

  const [selectedReview, setSelectedReview] = useState<any | null>(null);

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

  const tabItems = [
    { id: 'ALL', label: t('tabAll') },
    { id: 'VISIBLE', label: t('tabVisible') },
    { id: 'HIDDEN', label: t('tabHidden') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />

        <div className="w-full sm:w-72">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
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
                  <TableCell className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-muted text-teal-700 text-xs font-semibold flex items-center justify-center border border-border">
                        {r.tenantName.charAt(0)}
                      </div>
                      <span>{r.tenantName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted max-w-[200px] truncate">
                    {r.roomTitle}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-amber-500 flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {r.rating}.0
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-foreground max-w-xs truncate">
                    {r.comment}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'VISIBLE' ? 'success' : 'neutral'} size="sm">
                      {r.status === 'VISIBLE' ? t('statusVisible') : t('statusHidden')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReview(r)}
                        title={tCommon('details')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Review Detail Drawer (Bước 4 Requirement) */}
      <Drawer
        isOpen={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        title={t('title')}
      >
        {selectedReview && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center">
                  {selectedReview.tenantName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{selectedReview.tenantName}</h3>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < selectedReview.rating ? 'fill-amber-400' : 'text-border'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-foreground">({selectedReview.rating}/5)</span>
                  </div>
                </div>
              </div>
              <Badge variant={selectedReview.status === 'VISIBLE' ? 'success' : 'neutral'}>
                {selectedReview.status === 'VISIBLE' ? t('statusVisible') : t('statusHidden')}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-3 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <Building className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{tAuto('k0012')}{' '}<strong className="font-semibold">{selectedReview.roomTitle}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <ThumbsUp className="w-4 h-4 text-teal-700 shrink-0" />
                <span>{tAuto('k0013')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                {tAuto('k0014')}
              </h4>
              <div className="p-4 rounded-xl border border-border bg-surface text-xs leading-relaxed text-foreground">
                {selectedReview.comment}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button
                variant={selectedReview.status === 'VISIBLE' ? 'outline' : 'primary'}
                className="w-full"
                onClick={() => {
                  toggleVisibility(selectedReview.id);
                  setSelectedReview(null);
                }}
              >
                {selectedReview.status === 'VISIBLE' ? t('btnHide') : t('btnShow')}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
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
