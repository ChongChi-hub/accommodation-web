'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { KycModerationDetail } from '@/domain/entities/LandlordKyc';
import { FaceModerationDetail } from '@/domain/entities/FaceVerification';
import { container } from '@/infrastructure/di/container';
import { useAuthenticatedKycImage } from '@/presentation/hooks/useAuthenticatedKycImage';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldCheck, Check, X, AlertTriangle, ZoomIn, Eye, Image as ImageIcon } from 'lucide-react';

interface KycModerationModalProps {
  kyc: KycModerationDetail;
  onClose: () => void;
  onApprove: (id: string, version: number) => Promise<void>;
  onReject: (id: string, reasonCode: string, reasonNote: string, version: number) => Promise<void>;
}

export function KycModerationModal({ kyc, onClose, onApprove, onReject }: KycModerationModalProps) {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('kyc');
  const frontImg = useAuthenticatedKycImage(
    kyc.frontImageUrl ? null : kyc.hasFrontImage !== false ? `/moderation/kyc/${kyc.id}/images/front` : null
  );
  const backImg = useAuthenticatedKycImage(
    kyc.backImageUrl ? null : kyc.hasBackImage !== false ? `/moderation/kyc/${kyc.id}/images/back` : null
  );

  const effectiveFrontUrl = kyc.frontImageUrl || frontImg.imageUrl;
  const effectiveBackUrl = kyc.backImageUrl || backImg.imageUrl;

  const [faceDetail, setFaceDetail] = useState<FaceModerationDetail | null>(null);
  const [frameUrls, setFrameUrls] = useState<Record<string, string>>({});
  const [unblurred, setUnblurred] = useState<Record<string, boolean>>({});
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showFaceReject, setShowFaceReject] = useState(false);
  const [reasonCode, setReasonCode] = useState('BLURRY_IMAGE');
  const [faceReasonCode, setFaceReasonCode] = useState('KHONG_KHOP_GIAY_TO');
  const [reasonNote, setReasonNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    container.kyc.faceVerificationUseCases.getModerationFaceDetail(kyc.id).then(setFaceDetail).catch(() => {});
  }, [kyc.id]);

  const loadFrameUrl = async (frameId: string) => {
    if (frameUrls[frameId]) return frameUrls[frameId];
    try {
      const blob = await container.kyc.faceVerificationUseCases.getModerationFrameBlob(kyc.id, frameId);
      const url = URL.createObjectURL(blob);
      setFrameUrls((prev) => ({ ...prev, [frameId]: url }));
      return url;
    } catch {
      return null;
    }
  };

  const toggleFrame = async (frameId: string) => {
    await loadFrameUrl(frameId);
    setUnblurred((prev) => ({ ...prev, [frameId]: !prev[frameId] }));
  };

  const handleFaceDecision = async (decision: 'PASSED' | 'FAILED') => {
    if (!faceDetail) return;
    setIsProcessing(true);
    try {
      await container.kyc.faceVerificationUseCases.decide(
        kyc.id, decision, decision === 'FAILED' ? faceReasonCode : undefined, reasonNote, faceDetail.version
      );
      const updated = await container.kyc.faceVerificationUseCases.getModerationFaceDetail(kyc.id);
      setFaceDetail(updated);
      setShowFaceReject(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative bg-surface dark:bg-stone-900 border border-border rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl my-6 max-h-[92vh] flex flex-col text-foreground">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> {kyc.fullNameOnId || kyc.userFullName || 'Hồ sơ chủ trọ'}
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Email: <span className="font-medium text-foreground">{kyc.userEmail}</span> • Số CCCD:{' '}
              <span className="font-mono font-semibold text-primary">{kyc.idNumberPlain || kyc.idNumberMasked}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={kyc.status === 'APPROVED' ? 'success' : kyc.status === 'REJECTED' ? 'danger' : 'warning'}>
              {kyc.status}
            </Badge>
            {faceDetail && (
              <Badge variant={faceDetail.status === 'PASSED' ? 'success' : faceDetail.status === 'FAILED' ? 'danger' : 'warning'}>
                {tAuto('k0485')}{' '}{faceDetail.status}
              </Badge>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-colors cursor-pointer ml-2"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Cảnh báo kiểm toán */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Cảnh báo an ninh & bảo mật:</strong> Mọi thao tác xem ảnh CCCD, xem số định danh và quyết định phê duyệt đều được ghi vết vĩnh viễn vào nhật ký kiểm toán hệ thống (Audit Log).
            </p>
          </div>

          {/* Bảng thông tin định danh chi tiết */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-3">
            <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
              Thông tin định danh Căn cước công dân
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-foreground-muted block text-[11px]">Họ tên trên thẻ</span>
                <span className="font-bold text-foreground text-sm">{kyc.fullNameOnId}</span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Số CCCD (12 số)</span>
                <span className="font-mono font-bold text-primary text-sm">{kyc.idNumberPlain || kyc.idNumberMasked}</span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Ngày sinh</span>
                <span className="font-medium text-foreground">{kyc.dateOfBirth || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Ngày cấp CCCD</span>
                <span className="font-medium text-foreground">{kyc.issueDate || 'Chưa cung cấp'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-foreground-muted block text-[11px]">Nơi cấp</span>
                <span className="font-medium text-foreground">{kyc.issuePlace || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Số điện thoại</span>
                <span className="font-medium text-foreground">{kyc.userPhone || 'Chưa cập nhật'}</span>
              </div>
              <div>
                <span className="text-foreground-muted block text-[11px]">Thời gian gửi hồ sơ</span>
                <span className="font-medium text-foreground">{kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString('vi-VN') : 'Mới đây'}</span>
              </div>
            </div>
          </div>

          {/* Khu vực ảnh CCCD 2 mặt */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                Ảnh chụp thẻ CCCD hai mặt
              </h3>
              <span className="text-[11px] text-foreground-muted">Nhấn vào ảnh để xem kích thước lớn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CCCD Mặt trước */}
              <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-16/10 flex flex-col items-center justify-center">
                {effectiveFrontUrl ? (
                  <>
                    <img
                      src={effectiveFrontUrl}
                      alt="Mặt trước CCCD"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102 cursor-pointer"
                      onClick={() => setZoomedImage({ url: effectiveFrontUrl, title: 'Ảnh mặt trước CCCD' })}
                    />
                    <div
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => setZoomedImage({ url: effectiveFrontUrl, title: 'Ảnh mặt trước CCCD' })}
                    >
                      <span className="px-3 py-1.5 rounded-lg bg-surface/90 text-foreground text-xs font-medium flex items-center gap-1.5 shadow">
                        <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                      Mặt trước CCCD
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-foreground-muted">Đang tải ảnh mặt trước hoặc không có ảnh</span>
                )}
              </div>

              {/* CCCD Mặt sau */}
              <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-16/10 flex flex-col items-center justify-center">
                {effectiveBackUrl ? (
                  <>
                    <img
                      src={effectiveBackUrl}
                      alt="Mặt sau CCCD"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102 cursor-pointer"
                      onClick={() => setZoomedImage({ url: effectiveBackUrl, title: 'Ảnh mặt sau CCCD' })}
                    />
                    <div
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => setZoomedImage({ url: effectiveBackUrl, title: 'Ảnh mặt sau CCCD' })}
                    >
                      <span className="px-3 py-1.5 rounded-lg bg-surface/90 text-foreground text-xs font-medium flex items-center gap-1.5 shadow">
                        <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                      Mặt sau CCCD
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-foreground-muted">Đang tải ảnh mặt sau hoặc không có ảnh</span>
                )}
              </div>
            </div>
          </div>

          {/* Khung hình khuôn mặt sinh trắc học nếu có */}
          {faceDetail?.frames && faceDetail.frames.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                Ảnh xác thực khuôn mặt sinh trắc học
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {faceDetail.frames.map((frame, idx) => {
                  const isRevealed = unblurred[frame.id];
                  const url = frameUrls[frame.id];
                  return (
                    <div key={frame.id} className="relative rounded-xl overflow-hidden border border-border bg-muted/40 h-36 flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] text-foreground-muted mb-1 font-medium truncate w-full text-center">Khung {idx + 1}: {frame.purpose}</span>
                      <div className="relative w-full flex-1 overflow-hidden rounded bg-black flex items-center justify-center cursor-pointer" onClick={() => toggleFrame(frame.id)}>
                        {url ? (
                          <img src={url} alt={frame.purpose} className={`w-full h-full object-cover transition duration-200 ${isRevealed ? '' : 'filter blur-md'}`} />
                        ) : (
                          <div className="text-center p-2 text-white/80 text-[11px] flex flex-col items-center gap-1">
                            <Eye className="w-4 h-4 text-primary" /> <span>Nhấn để xem</span>
                          </div>
                        )}
                        {url && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); setZoomedImage({ url, title: `Khung khuôn mặt ${idx + 1}` }); }} className="absolute bottom-1 right-1 p-1 bg-black/60 rounded text-white text-[10px]"><ZoomIn className="w-3 h-3" /></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thao tác khuôn mặt nếu PENDING */}
          {faceDetail && faceDetail.status === 'PENDING' && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-foreground">Thẩm định khuôn mặt:</span>
              {showFaceReject ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={faceReasonCode} onChange={(e) => setFaceReasonCode(e.target.value)} className="text-xs rounded border border-border bg-surface px-2 py-1 text-foreground">
                    <option value="KHONG_KHOP_GIAY_TO">Không khớp giấy tờ</option>
                    <option value="NGHI_NGO_GIA_MAO">Nghi ngờ giả mạo</option>
                    <option value="ANH_KEM_CHAT_LUONG">Ảnh kém chất lượng</option>
                    <option value="KHAC">Lý do khác</option>
                  </select>
                  <Button size="sm" variant="danger" isLoading={isProcessing} onClick={() => handleFaceDecision('FAILED')}>Xác nhận từ chối</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowFaceReject(false)}>Hủy</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-danger" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => setShowFaceReject(true)}>Từ chối mặt</Button>
                  <Button size="sm" variant="primary" leftIcon={<Check className="w-3.5 h-3.5" />} isLoading={isProcessing} onClick={() => handleFaceDecision('PASSED')}>Duyệt mặt</Button>
                </div>
              )}
            </div>
          )}

          {/* Form từ chối hồ sơ */}
          {showRejectForm && (
            <form onSubmit={(e) => { e.preventDefault(); setIsProcessing(true); onReject(kyc.id, reasonCode, reasonNote, kyc.version).finally(() => setIsProcessing(false)); }} className="p-4 rounded-xl bg-danger/10 border border-danger/20 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-semibold text-foreground">Lý do từ chối:</label>
                <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className="text-xs rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground">
                  <option value="BLURRY_IMAGE">{t('blurryImage')}</option>
                  <option value="ID_NUMBER_MISMATCH">{t('idNumberMismatch')}</option>
                  <option value="EXPIRED_DOCUMENT">{t('expiredDocument')}</option>
                  <option value="SUSPECTED_FRAUD">{t('suspectedFraud')}</option>
                  <option value="OTHER">{t('other')}</option>
                </select>
              </div>
              <textarea rows={2} value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} placeholder="Ghi chú chi tiết cho chủ trọ cần bổ sung những gì..." className="w-full text-xs rounded-lg border border-border bg-surface p-2.5 text-foreground" />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>{t('close')}</Button>
                <Button type="submit" variant="danger" size="sm" isLoading={isProcessing}>{t('reject')}</Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions Modal */}
        {!showRejectForm && (
          <div className="flex items-center justify-between pt-3 border-t border-border shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose}>{t('close')}</Button>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="text-danger border-danger/40 hover:bg-danger/10"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={() => setShowRejectForm(true)}
              >
                Từ chối hồ sơ
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                isLoading={isProcessing}
                onClick={() => {
                  setIsProcessing(true);
                  onApprove(kyc.id, kyc.version).finally(() => setIsProcessing(false));
                }}
              >
                Duyệt KYC
              </Button>
            </div>
          </div>
        )}

        {/* Zoomed Image Viewer Modal */}
        {zoomedImage && (
          <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 cursor-pointer" onClick={() => setZoomedImage(null)}>
            <div className="max-w-4xl max-h-[85vh] flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between w-full text-white text-xs px-2">
                <span className="font-semibold">{zoomedImage.title}</span>
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img src={zoomedImage.url} alt={zoomedImage.title} className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl bg-black" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
