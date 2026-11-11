'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2, Clock, Trash2, Camera } from 'lucide-react';
import { useFaceVerification } from '@/presentation/hooks/useFaceVerification';
import { FaceVerificationScanner } from '@/presentation/components/kyc/FaceVerificationScanner';
import { Button } from '@/presentation/components/ui/Button';

export default function LandlordFaceKycPage() {
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
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại hồ sơ KYC
        </Link>
        <span className="text-xs text-muted-foreground">Bảo vệ dữ liệu theo Luật BVDLCN 91/2025/QH15 và NĐ 356/2025/NĐ-CP</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Xác thực khuôn mặt (Face Verification)</h1>
        <p className="text-sm text-muted-foreground">
          Bước 2 trong quy trình định danh chủ trọ: Đối chiếu khuôn mặt trực tuyến với ảnh chân dung trên CCCD để kích hoạt quyền đăng tin.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 rounded-lg text-sm flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs underline ml-2">Đóng</button>
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
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Khuôn mặt đã được xác thực thành công</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 max-w-md mx-auto">
                  Danh tính của bạn đã khớp với ảnh CCCD. Bạn đã đủ điều kiện đăng tin và mở hiển thị phòng cho thuê trên Tổ Ấm.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/dashboard/landlord/rooms">
                  <Button>Quản lý phòng trọ</Button>
                </Link>
                <Button variant="outline" onClick={handleRevokeConsent} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Xóa dữ liệu ảnh sinh trắc học
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
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Đang chờ kiểm duyệt viên đối chiếu</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 max-w-md mx-auto">
                  Hệ thống đã nhận các khung hình thử thách. Kiểm duyệt viên sẽ đối chiếu ảnh với CCCD của bạn trong vòng 2-4 giờ làm việc.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Ảnh được mã hóa AES-256 an toàn và tự động tiêu hủy sau 30 ngày.</p>
            </div>
          )}

          {faceStatus?.status === 'FAILED' && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Xác thực khuôn mặt chưa đạt</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Lý do: {faceStatus.rejectReasonNote || faceStatus.rejectReasonCode || 'Ảnh không khớp với giấy tờ'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Bạn còn {faceStatus.remainingAttempts} lượt thử trong 24 giờ.
                </p>
              </div>
              {faceStatus.canSubmit && (
                <Button onClick={() => setShowScanner(false)} variant="outline">
                  Thử lại xác thực khuôn mặt
                </Button>
              )}
            </div>
          )}

          {(!faceStatus || faceStatus.status === 'NONE' || (faceStatus.status === 'FAILED' && !showScanner)) && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-base">Điều khoản đồng ý thu thập dữ liệu sinh trắc học</h3>
                <div className="p-4 bg-muted/50 rounded-lg text-xs leading-relaxed text-muted-foreground space-y-2">
                  <p><strong>1. Mục đích thu thập:</strong> Đối chiếu khuôn mặt trực tuyến với ảnh chụp CCCD nhằm ngăn chặn mạo danh chủ trọ, bảo vệ an toàn cho người thuê và minh bạch nền tảng.</p>
                  <p><strong>2. Thời hạn lưu trữ:</strong> Khung hình ảnh khuôn mặt được lưu trữ mã hóa chuẩn AES-GCM 256-bit trong thời hạn tối đa 30 ngày kể từ khi có kết quả duyệt, sau đó hệ thống sẽ tự động tiêu hủy hoàn toàn.</p>
                  <p><strong>3. Quyền của chủ trọ:</strong> Bạn có quyền rút lại đồng ý và yêu cầu xóa ngay lập tức mọi khung hình đã lưu thông qua tính năng "Xóa dữ liệu khuôn mặt" bất cứ lúc nào.</p>
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
                    Tôi đã đọc, hiểu rõ và <strong>đồng ý riêng</strong> cho phép nền tảng Tổ Ấm thu nhận và xử lý ảnh khuôn mặt theo các điều khoản bảo mật dữ liệu cá nhân nêu trên.
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleStartChallenge} disabled={!consentChecked}>
                  <Camera className="w-4 h-4 mr-1.5" /> Bắt đầu xác thực khuôn mặt
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

