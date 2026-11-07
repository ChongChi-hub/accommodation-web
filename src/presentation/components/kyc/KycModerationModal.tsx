'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { KycModerationDetail } from '@/domain/entities/LandlordKyc';
import { useAuthenticatedKycImage } from '@/presentation/hooks/useAuthenticatedKycImage';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle, ZoomIn } from 'lucide-react';

interface KycModerationModalProps {
  kyc: KycModerationDetail;
  onClose: () => void;
  onApprove: (id: string, version: number) => Promise<void>;
  onReject: (id: string, reasonCode: string, reasonNote: string, version: number) => Promise<void>;
}

export function KycModerationModal({ kyc, onClose, onApprove, onReject }: KycModerationModalProps) {
  const t = useTranslations('kyc');
  const frontImg = useAuthenticatedKycImage(kyc.hasFrontImage ? `/moderation/kyc/${kyc.id}/images/front` : null);
  const backImg = useAuthenticatedKycImage(kyc.hasBackImage ? `/moderation/kyc/${kyc.id}/images/back` : null);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reasonCode, setReasonCode] = useState('BLURRY_IMAGE');
  const [reasonNote, setReasonNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(kyc.id, kyc.version);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await onReject(kyc.id, reasonCode, reasonNote, kyc.version);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>{kyc.fullNameOnId}</span>
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Email: {kyc.userEmail} | SĐT: {kyc.userPhone}
            </p>
          </div>
          <Badge variant={kyc.status === 'APPROVED' ? 'success' : kyc.status === 'REJECTED' ? 'danger' : 'warning'}>
            {kyc.status}
          </Badge>
        </div>

        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex gap-2.5 text-xs text-warning-foreground">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p>{t('moderationAuditWarning')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-xl text-xs">
          <div>
            <span className="text-foreground-muted block">{t('idNumber')}</span>
            <span className="font-mono font-semibold text-foreground">{kyc.idNumberMasked}</span>
          </div>
          <div>
            <span className="text-foreground-muted block">{t('dateOfBirth')}</span>
            <span className="font-semibold text-foreground">{kyc.dateOfBirth || '-'}</span>
          </div>
          <div>
            <span className="text-foreground-muted block">{t('issueDate')}</span>
            <span className="font-semibold text-foreground">{kyc.issueDate || '-'}</span>
          </div>
          <div>
            <span className="text-foreground-muted block">{t('issuePlace')}</span>
            <span className="font-semibold text-foreground truncate block">{kyc.issuePlace || '-'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 h-48 flex items-center justify-center">
            {frontImg.imageUrl ? (
              <>
                <img src={frontImg.imageUrl} alt="Front ID" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setZoomedImage(frontImg.imageUrl)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-xs text-foreground-muted">{t('frontImage')}</span>
            )}
          </div>

          <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 h-48 flex items-center justify-center">
            {backImg.imageUrl ? (
              <>
                <img src={backImg.imageUrl} alt="Back ID" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setZoomedImage(backImg.imageUrl)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-xs text-foreground-muted">{t('backImage')}</span>
            )}
          </div>
        </div>

        {showRejectForm ? (
          <form onSubmit={handleReject} className="p-4 rounded-xl bg-danger/10 border border-danger/20 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">{t('rejectReason')}</label>
              <select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                className="w-full text-xs rounded-lg border border-border bg-card px-3 py-2 text-foreground"
              >
                <option value="BLURRY_IMAGE">{t('blurryImage')}</option>
                <option value="ID_NUMBER_MISMATCH">{t('idNumberMismatch')}</option>
                <option value="EXPIRED_DOCUMENT">{t('expiredDocument')}</option>
                <option value="SUSPECTED_FRAUD">{t('suspectedFraud')}</option>
                <option value="UNDERAGE">{t('underage')}</option>
                <option value="OTHER">{t('other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">{t('rejectReasonNote')}</label>
              <textarea
                rows={2}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                placeholder={t('rejectReasonNotePlaceholder')}
                className="w-full text-xs rounded-lg border border-border bg-card px-3 py-2 text-foreground resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>
                {t('close')}
              </Button>
              <Button type="submit" variant="danger" size="sm" isLoading={isProcessing}>
                {t('reject')}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('close')}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-danger border-danger/40 hover:bg-danger/10"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={() => setShowRejectForm(true)}
              >
                {t('reject')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                isLoading={isProcessing}
                onClick={handleApprove}
              >
                {t('approve')}
              </Button>
            </div>
          </div>
        )}

        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} alt="Zoomed ID" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}

