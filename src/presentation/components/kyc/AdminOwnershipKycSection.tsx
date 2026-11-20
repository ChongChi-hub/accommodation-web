'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AdminOwnershipDocItem } from '@/domain/entities/Billing';
import { container } from '@/infrastructure/di/container';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { ErrorState } from '@/presentation/components/ui/ErrorState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime } from '@/shared/utils/format-vnd';
import {
  Check,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react';

interface AdminOwnershipKycSectionProps {
  docs: AdminOwnershipDocItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onDocsChange: React.Dispatch<React.SetStateAction<AdminOwnershipDocItem[]>>;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  LAND_USE_RIGHT_CERT: 'GCN QSDĐ / Sổ hồng',
  AUTHORIZATION_CONTRACT: 'Hợp đồng ủy quyền cho thuê',
  SUBLEASE_AGREEMENT: 'Hợp đồng thuê lại hợp pháp',
};

const QUICK_REJECT_REASONS = [
  'Ảnh chụp/scan bị mờ, mất góc hoặc không đọc được thông tin',
  'Thông tin địa chỉ trên giấy tờ không khớp với địa chỉ phòng trọ',
  'Giấy tờ ủy quyền đã hết hạn hoặc thiếu chữ ký xác nhận',
];

export function AdminOwnershipKycSection({
  docs,
  isLoading,
  error,
  onRefresh,
  onDocsChange,
}: AdminOwnershipKycSectionProps) {
  const t = useTranslations('sprint3.ownershipKyc');
  const tKyc = useTranslations('kyc');

  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<AdminOwnershipDocItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingCount = useMemo(() => docs.filter((d) => d.status === 'PENDING').length, [docs]);
  const approvedCount = useMemo(() => docs.filter((d) => d.status === 'APPROVED').length, [docs]);
  const rejectedCount = useMemo(() => docs.filter((d) => d.status === 'REJECTED').length, [docs]);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(item.roomId).includes(q) ||
        item.roomTitle.toLowerCase().includes(q) ||
        item.landlordName.toLowerCase().includes(q) ||
        (item.maskedNumber || '').toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [docs, statusFilter, search]);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setPreviewMime('');
    setPreviewError(null);
  }, []);

  useEffect(() => {
    if (!selectedDoc) {
      clearPreview();
      return;
    }

    let cancelled = false;
    setShowRejectForm(false);
    setRejectReason('');
    clearPreview();

    const loadPreview = async () => {
      const key = selectedDoc.fileUrl?.trim();
      if (!key) {
        setPreviewError(t('adminDocUnavailable'));
        return;
      }
      if (/^https?:\/\//i.test(key)) {
        setPreviewUrl(key);
        setPreviewMime(key.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
        return;
      }

      setPreviewLoading(true);
      try {
        const signedUrl = await container.ownershipKyc.ownershipKycRepository.getSignedDownloadUrl(key);
        const { blob, contentType } = await container.ownershipKyc.ownershipKycRepository.fetchSignedBlob(signedUrl);
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setPreviewMime(contentType || blob.type || '');
      } catch {
        if (!cancelled) {
          setPreviewError(t('adminDocUnavailable'));
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [selectedDoc, clearPreview, t]);

  const handleCloseModal = () => {
    clearPreview();
    setSelectedDoc(null);
  };

  const handleReview = async (approve: boolean) => {
    if (!selectedDoc) return;
    if (!approve && !rejectReason.trim()) {
      toast.error(t('adminRejectReasonPlaceholder'));
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await container.ownershipKyc.ownershipKycRepository.reviewDoc(
        selectedDoc.id,
        approve,
        approve ? undefined : rejectReason.trim()
      );
      onDocsChange((prev) =>
        prev.map((item) =>
          item.id === selectedDoc.id
            ? {
                ...item,
                status: updated.status || (approve ? 'APPROVED' : 'REJECTED'),
                rejectReason: updated.rejectReason ?? (approve ? null : rejectReason.trim()),
                reviewedAt: updated.reviewedAt ?? new Date().toISOString(),
                expiresAt: updated.expiresAt ?? item.expiresAt,
                verifiedOwnership: approve ? true : item.verifiedOwnership,
              }
            : item
        )
      );
      toast.success(approve ? t('adminApproveSuccess') : t('adminRejectSuccess'));
      handleCloseModal();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái giấy tờ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Lỗi tải hồ sơ giấy tờ sở hữu" message={error} onRetry={onRefresh} />
      </div>
    );
  }

  const filterTabs: Array<{ id: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'; label: string; count: number }> = [
    { id: 'PENDING', label: tKyc('badgePending'), count: pendingCount },
    { id: 'APPROVED', label: tKyc('badgeVerified'), count: approvedCount },
    { id: 'REJECTED', label: tKyc('badgeRejected'), count: rejectedCount },
    { id: 'ALL', label: tKyc('all'), count: docs.length },
  ];

  const isPdf = previewMime.toLowerCase().includes('pdf') || (selectedDoc?.fileUrl || '').toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground-muted hover:bg-muted'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.id === 'PENDING' && tab.count > 0
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : 'bg-stone-200 dark:bg-stone-800 text-foreground-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="w-3.5 h-3.5 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminSearchPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRefresh}>
            Làm mới
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-border">
        {filteredDocs.length === 0 ? (
          <EmptyState title={t('adminEmptyList')} description={t('bannerDesc')} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminColRoom')}</TableHead>
                <TableHead>{t('adminColDocType')}</TableHead>
                <TableHead>{t('adminColNumber')}</TableHead>
                <TableHead>{t('adminColStatus')}</TableHead>
                <TableHead>{t('adminColCreated')}</TableHead>
                <TableHead className="text-right">{t('adminColAction')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        #{doc.roomId} - {doc.roomTitle}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        Chủ trọ: {doc.landlordName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    <div className="inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{DOC_TYPE_LABELS[doc.docType] || doc.docType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {doc.maskedNumber || '***'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        doc.status === 'APPROVED'
                          ? 'success'
                          : doc.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-foreground-muted">
                    <div>{formatIsoDateTime(doc.createdAt)}</div>
                    {doc.expiresAt && (
                      <div className="text-[10px] text-stone-400">
                        HSD: {formatIsoDateTime(doc.expiresAt)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs
                        bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-700 hover:text-white hover:border-teal-700
                        dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-600 dark:hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('adminReviewBtn')}</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  {t('adminModalTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Đóng"
                className="p-1.5 rounded-lg text-foreground-muted hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border bg-surface-muted/40 p-4 text-xs">
                <div>
                  <span className="text-foreground-muted block">Phòng trọ</span>
                  <span className="font-semibold text-foreground">
                    #{selectedDoc.roomId} - {selectedDoc.roomTitle}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block">Chủ trọ</span>
                  <span className="font-semibold text-foreground">{selectedDoc.landlordName}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block">{t('adminColDocType')}</span>
                  <span className="font-semibold text-foreground">
                    {DOC_TYPE_LABELS[selectedDoc.docType] || selectedDoc.docType}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block">{t('adminColNumber')}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedDoc.maskedNumber || '***'}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block">{t('adminColStatus')}</span>
                  <Badge
                    variant={
                      selectedDoc.status === 'APPROVED'
                        ? 'success'
                        : selectedDoc.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {selectedDoc.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-foreground-muted block">Ngày gửi</span>
                  <span className="font-medium text-foreground">
                    {formatIsoDateTime(selectedDoc.createdAt)}
                  </span>
                </div>
              </div>

              {selectedDoc.rejectReason && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Lý do từ chối trước đó: </span>
                    {selectedDoc.rejectReason}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground">{t('adminDocPreview')}</h3>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <span>{t('adminOpenNewTab')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-stone-100 dark:bg-stone-900 min-h-[240px] flex items-center justify-center overflow-hidden p-2">
                  {previewLoading ? (
                    <div className="flex items-center gap-2 text-xs text-foreground-muted py-12">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>{t('adminLoadingDoc')}</span>
                    </div>
                  ) : previewUrl ? (
                    isPdf ? (
                      <iframe
                        src={previewUrl}
                        title="Ownership document PDF"
                        className="w-full h-[380px] rounded-lg border-0"
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt={DOC_TYPE_LABELS[selectedDoc.docType] || 'Giấy tờ sở hữu'}
                        className="max-h-[380px] w-auto object-contain rounded-lg"
                      />
                    )
                  ) : (
                    <div className="text-center p-6 space-y-1 text-xs text-foreground-muted">
                      <FileText className="w-8 h-8 mx-auto text-stone-400" />
                      <p>{previewError || t('adminDocUnavailable')}</p>
                      <p className="font-mono text-[10px] text-stone-400 break-all">
                        Key: {selectedDoc.fileUrl}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {showRejectForm && (
                <div className="space-y-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-4">
                  <label className="block text-xs font-bold text-foreground">
                    {t('adminRejectReasonLabel')}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REJECT_REASONS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectReason(preset)}
                        className="px-2.5 py-1 rounded-md text-[11px] border border-border bg-surface hover:border-rose-400 text-foreground-muted hover:text-foreground cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('adminRejectReasonPlaceholder')}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectForm(false)}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      isLoading={isSubmitting}
                      onClick={() => handleReview(false)}
                    >
                      {t('adminConfirmRejectBtn')}
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={handleCloseModal} disabled={isSubmitting}>
                  Đóng
                </Button>
                {!showRejectForm && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                    onClick={() => setShowRejectForm(true)}
                    disabled={isSubmitting}
                  >
                    {t('adminRejectBtn')}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => handleReview(true)}
                >
                  {t('adminApproveBtn')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

