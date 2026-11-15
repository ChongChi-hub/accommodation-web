'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import {
  Camera,
  Upload,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
  Sparkles,
  User,
  CreditCard,
  Calendar,
  Building,
  MapPin,
} from 'lucide-react';
import jsQR from 'jsqr';
import {
  ParsedCccdQr,
  parseCccdQr,
  decodeQrFromImageFile,
} from './cccd-qr-parser';

interface CccdQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedCccdQr) => void;
}

type TabType = 'camera' | 'upload' | 'manual';

export function CccdQrScannerModal({
  isOpen,
  onClose,
  onApply,
}: CccdQrScannerModalProps) {
  const t = useTranslations('kyc');
  const [activeTab, setActiveTab] = useState<TabType>('camera');
  const [detectedData, setDetectedData] = useState<ParsedCccdQr | null>(null);

  // Camera states
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Upload states
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Manual raw text state
  const [manualText, setManualText] = useState('');

  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isOpen || activeTab !== 'camera') {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const parsed = parseCccdQr(code.data);
          if (parsed) {
            setDetectedData(parsed);
            stopCamera();
            toast.success(t('scanSuccessToast'));
            return;
          }
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(scanFrame);
  }, [activeTab, isOpen, stopCamera, t]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setDetectedData(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập máy ảnh');
      }

      // Ưu tiên camera sau (environment) trên điện thoại
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      const errMap: Record<string, string> = {
        NotAllowedError: 'Quyền truy cập máy ảnh bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.',
        PermissionDeniedError: 'Quyền truy cập máy ảnh bị từ chối.',
        NotFoundError: 'Không tìm thấy thiết bị máy ảnh trên thiết bị này.',
        NotReadableError: 'Máy ảnh đang được sử dụng bởi ứng dụng khác.',
      };
      setCameraError(errMap[err.name] || err.message || 'Không thể mở máy ảnh');
      setIsScanning(false);
    }
  }, [scanFrame, stopCamera]);

  // Khởi động hoặc dừng camera khi mở/đóng modal hoặc chuyển tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !detectedData) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, detectedData, startCamera, stopCamera]);

  // Xử lý upload ảnh
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingImage(true);
    setDetectedData(null);

    try {
      const parsed = await decodeQrFromImageFile(file);
      if (parsed) {
        setDetectedData(parsed);
        toast.success(t('scanSuccessToast'));
      } else {
        toast.error(t('qrNotFound'));
      }
    } catch {
      toast.error(t('qrNotFound'));
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Xử lý dán chuỗi thủ công
  const handleManualParse = () => {
    if (!manualText.trim()) return;
    const parsed = parseCccdQr(manualText);
    if (parsed) {
      setDetectedData(parsed);
      toast.success(t('scanSuccessToast'));
    } else {
      toast.error(t('qrInvalid'));
    }
  };

  const handleApply = () => {
    if (detectedData) {
      onApply(detectedData);
      onClose();
    }
  };

  const handleReset = () => {
    setDetectedData(null);
    setUploadedFileName(null);
    setManualText('');
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title={t('scanQrModalTitle')}
      description={t('scanQrModalSubtitle')}
      size="lg"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setDetectedData(null);
            }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            <Camera className="w-4 h-4" />
            {t('tabCamera')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            <Upload className="w-4 h-4" />
            {t('tabUpload')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
            }}
            className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            {t('tabManual')}
          </button>
        </div>

        {/* Kết quả nhận diện thành công */}
        {detectedData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-3">
              <div className="flex items-center gap-2 text-success font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{t('scanResultTitle')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-foreground-muted block text-[11px]">{t('fullNameOnId')}</span>
                    <strong className="font-semibold">{detectedData.fullName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-foreground">
                  <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-foreground-muted block text-[11px]">{t('idNumber')}</span>
                    <strong className="font-semibold font-mono tracking-wider">{detectedData.idNumber}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-foreground-muted block text-[11px]">{t('dateOfBirth')}</span>
                    <strong>{detectedData.dateOfBirth}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-foreground-muted block text-[11px]">{t('issueDate')}</span>
                    <strong>{detectedData.issueDate}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-foreground sm:col-span-2">
                  <Building className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-foreground-muted block text-[11px]">{t('issuePlace')}</span>
                    <span>{detectedData.issuePlace}</span>
                  </div>
                </div>

                {detectedData.address && (
                  <div className="flex items-center gap-2 text-foreground sm:col-span-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-foreground-muted block text-[11px]">{t('address')}</span>
                      <span>{detectedData.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                {t('rescan')}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApply}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {t('applyInfo')}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* TAB CAMERA */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-danger mx-auto" />
                    <p className="text-xs text-danger font-medium leading-relaxed">{cameraError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={startCamera}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      {t('retryCamera')}
                    </Button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] max-h-[340px] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanner Viewfinder Box */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                      <div className="relative w-52 h-52 border-2 border-primary/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                        {/* 4 góc ngắm */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-primary rounded-br-lg" />

                        {/* Tia quét Laser */}
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[bounce_2s_infinite] shadow-[0_0_8px_#10b981]" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                      <span className="inline-block px-3 py-1 rounded-full bg-black/60 text-white text-[11px] backdrop-blur-sm">
                        {t('cameraGuide')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB UPLOAD ẢNH */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="cccd-qr-upload"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="cccd-qr-upload" className="cursor-pointer space-y-2 block">
                    <QrCode className="w-10 h-10 text-primary mx-auto animate-pulse" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {uploadedFileName || t('uploadImageGuide')}
                      </p>
                      <p className="text-[11px] text-foreground-muted mt-0.5">
                        {t('uploadImageFormats')}
                      </p>
                    </div>
                    {isProcessingImage && (
                      <p className="text-xs text-primary font-medium animate-pulse">
                        {t('processingImage')}
                      </p>
                    )}
                  </label>
                </div>

                <div className="p-3 rounded-lg bg-card border border-border text-[11px] text-foreground-muted leading-relaxed">
                  💡 <strong>{t('tipTitle')}:</strong> {t('uploadTipText')}
                </div>
              </div>
            )}

            {/* TAB MANUAL RAW TEXT */}
            {activeTab === 'manual' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t('manualInputLabel')}
                  </label>
                  <textarea
                    rows={3}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Ví dụ: 070206002098||ĐÀO TRỌNG TRÍ|21112002|Nam|...|20052021"
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!manualText.trim()}
                    onClick={handleManualParse}
                  >
                    {t('extractBtn')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
