'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Badge } from '@/presentation/components/ui/Badge';
import { UserBankAccount } from '@/domain/entities/BankAccount';
import { formatVnd } from '@/shared/utils/format-vnd';
import { Landmark, QrCode, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bankAccount: UserBankAccount | null;
  availableBalance: number;
  minAmount: number;
  busy: boolean;
  onConfirmSubmit: (payload: {
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  }) => Promise<void>;
}

export function LandlordPayoutModal({
  isOpen, onClose, bankAccount, availableBalance, minAmount, busy, onConfirmSubmit,
}: Props) {
  const [amount, setAmount] = useState(String(Math.max(minAmount, availableBalance || minAmount)));
  const [confirmedInfo, setConfirmedInfo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(String(availableBalance >= minAmount ? availableBalance : minAmount));
      setConfirmedInfo(false);
    }
  }, [isOpen, availableBalance, minAmount]);

  const numericAmount = Number(amount) || 0;
  const canSubmit = Boolean(
    bankAccount &&
    bankAccount.accountNumber &&
    bankAccount.qrCodeUrl &&
    confirmedInfo &&
    numericAmount >= minAmount &&
    numericAmount <= availableBalance
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccount || !canSubmit) return;
    await onConfirmSubmit({
      amount: numericAmount,
      bankCode: bankAccount.bankCode,
      accountNumber: bankAccount.accountNumber,
      accountHolder: bankAccount.accountHolder,
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Tạo lệnh rút tiền về Tài khoản cá nhân" size="md">
      {!bankAccount || !bankAccount.accountNumber || !bankAccount.qrCodeUrl ? (
        <div className="p-4 text-xs text-red-600">
          Bạn chưa cung cấp đầy đủ Số tài khoản ngân hàng và Mã QR cá nhân. Vui lòng cập nhật tại mục Tài khoản ngân hàng &amp; QR trước khi rút tiền.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <div>
              <p className="text-stone-500">Số dư ví khả dụng có thể rút</p>
              <p className="text-lg font-black text-teal-700 dark:text-teal-400">{formatVnd(availableBalance)}</p>
            </div>
            {availableBalance >= minAmount && (
              <Button type="button" variant="outline" size="sm" onClick={() => setAmount(String(availableBalance))}>
                Rút toàn bộ
              </Button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-7 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Thông tin tài khoản nhận tiền đã cung cấp
              </div>
              <div className="space-y-1 text-stone-700 dark:text-stone-300">
                <p>Ngân hàng: <strong>{bankAccount.bankName || bankAccount.bankCode} ({bankAccount.bankCode})</strong></p>
                <p>Số tài khoản: <strong className="font-mono text-sm">{bankAccount.accountNumber}</strong></p>
                <p>Chủ tài khoản: <strong className="uppercase">{bankAccount.accountHolder}</strong></p>
              </div>
              <Badge variant="success" size="sm">Tài khoản đã xác minh</Badge>
            </div>
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-2 bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 flex items-center gap-1 mb-1">
                <QrCode className="w-3 h-3 text-teal-600" /> Mã QR cá nhân của bạn
              </span>
              <img
                src={bankAccount.qrCodeUrl}
                alt="QR cá nhân chủ trọ"
                className="w-36 h-36 object-contain rounded-lg"
              />
            </div>
          </div>

          <Input
            label={`Số tiền muốn rút (tối thiểu ${formatVnd(minAmount)})`}
            type="number"
            min={minAmount}
            max={availableBalance || undefined}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer bg-white dark:bg-stone-900">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
              checked={confirmedInfo}
              onChange={(e) => setConfirmedInfo(e.target.checked)}
            />
            <span className="text-stone-700 dark:text-stone-300">
              Tôi xác nhận thông tin số tài khoản ngân hàng và mã QR hiển thị ở trên là hoàn toàn chính xác. Hệ thống sẽ gửi yêu cầu giải ngân tới Admin và tạm giữ số tiền tương ứng.
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Hủy</Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={busy}
              disabled={!canSubmit}
              leftIcon={<Landmark className="w-3.5 h-3.5" />}
            >
              Xác nhận thông tin chính xác &amp; Gửi lệnh rút tiền
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
