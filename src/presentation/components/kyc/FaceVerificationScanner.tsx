'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { FaceChallenge } from '@/domain/entities/FaceVerification';
import { Button } from '@/presentation/components/ui/Button';

interface Props {
  challenge: FaceChallenge;
  onSubmit: (nonce: string, livenessClientFlag: boolean, neutral: Blob, actions: Blob[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
type Stage = 'CAMERA_PERM' | 'READY' | 'CAPTURING_NEUTRAL' | 'CAPTURING_ACTIONS' | 'REVIEW';

export function FaceVerificationScanner({ challenge, onSubmit, onCancel, isSubmitting }: Props) {
  const [stage, setStage] = useState<Stage>('CAMERA_PERM');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [neutralBlob, setNeutralBlob] = useState<Blob | null>(null), [actionBlobs, setActionBlobs] = useState<Blob[]>([]);
  const [neutralPreview, setNeutralPreview] = useState<string | null>(null), [actionPreviews, setActionPreviews] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null), canvasRef = useRef<HTMLCanvasElement | null>(null), streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ truy cập máy ảnh (WebRTC)');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStage('READY');
    } catch (err: any) {
      const errMap: Record<string, string> = {
        NotAllowedError: 'Quyền truy cập máy ảnh bị từ chối. Vui lòng cho phép quyền máy ảnh trên trình duyệt.',
        PermissionDeniedError: 'Quyền truy cập máy ảnh bị từ chối. Vui lòng cho phép quyền máy ảnh trên trình duyệt.',
        NotFoundError: 'Không tìm thấy thiết bị máy ảnh trên máy tính hoặc điện thoại của bạn.',
        NotReadableError: 'Máy ảnh đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó và thử lại.',
      };
      setCameraError(errMap[err.name] || err.message || 'Không thể khởi động máy ảnh');
    }
  };

