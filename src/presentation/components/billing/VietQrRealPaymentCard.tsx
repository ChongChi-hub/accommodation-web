'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PaymentIntent } from '@/domain/entities/Billing';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { toast } from '@/presentation/stores/toast.store';
import { formatVnd } from '@/shared/utils/format-vnd';
import { container } from '@/infrastructure/di/container';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  QrCode,
  ShieldCheck,
  Building2,
  User,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface VietQrRealPaymentCardProps {
  intent: PaymentIntent;
  onPaid: () => void;
  onCancel: () => void;
  onSubmitted?: () => void;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export function VietQrRealPaymentCard({
  intent,
  onPaid,
  onCancel,
  onSubmitted,
  bankName = 'Vietcombank (VCB)',
  accountNumber = '1042701900',
  accountHolder = 'LE THANH CUONG',
}: VietQrRealPaymentCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(intent.status);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(() => {
    if (!intent.expiresAt) return 900;
    return Math.max(0, Math.floor((new Date(intent.expiresAt).getTime() - Date.now()) / 1000));
  });

  const fallbackQrUrl = `https://img.vietqr.io/image/970436-1042701900-compact2.png?amount=${intent.amount}&addInfo=${encodeURIComponent(intent.paymentCode)}&accountName=${encodeURIComponent(accountHolder)}`;
  const qrImageSrc = intent.qrUrl || fallbackQrUrl;

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`Đã sao chép ${fieldName}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Không thể sao chép, vui lòng chọn và sao chép thủ công');
    }
  };

  const checkPaymentStatus = useCallback(async () => {
    try {
      const refreshed = await container.billing.billingRepository.getPaymentIntent(intent.paymentCode);
      if (refreshed.status === 'PAID') {
        setCurrentStatus('PAID');
        toast.success('Hệ thống đã ghi nhận thanh toán tiền cọc thành công!');
        onPaid();
      } else if (refreshed.status !== currentStatus) {
        setCurrentStatus(refreshed.status);
      }
    } catch {
      // background polling error ignored
    }
  }, [intent.paymentCode, currentStatus, onPaid]);

  useEffect(() => {
    if (currentStatus === 'PAID' || currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') return;
    const timer = setInterval(() => checkPaymentStatus(), 4000);
    return () => clearInterval(timer);
  }, [currentStatus, checkPaymentStatus]);

  useEffect(() => {
    if (timeLeftSec <= 0) {
      if (currentStatus === 'PENDING') setCurrentStatus('EXPIRED');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          if (currentStatus === 'PENDING') setCurrentStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSec, currentStatus]);

  const handleTenantSubmit = async () => {
    setIsVerifying(true);
    try {
      await container.billing.billingRepository.submitPaymentIntent(intent.paymentCode, {
        note: 'Người thuê thông báo đã chuyển khoản VietQR',
      });
      setCurrentStatus('SUBMITTED');
      toast.success('Đã gửi thông báo chuyển tiền tới chủ trọ. Vui lòng chờ chủ trọ xác nhận tài khoản.');
      onSubmitted?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gửi thông báo chuyển tiền thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-200/70 dark:border-teal-800/60 pb-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-teal-700 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Quét mã VietQR để thanh toán tiền cọc
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {currentStatus === 'PAID' ? (
            <Badge variant="success" size="sm">ĐÃ THANH TOÁN (ESCROW BẢO VỆ)</Badge>
          ) : currentStatus === 'SUBMITTED' ? (
            <Badge variant="warning" size="sm">ĐÃ BÁO CHUYỂN TIỀN (CHỜ CHỦ TRỌ XÁC NHẬN)</Badge>
          ) : currentStatus === 'EXPIRED' ? (
            <Badge variant="danger" size="sm">MÃ ĐÃ HẾT HẠN</Badge>
          ) : (
            <Badge variant="info" size="sm">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping mr-1.5" />
              ĐANG CHỜ THANH TOÁN ({formatTimer(timeLeftSec)})
            </Badge>
          )}
        </div>
      </div>

      {currentStatus === 'SUBMITTED' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>
            Hệ thống đã ghi nhận thông báo chuyển tiền của bạn. Chủ trọ sẽ kiểm tra sao kê ngân hàng và xác nhận trong ít phút. Quỹ Escrow sẽ được kích hoạt bảo đảm ngay khi chủ trọ xác nhận.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="relative p-2 bg-white rounded-xl border-2 border-teal-600/30">
            <img src={qrImageSrc} alt={`VietQR ${intent.paymentCode}`} className="w-52 h-52 object-contain rounded-lg" />
          </div>
          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            Mở app ngân hàng bất kỳ để quét mã VietQR tự động điền số tiền và nội dung
          </p>
        </div>

        <div className="md:col-span-7 space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-stone-400" /> Ngân hàng</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{bankName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-stone-400" /> Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">{accountNumber}</span>
                <button type="button" onClick={() => copyToClipboard(accountNumber, 'Số tài khoản')} className="p-1 rounded hover:bg-stone-100 text-teal-600" title="Sao chép">
                  {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-stone-400" /> Chủ tài khoản</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 uppercase">{accountHolder}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">Số tiền thanh toán</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-teal-700 dark:text-teal-400">{formatVnd(intent.amount)}</span>
                <button type="button" onClick={() => copyToClipboard(String(intent.amount), 'Số tiền')} className="p-1 rounded hover:bg-stone-100 text-teal-600" title="Sao chép">
                  {copiedField === 'Số tiền' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
              <div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Nội dung chuyển khoản (bắt buộc)
                </p>
                <p className="font-mono font-bold text-sm text-amber-950 dark:text-amber-100 mt-0.5">{intent.paymentCode}</p>
              </div>
              <button type="button" onClick={() => copyToClipboard(intent.paymentCode, 'Nội dung chuyển khoản')} className="px-2.5 py-1.5 bg-amber-200 hover:bg-amber-300 rounded-md font-medium text-amber-900 flex items-center gap-1">
                {copiedField === 'Nội dung chuyển khoản' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép
              </button>
            </div>
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-xl border border-teal-200 dark:border-teal-800 flex items-start gap-2 text-[11px] text-teal-900 dark:text-teal-200">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-teal-600 mt-0.5" />
            <span>Tiền cọc được giữ an toàn tại tài khoản trung gian của Tổ Ấm và chỉ giải ngân cho chủ trọ sau khi hai bên ký nhận bàn giao phòng.</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Thời gian còn lại: <strong className="text-teal-700">{formatTimer(timeLeftSec)}</strong></span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCancel} disabled={currentStatus === 'PAID'}>
                Hủy giao dịch
              </Button>
              {currentStatus === 'SUBMITTED' ? (
                <Button variant="secondary" size="sm" disabled leftIcon={<Clock className="w-3.5 h-3.5" />}>
                  Chờ chủ trọ xác nhận
                </Button>
              ) : currentStatus === 'PAID' ? (
                <Button variant="primary" size="sm" disabled leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Đã thanh toán
                </Button>
              ) : (
                <Button variant="primary" size="sm" isLoading={isVerifying} disabled={timeLeftSec <= 0} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={handleTenantSubmit}>
                  Tôi đã chuyển tiền
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
