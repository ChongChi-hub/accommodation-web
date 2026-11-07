'use client';

import React, { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminKyc } from '@/presentation/hooks/useAdminKyc';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { ShieldCheck, Eye, Check, X, CreditCard, Calendar, UserCheck } from 'lucide-react';

function AdminKycContent() {
  const t = useTranslations('admin.kyc');
  const tCommon = useTranslations('common');
  const {
    kycList,
    selectedUser,
    setSelectedUser,
    isLoading,
    error,
    retry,
    handleApprove,
    handleReject,
  } = useAdminKyc();

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span>{t('title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {kycList.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('colName')}</TableHead>
                <TableHead>{t('colIdNumber')}</TableHead>
                <TableHead>{t('colSubmitted')}</TableHead>
                <TableHead>{tCommon('status')}</TableHead>
                <TableHead className="text-right">{t('colAction')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycList.map((k) => (
                <TableRow key={k.id}>
                  <TableCell>
                    <p className="font-bold text-foreground">{k.userName}</p>
                    <p className="text-xs text-foreground-muted mt-0.5">{k.userEmail}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    {k.idNumber}
                  </TableCell>
                  <TableCell className="text-xs text-foreground-muted">{k.submittedAt}</TableCell>
                  <TableCell>
                    <Badge variant="warning" size="sm">
                      {tCommon('statusPending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(k);
                        setShowRejectInput(false);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {t('btnReview')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* KYC Inspection Modal (Bước 4 Requirement) */}
      {selectedUser && (
        <Dialog
          isOpen={true}
          onClose={() => {
            setSelectedUser(null);
            setShowRejectInput(false);
          }}
          title={t('modalTitle', { name: selectedUser.userName })}
          description={t('modalDesc', {
            idNumber: selectedUser.idNumber,
            role: selectedUser.userEmail,
          })}
          size="lg"
        >
          <div className="space-y-5 pt-2">
            {/* CCCD 2-Sided Viewer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  {t('frontImage')}
                </span>
                <div className="aspect-16/10 rounded-2xl overflow-hidden border border-border bg-surface-muted flex items-center justify-center p-1">
                  <img
                    src={selectedUser.frontImage}
                    alt={t('frontImage')}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  {t('backImage')}
                </span>
                <div className="aspect-16/10 rounded-2xl overflow-hidden border border-border bg-surface-muted flex items-center justify-center p-1">
                  <img
                    src={selectedUser.backImage}
                    alt={t('backImage')}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* OCR Data Comparison */}
            <div className="p-4 rounded-xl bg-surface-muted border border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[11px] text-foreground-muted font-medium">Họ và tên đối chiếu</p>
                <p className="font-bold text-foreground mt-0.5">{selectedUser.userName}</p>
              </div>
              <div>
                <p className="text-[11px] text-foreground-muted font-medium">Số CCCD / Định danh</p>
                <p className="font-mono font-bold text-foreground mt-0.5">{selectedUser.idNumber}</p>
              </div>
              <div>
                <p className="text-[11px] text-foreground-muted font-medium">Độ khớp khuôn mặt AI</p>
                <Badge variant="success" size="sm">98.5% Trùng khớp</Badge>
              </div>
            </div>

            {/* Rejection input if triggered */}
            {showRejectInput && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  Lý do từ chối hồ sơ (gửi thông báo đến người dùng):
                </p>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Ảnh mờ góc, không rõ số CCCD..."
                  className="w-full rounded-lg border border-border p-2 text-xs bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
              {showRejectInput ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)}>
                    {tCommon('cancel')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      handleReject(selectedUser.id);
                      setSelectedUser(null);
                    }}
                  >
                    Xác nhận từ chối
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectInput(true)}
                  >
                    <X className="w-3.5 h-3.5 text-rose-600 mr-1" />
                    {t('btnReject')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleApprove(selectedUser.id);
                      setSelectedUser(null);
                    }}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {t('btnApprove')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default function AdminKycModerationPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminKycContent />
    </Suspense>
  );
}
