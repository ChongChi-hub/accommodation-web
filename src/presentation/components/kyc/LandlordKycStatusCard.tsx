'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';
import { useAuthenticatedKycImage } from '@/presentation/hooks/useAuthenticatedKycImage';
import { ShieldCheck, Clock, AlertTriangle, ShieldX, RefreshCw } from 'lucide-react';

interface LandlordKycStatusCardProps {
  status: LandlordKycStatus;
  onResubmitClick: () => void;
}

export function LandlordKycStatusCard({ status, onResubmitClick }: LandlordKycStatusCardProps) {
  const t = useTranslations('kyc');
  const frontImage = useAuthenticatedKycImage(status.hasFrontImage ? '/landlord/kyc/images/front' : null);
  const backImage = useAuthenticatedKycImage(status.hasBackImage ? '/landlord/kyc/images/back' : null);

  const renderBadge = () => {
    switch (status.status) {
      case 'APPROVED':
        return (
          <Badge variant="success" size="md">
            <ShieldCheck className="w-4 h-4 mr-1 text-success" />
            {t('badgeVerified')}
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
          <h2 className="text-base font-bold text-foreground">{status.fullNameOnId || 'Chủ trọ'}</h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            CCCD: <span className="font-mono font-medium text-foreground">{status.idNumberMasked || 'Chưa cung cấp'}</span>
          </p>
        </div>
        {renderBadge()}
      </div>

      {status.status === 'PENDING' && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 space-y-1">
          <p className="text-sm font-semibold text-warning">{t('bannerPendingTitle')}</p>
          <p className="text-xs text-warning-foreground leading-relaxed">{t('bannerPendingDesc')}</p>
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
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">{t('frontImage')} & {t('backImage')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-40 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
              {frontImage.imageUrl ? (
                <img src={frontImage.imageUrl} alt="Front ID" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-foreground-muted">{t('frontImage')}</span>
              )}
            </div>
            <div className="h-40 rounded-xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
              {backImage.imageUrl ? (
                <img src={backImage.imageUrl} alt="Back ID" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-foreground-muted">{t('backImage')}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

