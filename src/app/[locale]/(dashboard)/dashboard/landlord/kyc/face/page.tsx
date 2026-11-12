'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2, Clock, Trash2, Camera } from 'lucide-react';
import { useFaceVerification } from '@/presentation/hooks/useFaceVerification';
import { FaceVerificationScanner } from '@/presentation/components/kyc/FaceVerificationScanner';
import { Button } from '@/presentation/components/ui/Button';

export default function LandlordFaceKycPage() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('kyc');
  const { faceStatus, challenge, isLoading, error, requestChallenge, submitFrames, revokeConsent } = useFaceVerification();

  const [consentChecked, setConsentChecked] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleStartChallenge = async () => {
    if (!consentChecked) return;
    try {
      await requestChallenge(true);
      setShowScanner(true);
    } catch {
      // Error handled in hook
    }
  };

  const handleScannerSubmit = async (nonce: string, livenessClientFlag: boolean, neutral: Blob, actions: Blob[]) => {
    setIsSubmitting(true);
    try {
      await submitFrames(nonce, livenessClientFlag, neutral, actions);
      setShowScanner(false);
      setFeedbackMsg('Đã gửi hồ sơ xác thực khuôn mặt thành công. Vui lòng chờ kiểm duyệt viên phê duyệt.');
    } catch (err: any) {
      setFeedbackMsg(err?.message || 'Lỗi nộp hồ sơ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeConsent = async () => {
    if (confirm('Bạn có chắc chắn muốn rút lại đồng ý và xóa toàn bộ ảnh khuôn mặt đã chụp không?')) {
      await revokeConsent();
      setFeedbackMsg('Đã rút lại đồng ý và xóa toàn bộ dữ liệu khuôn mặt theo Luật BVDLCN 91/2025/QH15 và NĐ 356/2025/NĐ-CP.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/landlord/kyc" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1.5" />{' '}{tAuto('k0150')}
        </Link>
        <span className="text-xs text-muted-foreground">{tAuto('k0151')}</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{tAuto('k0152')}</h1>
        <p className="text-sm text-muted-foreground">
          {tAuto('k0153')}
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-lg text-sm flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs underline ml-2">{tAuto('k0154')}</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showScanner && challenge ? (
        <FaceVerificationScanner
          challenge={challenge}
          onSubmit={handleScannerSubmit}
          onCancel={() => setShowScanner(false)}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="space-y-6">
          {faceStatus?.status === 'PASSED' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{tAuto('k0155')}</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 max-w-md mx-auto">
                  {tAuto('k0156')}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/dashboard/landlord/rooms">
                  <Button>{tAuto('k0157')}</Button>
                </Link>
                <Button variant="outline" onClick={handleRevokeConsent} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1.5" />{' '}{tAuto('k0158')}
                </Button>
              </div>
            </div>
          )}

          {faceStatus?.status === 'PENDING' && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">{tAuto('k0159')}</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 max-w-md mx-auto">
                  {tAuto('k0160')}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{tAuto('k0161')}</p>
            </div>
          )}

          {faceStatus?.status === 'FAILED' && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">{tAuto('k0162')}</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {tAuto('k0163')}{' '}{faceStatus.rejectReasonNote || faceStatus.rejectReasonCode || 'Ảnh không khớp với giấy tờ'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {tAuto('k0164')}{' '}{faceStatus.remainingAttempts}{' '}{tAuto('k0165')}
                </p>
              </div>
              {faceStatus.canSubmit && (
                <Button onClick={() => setShowScanner(false)} variant="outline">
                  {tAuto('k0166')}
                </Button>
              )}
            </div>
          )}

          {(!faceStatus || faceStatus.status === 'NONE' || (faceStatus.status === 'FAILED' && !showScanner)) && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-base">{tAuto('k0167')}</h3>
                <div className="p-4 bg-muted/50 rounded-lg text-xs leading-relaxed text-muted-foreground space-y-2">
                  <p><strong>{tAuto('k0168')}</strong>{' '}{tAuto('k0169')}</p>
                  <p><strong>{tAuto('k0170')}</strong>{' '}{tAuto('k0171')}</p>
                  <p><strong>{tAuto('k0172')}</strong>{' '}{tAuto('k0173')}</p>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="face-consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="face-consent" className="text-xs text-foreground cursor-pointer leading-relaxed">
                    {tAuto('k0174')}{' '}<strong>{tAuto('k0175')}</strong>{' '}{tAuto('k0176')}
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleStartChallenge} disabled={!consentChecked}>
                  <Camera className="w-4 h-4 mr-1.5" />{' '}{tAuto('k0177')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

