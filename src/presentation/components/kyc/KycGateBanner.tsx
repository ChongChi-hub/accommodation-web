'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { useFaceVerification } from '@/presentation/hooks/useFaceVerification';
import { Button } from '@/presentation/components/ui/Button';
import { ShieldAlert, ArrowRight, Clock } from 'lucide-react';

export function KycGateBanner() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('kyc');
  const [kycStatus, setKycStatus] = useState<LandlordKycStatus | null>(null);
  const { faceStatus } = useFaceVerification();

  useEffect(() => {
    container.kyc.landlordKycUseCases
      .getKycStatus()
      .then(setKycStatus)
      .catch(() => {});
  }, []);

  if (!kycStatus) return null;

  const docApproved = kycStatus.status === 'APPROVED';
  const facePassed = faceStatus?.status === 'PASSED';

  // If both doc and face verification are passed, no banner needed
  if (docApproved && facePassed) return null;

  // Case 1: Doc KYC is approved, but face verification is still pending/missing
  if (docApproved && !facePassed) {
    const isFacePending = faceStatus?.status === 'PENDING';
    return (
      <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">
              {isFacePending ? 'Đang chờ duyệt xác thực khuôn mặt' : 'Cần hoàn tất Xác thực khuôn mặt'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isFacePending
                ? 'Hồ sơ khuôn mặt đang được đối chiếu với CCCD. Tính năng đăng tin phòng sẽ kích hoạt ngay khi hoàn tất.'
                : 'Giấy tờ tùy thân đã được duyệt. Vui lòng hoàn thành bước chụp ảnh khuôn mặt để kích hoạt quyền đăng tin.'}
            </p>
          </div>
        </div>
        {!isFacePending && (
          <Link href="/dashboard/landlord/kyc/face">
            <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {tAuto('k0482')}
            </Button>
          </Link>
        )}
      </div>
    );
  }

  // Case 2: Document KYC is pending, rejected, or none
  const isPending = kycStatus.status === 'PENDING';
  return (
    <div
      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isPending
          ? 'bg-warning/10 border-warning/20 text-warning-foreground'
          : 'bg-danger/10 border-danger/20 text-danger-foreground'
      }`}
    >
      <div className="flex items-start gap-3">
        {isPending ? (
          <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            {isPending ? t('bannerPendingTitle') : t('gateSubmitTitle')}
          </p>
          <p className="text-xs text-foreground-muted">
            {isPending ? t('bannerPendingDesc') : t('gateSubmitDesc')}
          </p>
        </div>
      </div>

      <Link href="/dashboard/landlord/kyc">
        <Button
          variant={isPending ? 'outline' : 'danger'}
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {t('goToKyc')}
        </Button>
      </Link>
    </div>
  );
}