  const captureCurrentFrame = (): Blob | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current, video = videoRef.current;
    canvas.width = 480; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    ctx.drawImage(video, (video.videoWidth - minDim) / 2, (video.videoHeight - minDim) / 2, minDim, minDim, 0, 0, 480, 480);
    const arr = canvas.toDataURL('image/jpeg', 0.9).split(','), bstr = atob(arr[1]);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return new Blob([u8], { type: 'image/jpeg' });
  };

  const startCaptureSequence = () => {
    setNeutralBlob(null); setActionBlobs([]); setNeutralPreview(null); setActionPreviews([]);
    setCurrentActionIndex(0); setStage('CAPTURING_NEUTRAL');
    runCountdown(() => {
      const blob = captureCurrentFrame();
      if (blob) {
        setNeutralBlob(blob); setNeutralPreview(URL.createObjectURL(blob));
        setStage('CAPTURING_ACTIONS'); startActionCapture(0);
      }
    });
  };

  const startActionCapture = (actionIdx: number) => {
    setCurrentActionIndex(actionIdx);
    runCountdown(() => {
      const blob = captureCurrentFrame();
      if (blob) {
        setActionBlobs((prev) => [...prev, blob]);
        setActionPreviews((prev) => [...prev, URL.createObjectURL(blob)]);
        if (actionIdx + 1 < challenge.actions.length) startActionCapture(actionIdx + 1);
        else { stopCamera(); setStage('REVIEW'); }
      }
    });
  };

  const runCountdown = (onFinish: () => void) => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) { clearInterval(timer); onFinish(); return null; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setNeutralBlob(null); setActionBlobs([]); setNeutralPreview(null); setActionPreviews([]);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!neutralBlob || actionBlobs.length !== challenge.actions.length) return;
    await onSubmit(challenge.nonce, true, neutralBlob, actionBlobs);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-lg text-foreground">Thu nhận ảnh thử thách sinh trắc học</h2>
        </div>
        <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">Lượt thử {challenge.attemptNo}/3</span>
      </div>

      {stage === 'CAMERA_PERM' && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950 text-brand-600 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Yêu cầu quyền truy cập Máy ảnh (Camera)</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Trình duyệt sẽ yêu cầu quyền mở máy ảnh để chụp 1 ảnh chính diện và 2 động tác thử thách. Ảnh được mã hóa AES-256 ngay khi chụp.
            </p>
          </div>
          {cameraError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-lg text-sm flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Lỗi kết nối máy ảnh:</p>
                <p>{cameraError}</p>
                <p className="mt-1 text-xs text-muted-foreground">Liên hệ hỗ trợ kỹ thuật: 1900 8866 nếu bạn gặp sự cố phần cứng.</p>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={onCancel}>Hủy bỏ</Button>
            <Button onClick={startCamera}>Bật máy ảnh & Bắt đầu</Button>
          </div>
        </div>
      )}

      {(stage === 'READY' || stage === 'CAPTURING_NEUTRAL' || stage === 'CAPTURING_ACTIONS') && (
        <div className="space-y-4 text-center">
          <div className="relative w-80 h-80 mx-auto rounded-full overflow-hidden border-4 border-brand-500 shadow-inner bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />

            {/* Ellipse Guide Overlay */}
            <div className="absolute inset-4 border-2 border-dashed border-white/70 rounded-full pointer-events-none" />

            {countdown !== null && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-6xl font-bold text-white animate-ping">{countdown}</span>
              </div>
            )}
          </div>

          <div className="min-h-16 flex flex-col items-center justify-center">
            {stage === 'READY' && (
              <p className="text-sm text-muted-foreground">
                Hãy đưa khuôn mặt vào giữa khung tròn, tháo kính râm và đảm bảo đủ ánh sáng.
              </p>
            )}
            {stage === 'CAPTURING_NEUTRAL' && (
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Bước 1: Giữ khuôn mặt thẳng, nhìn thẳng vào ống kính</p>
                <p className="text-xs text-muted-foreground">Chuẩn bị chụp ảnh chính diện...</p>
              </div>
            )}
            {stage === 'CAPTURING_ACTIONS' && (
              <div className="space-y-1">
                <p className="font-semibold text-brand-600">
                  Bước {currentActionIndex + 2}: {challenge.actions[currentActionIndex]?.description}
                </p>
                <p className="text-xs text-muted-foreground">Thực hiện động tác và giữ yên trong 2 giây...</p>
              </div>
            )}
          </div>

          {stage === 'READY' && (
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { stopCamera(); onCancel(); }}>Hủy</Button>
              <Button onClick={startCaptureSequence}>Tôi đã sẵn sàng - Bắt đầu chụp</Button>
            </div>
          )}
        </div>
      )}

      {stage === 'REVIEW' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-foreground">Kiểm tra lại ảnh đã chụp</h3>
            <p className="text-xs text-muted-foreground">
              Đảm bảo các khung hình rõ nét, không bị lóa và ngũ quan hiển thị rõ ràng.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border rounded-lg p-2 text-center bg-muted/40">
              <div className="aspect-square rounded overflow-hidden mb-1.5 bg-black">
                {neutralPreview && <img src={neutralPreview} alt="Chính diện" className="w-full h-full object-cover" />}
              </div>
              <span className="text-xs font-medium text-foreground">1. Chính diện</span>
            </div>
            {challenge.actions.map((act, idx) => (
              <div key={act.code} className="border border-border rounded-lg p-2 text-center bg-muted/40">
                <div className="aspect-square rounded overflow-hidden mb-1.5 bg-black">
                  {actionPreviews[idx] && <img src={actionPreviews[idx]} alt={act.description} className="w-full h-full object-cover" />}
                </div>
                <span className="text-xs font-medium text-foreground truncate block">{idx + 2}. {act.description}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-xs leading-relaxed">
            Lưu ý: Hướng dẫn trong trình duyệt chỉ hỗ trợ bạn thực hiện đúng động tác. Kết quả xác thực cuối cùng sẽ do kiểm duyệt viên đối chiếu với ảnh trên thẻ CCCD của bạn.
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={handleRetake} disabled={isSubmitting} leftIcon={<RotateCcw className="w-4 h-4" />}>
              Chụp lại
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Đang mã hóa & gửi...' : 'Gửi xác thực'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

