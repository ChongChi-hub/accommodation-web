'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { container } from '@/infrastructure/di/container';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { Button } from '@/presentation/components/ui/Button';
import { ShieldAlert, ArrowRight, Clock } from 'lucide-react';

export function KycGateBanner() {
  const t = useTranslations('kyc');
  const [kycStatus, setKycStatus] = useState<LandlordKycStatus | null>(null);

  useEffect(() => {
    container.kyc.landlordKycUseCases
      .getKycStatus()
      .then(setKycStatus)
      .catch(() => {});
  }, []);

  if (!kycStatus || kycStatus.status === 'APPROVED') {
    return null;
  }

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

