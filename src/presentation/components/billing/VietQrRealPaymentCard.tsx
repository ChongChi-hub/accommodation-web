'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PaymentIntent } from '@/domain/entities/Billing';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { formatVnd } from '@/shared/utils/format-vnd';
import { container } from '@/infrastructure/di/container';
import { CheckCircle2, Copy, Check, Clock, QrCode, ShieldCheck, Building2, User, CreditCard, FileText, Lock } from 'lucide-react';
import { TransferReceiptVerificationBox, isValidBankTxCode } from './TransferReceiptVerificationBox';

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
  bankName = process.env.NEXT_PUBLIC_PLATFORM_BANK_NAME || 'Vietcombank (VCB)',
  accountNumber = process.env.NEXT_PUBLIC_PLATFORM_BANK_ACCOUNT || '1042701900',
  accountHolder = process.env.NEXT_PUBLIC_PLATFORM_ACCOUNT_HOLDER || 'LE THANH CUONG',
}: VietQrRealPaymentCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(intent.status);
  const [bankTxCode, setBankTxCode] = useState<string>('');
  const [receiptHash, setReceiptHash] = useState<string>('');
  const [receiptImageUrl, setReceiptImageUrl] = useState<string>('');
  const [timeLeftSec, setTimeLeftSec] = useState<number>(() =>
    !intent.expiresAt ? 900 : Math.max(0, Math.floor((new Date(intent.expiresAt).getTime() - Date.now()) / 1000))
  );

  const canConfirmTransfer = isValidBankTxCode(bankTxCode) && Boolean(receiptHash && receiptImageUrl && receiptImageUrl.length > 20);
  const qrImageSrc = intent.qrUrl || `https://img.vietqr.io/image/${process.env.NEXT_PUBLIC_PLATFORM_BANK_BIN || '970436'}-${accountNumber}-compact2.png?amount=${intent.amount}&addInfo=${encodeURIComponent(intent.paymentCode)}&accountName=${encodeURIComponent(accountHolder)}`;

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
        toast.success('Admin đã duyệt giao dịch tiền cọc thành công! Quỹ Escrow đã được kích hoạt.');
        onPaid();
      } else if (refreshed.status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
        setCurrentStatus('CANCELLED');
        toast.error('Giao dịch tiền cọc đã bị Admin hủy do chưa nhận được tiền hợp lệ vào tài khoản sàn.');
      } else if (refreshed.status !== currentStatus) {
        setCurrentStatus(refreshed.status);
      }
    } catch { /* background polling error ignored */ }
  }, [intent.paymentCode, currentStatus, onPaid]);

  useEffect(() => {
    if (currentStatus === 'PAID' || currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') return;
    const timer = setInterval(() => checkPaymentStatus(), 5000);
    return () => clearInterval(timer);
  }, [currentStatus, checkPaymentStatus]);

  useEffect(() => {
    if (timeLeftSec <= 0) { if (currentStatus === 'PENDING') setCurrentStatus('EXPIRED'); return; }
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) { if (currentStatus === 'PENDING') setCurrentStatus('EXPIRED'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSec, currentStatus]);

  const handleTenantSubmit = async () => {
    if (!canConfirmTransfer) {
      toast.error('Bạn cần hoàn tất chuyển khoản, nhập Mã giao dịch ngân hàng (FT...) và tải Ảnh biên lai hỗ trợ lên trước khi báo đã chuyển.');
      return;
    }
    setIsVerifying(true);
    try {
      const updated = await container.billing.billingRepository.submitPaymentIntent(intent.paymentCode, {
        note: `BANK_TX:${bankTxCode.trim().toUpperCase()}|HASH:${receiptHash.trim()}`,
        receiptUrl: receiptImageUrl.trim(),
        payerName: currentUser?.fullName || currentUser?.email || undefined,
      });
      setCurrentStatus(updated.status || 'SUBMITTED');
      toast.success('Đã gửi thông báo cho Admin! Giao dịch đang ở trạng thái Đang chờ xác nhận từ hệ thống.');
      onSubmitted?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gửi thông báo chuyển tiền thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimer = (seconds: number) => `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;

  return (
    <div className="p-5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-200/70 dark:border-teal-800/60 pb-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-teal-700 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Quét mã VietQR để thanh toán tiền cọc
          </h3>
        </div>
        <div className="flex items-center gap-2" aria-live="polite">
          {currentStatus === 'PAID' ? (
            <Badge variant="success" size="sm">ADMIN ĐÃ DUYỆT (ESCROW BẢO VỆ)</Badge>
          ) : currentStatus === 'SUBMITTED' ? (
            <Badge variant="warning" size="sm">ĐANG CHỜ XÁC NHẬN TỪ HỆ THỐNG</Badge>
          ) : currentStatus === 'CANCELLED' ? (
            <Badge variant="danger" size="sm">GIAO DỊCH ĐÃ BỊ HỦY (KHÔNG HỢP LỆ)</Badge>
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

          {currentStatus !== 'PAID' && (
            <TransferReceiptVerificationBox
              bankTxCode={bankTxCode} setBankTxCode={setBankTxCode}
              receiptHash={receiptHash} setReceiptHash={setReceiptHash}
              receiptImageUrl={receiptImageUrl} setReceiptImageUrl={setReceiptImageUrl}
              disabled={timeLeftSec <= 0 || isVerifying}
            />
          )}

          {currentStatus === 'SUBMITTED' ? (
            <div role="status" aria-live="polite" className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-300 dark:border-amber-800 flex items-start gap-2 text-[11px] text-amber-950 dark:text-amber-200">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>Đang chờ xác nhận từ hệ thống. Thông báo đã được gửi tới Admin để kiểm tra tiền đã về tài khoản {accountHolder} của sàn. Sau khi Admin duyệt, cọc Escrow sẽ kích hoạt; nếu chưa nhận được tiền, giao dịch sẽ bị hủy.</span>
            </div>
          ) : currentStatus === 'CANCELLED' ? (
            <div role="status" aria-live="polite" className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-300 dark:border-red-800 text-[11px] text-red-900 dark:text-red-200">
              Giao dịch không hợp lệ hoặc chưa nhận được tiền vào tài khoản sàn và đã bị Admin hủy. Vui lòng hủy phiên cũ và tạo mã VietQR mới nếu cần.
            </div>
          ) : (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-xl border border-teal-200 dark:border-teal-800 flex items-start gap-2 text-[11px] text-teal-900 dark:text-teal-200">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-teal-600 mt-0.5" />
              <span>Sau khi chuyển tiền và bấm &quot;Tôi đã chuyển tiền&quot;, giao dịch chuyển sang trạng thái Đang chờ xác nhận từ hệ thống và gửi yêu cầu tới Admin kiểm tra tài khoản sàn {accountHolder} trước khi duyệt Escrow.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Hết hạn theo máy chủ sau: <strong className="text-teal-700">{formatTimer(timeLeftSec)}</strong></span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCancel} disabled={currentStatus === 'PAID'}>
                {currentStatus === 'CANCELLED' ? 'Đóng & tạo mã mới' : 'Hủy giao dịch'}
              </Button>
              {currentStatus === 'PAID' ? (
                <Button variant="primary" size="sm" disabled leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Admin đã duyệt vào Escrow
                </Button>
              ) : currentStatus === 'SUBMITTED' ? (
                <Button variant="secondary" size="sm" disabled leftIcon={<Clock className="w-3.5 h-3.5" />}>
                  Đang chờ xác nhận từ hệ thống
                </Button>
              ) : currentStatus !== 'CANCELLED' ? (
                <Button variant="primary" size="sm" isLoading={isVerifying} disabled={timeLeftSec <= 0 || !canConfirmTransfer} leftIcon={canConfirmTransfer ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />} onClick={handleTenantSubmit}>
                  {canConfirmTransfer ? 'Tôi đã chuyển tiền' : 'Tôi đã chuyển (Cần mã GD & biên lai)'}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
