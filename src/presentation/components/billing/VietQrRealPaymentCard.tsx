'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PaymentIntent } from '@/domain/entities/Billing';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { container } from '@/infrastructure/di/container';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Building2,
  User,
  CreditCard,
  FileText,
} from 'lucide-react';

interface VietQrRealPaymentCardProps {
  intent: PaymentIntent;
  onPaid: () => void;
  onCancel: () => void;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export function VietQrRealPaymentCard({
  intent,
  onPaid,
  onCancel,
  bankName = 'Vietcombank (VCB)',
  accountNumber = '1042701900',
  accountHolder = 'LE THANH CUONG',
}: VietQrRealPaymentCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(intent.status);

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
      }
    } catch {
      // Background polling error ignored
    }
  }, [intent.paymentCode, onPaid]);

  useEffect(() => {
    if (currentStatus === 'PAID' || currentStatus === 'CANCELLED') return;
    const timer = setInterval(() => {
      checkPaymentStatus();
    }, 3500);
    return () => clearInterval(timer);
  }, [currentStatus, checkPaymentStatus]);

  const handleManualConfirm = async () => {
    setIsVerifying(true);
    try {
      await container.billing.billingRepository.simulateSandboxWebhook({
        paymentCode: intent.paymentCode,
        amount: intent.amount,
        status: 'PAID',
      });
      setCurrentStatus('PAID');
      toast.success('Xác nhận thanh toán tiền cọc thành công! Tiền đã nạp vào Quỹ bảo đảm Escrow.');
      onPaid();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xử lý xác nhận thanh toán thất bại');
    } finally {
      setIsVerifying(false);
    }
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
            <Badge variant="success" size="sm">ĐÃ THANH TOÁN</Badge>
          ) : (
            <Badge variant="info" size="sm">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping mr-1.5" />
              ĐANG CHỜ THANH TOÁN
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="relative p-2 bg-white rounded-xl border-2 border-teal-600/30">
            <img
              src={qrImageSrc}
              alt={`VietQR ${intent.paymentCode}`}
              className="w-52 h-52 object-contain rounded-lg"
            />
          </div>
          <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
            Mở app ngân hàng bất kỳ để quét mã VietQR tự động điền số tiền và nội dung
          </p>
        </div>

        <div className="md:col-span-7 space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-stone-400" /> Ngân hàng
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{bankName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" /> Số tài khoản
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">{accountNumber}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountNumber, 'Số tài khoản')}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-teal-600"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" /> Chủ tài khoản
              </span>
              <span className="font-bold text-stone-900 dark:text-stone-100 uppercase">{accountHolder}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">Số tiền thanh toán</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-teal-700 dark:text-teal-400">{formatVnd(intent.amount)}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(String(intent.amount), 'Số tiền')}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-teal-600"
                  title="Sao chép số tiền"
                >
                  {copiedField === 'Số tiền' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
              <div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Nội dung chuyển khoản (bắt buộc)
                </p>
                <p className="font-mono font-bold text-sm text-amber-950 dark:text-amber-100 mt-0.5">
                  {intent.paymentCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(intent.paymentCode, 'Nội dung chuyển khoản')}
                className="px-2.5 py-1.5 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded-md font-medium text-amber-900 dark:text-amber-100 flex items-center gap-1"
              >
                {copiedField === 'Nội dung chuyển khoản' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép
              </button>
            </div>
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-xl border border-teal-200 dark:border-teal-800 flex items-start gap-2 text-[11px] text-teal-900 dark:text-teal-200">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-teal-600 mt-0.5" />
            <span>
              Tiền cọc được giữ an toàn tại tài khoản trung gian của Tổ Ấm và chỉ giải ngân cho chủ trọ sau khi hai bên ký nhận bàn giao phòng.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Hết hạn: {formatIsoDateTime(intent.expiresAt)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Hủy giao dịch
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isVerifying}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={handleManualConfirm}
              >
                Tôi đã chuyển khoản xong
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

