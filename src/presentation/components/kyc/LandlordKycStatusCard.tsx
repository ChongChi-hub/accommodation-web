'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { useAuthenticatedKycImage } from '@/presentation/hooks/useAuthenticatedKycImage';
import { useFaceVerification } from '@/presentation/hooks/useFaceVerification';
import { ShieldCheck, Clock, AlertTriangle, ShieldX, RefreshCw, Maximize2, Loader2, Eye } from 'lucide-react';

interface LandlordKycStatusCardProps {
  status: LandlordKycStatus;
  onResubmitClick: () => void;
  role?: 'TENANT' | 'LANDLORD';
}

export function LandlordKycStatusCard({ status, onResubmitClick, role = 'LANDLORD' }: LandlordKycStatusCardProps) {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('kyc');
  const frontImage = useAuthenticatedKycImage(status.hasFrontImage ? '/landlord/kyc/images/front' : null);
  const backImage = useAuthenticatedKycImage(status.hasBackImage ? '/landlord/kyc/images/back' : null);
  const { faceStatus } = useFaceVerification();

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string | null;
  }>({
    isOpen: false,
    title: '',
    url: null,
  });

  const renderBadge = () => {
    switch (status.status) {
      case 'APPROVED':
        return (
          <Badge variant="success" size="md">
            <ShieldCheck className="w-4 h-4 mr-1 text-success" />
            {role === 'TENANT' ? 'Đã xác minh danh tính' : t('badgeVerified')}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="warning" size="md">
            <Clock className="w-4 h-4 mr-1 text-warning" />
            {t('badgePending')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="danger" size="md">
            <ShieldX className="w-4 h-4 mr-1 text-danger" />
            {t('badgeRejected')}
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="md">
            <AlertTriangle className="w-4 h-4 mr-1 text-foreground-muted" />
            {t('badgeNone')}
          </Badge>
        );
    }
  };

  return (
    <Card className="p-6 border border-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {status.fullNameOnId || (role === 'TENANT' ? 'Người thuê' : 'Chủ trọ')}
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            {tAuto('k0218')}{' '}<span className="font-mono font-medium text-foreground">{status.idNumberMasked || 'Chưa cung cấp'}</span>
          </p>
        </div>
        {renderBadge()}
      </div>

      {/* Tiến độ 2 phần KYC: Giấy tờ & Khuôn mặt / Nâng cấp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl border border-border">
        <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">1</span>
              {tAuto('k0504')}
            </span>
            <Badge variant={status.status === 'APPROVED' ? 'success' : status.status === 'REJECTED' ? 'danger' : status.status === 'PENDING' ? 'warning' : 'neutral'} size="sm">
              {status.status}
            </Badge>
          </div>
          <p className="text-[11px] text-foreground-muted">
            {status.status === 'APPROVED' ? 'Đã xác minh thông tin giấy tờ' : status.status === 'PENDING' ? 'Đang chờ Admin / Kiểm duyệt viên duyệt' : status.status === 'REJECTED' ? 'Giấy tờ bị từ chối' : 'Chưa nộp giấy tờ'}
          </p>
        </div>

        {role === 'TENANT' ? (
          <div className="space-y-1.5 sm:pl-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">2</span>
                Trở thành Chủ trọ
              </span>
              <Badge variant={status.status === 'APPROVED' ? 'success' : 'neutral'} size="sm">
                {status.status === 'APPROVED' ? 'SẴN SÀNG' : 'CHỜ DUYỆT CCCD'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-foreground-muted">
                {status.status === 'APPROVED' ? 'Đã đủ điều kiện nâng cấp lên Chủ trọ' : 'Cần hoàn tất duyệt CCCD trước khi nâng cấp'}
              </p>
              {status.status === 'APPROVED' && (
                <Link href="/become-landlord" className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
                  Nâng cấp ngay &rarr;
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 sm:pl-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">2</span>
                {tAuto('k0482')}
              </span>
              <Badge variant={faceStatus?.status === 'PASSED' ? 'success' : faceStatus?.status === 'FAILED' ? 'danger' : faceStatus?.status === 'PENDING' ? 'warning' : 'neutral'} size="sm">
                {faceStatus?.status || 'NONE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-foreground-muted">
                {faceStatus?.status === 'PASSED' ? 'Khuôn mặt đã khớp CCCD' : faceStatus?.status === 'PENDING' ? 'Đang chờ đối chiếu khuôn mặt' : faceStatus?.status === 'FAILED' ? 'Khuôn mặt chưa đạt' : 'Chưa thực hiện'}
              </p>
              {faceStatus?.status !== 'PASSED' && (
                <Link href="/dashboard/landlord/kyc/face" className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5">
                  {faceStatus?.status === 'FAILED' ? 'Thử lại' : 'Thực hiện'} &rarr;
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {status.status === 'PENDING' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{t('bannerPendingTitle')}</p>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {role === 'TENANT' ? (
              <>
                Hồ sơ xác minh căn cước công dân của bạn đã được gửi thành công và đang được <strong>Admin / Kiểm duyệt viên</strong> đối chiếu thông tin. Sau khi được duyệt, bạn sẽ có thể ký hợp đồng thuê trọ điện tử và nhận bảo vệ tiền cọc an toàn trên Tổ Ấm.
              </>
            ) : (
              <>
                Hồ sơ xác minh căn cước công dân của bạn đã được gửi thành công và đang được <strong>Admin / Kiểm duyệt viên</strong> đối chiếu thông tin. Quá trình kiểm duyệt thường diễn ra nhanh chóng. Sau khi được duyệt, bạn sẽ được cấp quyền đăng phòng trọ.
              </>
            )}
          </p>
        </div>
      )}

      {status.status === 'REJECTED' && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-danger">{t('bannerRejectedTitle')}</p>
            <p className="text-xs text-danger-foreground">
              {t('bannerRejectedDesc', {
                reason: status.rejectReasonNote || status.rejectReasonCode || 'Thông tin chưa đạt',
                remaining: status.remainingAttempts,
              })}
            </p>
          </div>
          {status.canResubmit && status.remainingAttempts > 0 && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={onResubmitClick}
            >
              {t('submit')}
            </Button>
          )}
        </div>
      )}

      {(status.hasFrontImage || status.hasBackImage) && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Ảnh chụp CCCD đã gửi
            </p>
            <span className="text-[11px] text-foreground-muted">Nhấn vào ảnh để xem kích thước lớn</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mặt trước */}
            <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-16/10 flex items-center justify-center">
              {frontImage.isLoading ? (
                <div className="flex flex-col items-center gap-2 text-foreground-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">Đang tải ảnh mặt trước...</span>
                </div>
              ) : frontImage.imageUrl ? (
                <>
                  <img
                    src={frontImage.imageUrl}
                    alt="Mặt trước CCCD"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModal({
                          isOpen: true,
                          title: 'Ảnh mặt trước CCCD',
                          url: frontImage.imageUrl,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-surface/90 text-foreground text-xs font-medium flex items-center gap-1.5 shadow hover:bg-surface cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Phóng to
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                    Mặt trước CCCD
                  </div>
                </>
              ) : (
                <span className="text-xs text-foreground-muted">{t('frontImage')}</span>
              )}
            </div>

            {/* Mặt sau */}
            <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-16/10 flex items-center justify-center">
              {backImage.isLoading ? (
                <div className="flex flex-col items-center gap-2 text-foreground-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">Đang tải ảnh mặt sau...</span>
                </div>
              ) : backImage.imageUrl ? (
                <>
                  <img
                    src={backImage.imageUrl}
                    alt="Mặt sau CCCD"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewModal({
                          isOpen: true,
                          title: 'Ảnh mặt sau CCCD',
                          url: backImage.imageUrl,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-surface/90 text-foreground text-xs font-medium flex items-center gap-1.5 shadow hover:bg-surface cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Phóng to
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                    Mặt sau CCCD
                  </div>
                </>
              ) : (
                <span className="text-xs text-foreground-muted">{t('backImage')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal phóng to ảnh */}
      <Dialog
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, title: '', url: null })}
        title={previewModal.title}
        size="lg"
      >
        <div className="max-h-[75vh] overflow-auto flex items-center justify-center rounded-xl bg-black/5 p-2">
          {previewModal.url && (
            <img
              src={previewModal.url}
              alt={previewModal.title}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
            />
          )}
        </div>
      </Dialog>
    </Card>
  );
}

export const IdentityKycStatusCard = LandlordKycStatusCard;

