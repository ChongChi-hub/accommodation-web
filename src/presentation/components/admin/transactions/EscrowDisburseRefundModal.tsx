'use client';

import React from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { UserBankAccount } from '@/domain/entities/BankAccount';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { formatVnd } from '@/shared/utils/format-vnd';
import { DollarSign, QrCode, RefreshCcw, X } from 'lucide-react';

interface Props {
  hold: EscrowHold;
  mode: 'DISBURSE' | 'REFUND';
  bankInfo: UserBankAccount | null;
  loadingBank: boolean;
  busy: boolean;
  txRef: string;
  setTxRef: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
  onClose: () => void;
  onConfirmDisburse: () => void;
  onConfirmRefund: () => void;
}

export function EscrowDisburseRefundModal({
  hold,
  mode,
  bankInfo,
  loadingBank,
  busy,
  txRef,
  setTxRef,
  reason,
  setReason,
  onClose,
  onConfirmDisburse,
  onConfirmRefund,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            {mode === 'DISBURSE' ? <DollarSign className="w-4 h-4 text-emerald-600" /> : <RefreshCcw className="w-4 h-4 text-rose-600" />}
            {mode === 'DISBURSE' ? 'Giải ngân tiền cọc cho Chủ trọ' : 'Hoàn tiền cọc cho Khách thuê'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-stone-500">Hợp đồng:</span>
            <span className="font-mono font-semibold">{hold.contractId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Số tiền cọc giải ngân:</span>
            <span className="font-black text-teal-700 dark:text-teal-400 text-sm">{formatVnd(hold.amount)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 space-y-3">
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-teal-600" />
            Thông tin tài khoản nhận tiền &amp; Mã QR VietQR:
          </p>

          {loadingBank ? (
            <p className="text-xs text-stone-400">Đang tải thông tin tài khoản ngân hàng...</p>
          ) : bankInfo ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {bankInfo.qrCodeUrl && (
                <img src={bankInfo.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain bg-white rounded-lg p-1 border border-stone-200" />
              )}
              <div className="text-xs space-y-1 flex-1">
                <p><span className="text-stone-500">Ngân hàng:</span> <strong className="text-stone-900 dark:text-stone-100">{bankInfo.bankName} ({bankInfo.bankCode})</strong></p>
                <p><span className="text-stone-500">Số tài khoản:</span> <strong className="font-mono text-teal-700 dark:text-teal-400">{bankInfo.accountNumber}</strong></p>
                <p><span className="text-stone-500">Chủ tài khoản:</span> <strong>{bankInfo.accountHolder}</strong></p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
              Người dùng chưa cung cấp tài khoản ngân hàng và mã QR trong mục Hồ sơ.
            </div>
          )}
        </div>

        {mode === 'DISBURSE' ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Mã giao dịch ngân hàng chuyển tiền (FT...)
            </label>
            <Input
              type="text"
              placeholder="VD: FT2611197778"
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">Lý do hoàn cọc</label>
            <Input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
          <Button variant="ghost" size="sm" onClick={onClose}>Đóng</Button>
          {mode === 'DISBURSE' ? (
            <Button variant="primary" size="sm" isLoading={busy} onClick={onConfirmDisburse}>
              Xác nhận đã giải ngân tiền cọc
            </Button>
          ) : (
            <Button variant="primary" size="sm" isLoading={busy} onClick={onConfirmRefund}>
              Xác nhận đã hoàn tiền cọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

