'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { KycModerationDetail } from '@/domain/entities/LandlordKyc';
import { FaceModerationDetail } from '@/domain/entities/FaceVerification';
import { container } from '@/infrastructure/di/container';
import { useAuthenticatedKycImage } from '@/presentation/hooks/useAuthenticatedKycImage';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldCheck, Check, X, AlertTriangle, ZoomIn, Eye, EyeOff } from 'lucide-react';

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

  const [faceDetail, setFaceDetail] = useState<FaceModerationDetail | null>(null);
  const [frameUrls, setFrameUrls] = useState<Record<string, string>>({});
  const [unblurred, setUnblurred] = useState<Record<string, boolean>>({});
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showFaceReject, setShowFaceReject] = useState(false);
  const [reasonCode, setReasonCode] = useState('BLURRY_IMAGE');
  const [faceReasonCode, setFaceReasonCode] = useState('KHONG_KHOP_GIAY_TO');
  const [reasonNote, setReasonNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl max-w-4xl w-full p-5 space-y-4 shadow-2xl my-6">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> {kyc.fullNameOnId}
            </h2>
            <p className="text-xs text-foreground-muted">Email: {kyc.userEmail} | CCCD: <span className="font-mono">{kyc.idNumberMasked}</span></p>
          </div>
          <div className="flex gap-2">
            <Badge variant={kyc.status === 'APPROVED' ? 'success' : kyc.status === 'REJECTED' ? 'danger' : 'warning'}>{kyc.status}</Badge>
            {faceDetail && (
              <Badge variant={faceDetail.status === 'PASSED' ? 'success' : faceDetail.status === 'FAILED' ? 'danger' : 'warning'}>Face: {faceDetail.status}</Badge>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/20 flex gap-2 text-xs text-warning-foreground">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p>⚠️ Cảnh báo kiểm toán: Mọi thao tác mở xem ảnh CCCD và ảnh sinh trắc học đều được ghi vết vĩnh viễn vào nhật ký kiểm toán (face_access_logs / kyc_access_logs).</p>
        </div>

        {/* CCCD & Face Frames side by side */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Đối chiếu CCCD mặt trước và các khung hình khuôn mặt (Ảnh làm mờ mặc định, bấm để xem):</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* CCCD Mặt trước */}
            <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 h-36 flex flex-col items-center justify-center p-1">
              <span className="text-[10px] text-foreground-muted mb-1 font-medium">CCCD Mặt trước</span>
              {frontImg.imageUrl ? (
                <div className="relative w-full flex-1 overflow-hidden rounded cursor-pointer" onClick={() => setZoomedImage(frontImg.imageUrl)}>
                  <img src={frontImg.imageUrl} alt="Front ID" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 p-1 bg-black/60 rounded text-white text-[10px] flex items-center gap-0.5"><ZoomIn className="w-3 h-3" /></span>
                </div>
              ) : <span className="text-xs text-foreground-muted">Không có ảnh</span>}
            </div>

            {/* Các khung hình khuôn mặt */}
            {faceDetail?.frames && faceDetail.frames.length > 0 ? (
              faceDetail.frames.map((frame, idx) => {
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
                          <Eye className="w-4 h-4 text-primary" /> <span>Bấm để tải & mở</span>
                        </div>
                      )}
                      {url && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setZoomedImage(url); }} className="absolute bottom-1 right-1 p-1 bg-black/60 rounded text-white text-[10px]"><ZoomIn className="w-3 h-3" /></button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 h-36 border border-dashed border-border rounded-xl flex items-center justify-center text-xs text-foreground-muted">
                Chủ trọ chưa nộp ảnh xác thực khuôn mặt sinh trắc học
              </div>
            )}
          </div>
        </div>

        {/* Action Panel for Face Decision if pending */}
        {faceDetail && faceDetail.status === 'PENDING' && (
          <div className="p-3 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-foreground">Đánh giá sinh trắc học khuôn mặt:</span>
            {showFaceReject ? (
              <div className="flex items-center gap-2 flex-wrap">
                <select value={faceReasonCode} onChange={(e) => setFaceReasonCode(e.target.value)} className="text-xs rounded border border-border bg-card px-2 py-1 text-foreground">
                  <option value="KHONG_KHOP_GIAY_TO">Không khớp giấy tờ</option>
                  <option value="NGHI_NGO_GIA_MAO">Nghi ngờ giả mạo</option>
                  <option value="ANH_KEM_CHAT_LUONG">Ảnh kém chất lượng</option>
                  <option value="KHAC">Lý do khác</option>
                </select>
                <Button size="sm" variant="danger" isLoading={isProcessing} onClick={() => handleFaceDecision('FAILED')}>Xác nhận từ chối khuôn mặt</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowFaceReject(false)}>Hủy</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-danger" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => setShowFaceReject(true)}>Khuôn mặt Không đạt</Button>
                <Button size="sm" variant="primary" leftIcon={<Check className="w-3.5 h-3.5" />} isLoading={isProcessing} onClick={() => handleFaceDecision('PASSED')}>Khuôn mặt Đạt</Button>
              </div>
            )}
          </div>
        )}

        {/* KYC Document Decision Form */}
        {showRejectForm ? (
          <form onSubmit={(e) => { e.preventDefault(); setIsProcessing(true); onReject(kyc.id, reasonCode, reasonNote, kyc.version).finally(() => setIsProcessing(false)); }} className="p-3 rounded-xl bg-danger/10 border border-danger/20 space-y-2 text-xs">
            <div className="flex gap-2 items-center">
              <label className="font-semibold text-foreground">Lý do từ chối:</label>
              <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className="text-xs rounded border border-border bg-card px-2 py-1 text-foreground">
                <option value="BLURRY_IMAGE">{t('blurryImage')}</option>
                <option value="ID_NUMBER_MISMATCH">{t('idNumberMismatch')}</option>
                <option value="EXPIRED_DOCUMENT">{t('expiredDocument')}</option>
                <option value="SUSPECTED_FRAUD">{t('suspectedFraud')}</option>
                <option value="OTHER">{t('other')}</option>
              </select>
            </div>
            <textarea rows={2} value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} placeholder="Ghi chú chi tiết cho chủ trọ..." className="w-full text-xs rounded border border-border bg-card p-2 text-foreground" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowRejectForm(false)}>{t('close')}</Button>
              <Button type="submit" variant="danger" size="sm" isLoading={isProcessing}>{t('reject')}</Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose}>{t('close')}</Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-danger border-danger/40" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => setShowRejectForm(true)}>Từ chối hồ sơ</Button>
              <Button variant="primary" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />} isLoading={isProcessing} onClick={() => { setIsProcessing(true); onApprove(kyc.id, kyc.version).finally(() => setIsProcessing(false)); }}>Duyệt KYC</Button>
            </div>
          </div>
        )}

        {zoomedImage && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer" onClick={() => setZoomedImage(null)}>
            <img src={zoomedImage} alt="Zoomed" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
