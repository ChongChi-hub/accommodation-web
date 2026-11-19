'use client';

import React from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { PayoutItem } from '@/domain/entities/Billing';
import { formatVnd } from '@/shared/utils/format-vnd';

interface AdminPayoutQrModalProps {
  payout: PayoutItem | null;
  onClose: () => void;
}

export function AdminPayoutQrModal({ payout, onClose }: AdminPayoutQrModalProps) {
  if (!payout || !payout.systemVietQrUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`QR VietQR ${payout.payoutCode}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-sm w-full p-5 space-y-3 text-center border border-stone-200 dark:border-stone-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          QR VietQR Hệ Thống Sinh ({payout.payoutCode})
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {payout.bankCode} | {payout.accountNumber} | {payout.accountHolder}
        </p>
        <img
          src={payout.systemVietQrUrl}
          alt={`VietQR ${payout.payoutCode}`}
          className="w-60 h-60 mx-auto rounded-xl border border-stone-200 dark:border-stone-700 object-contain bg-white"
        />
        <p className="text-sm font-black text-teal-700 dark:text-teal-400">
          {formatVnd(payout.amount)}
        </p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          QR được hệ thống tự sinh từ tài khoản đã xác minh của chủ trọ (không dùng ảnh QR tự tải lên).
        </p>
        <Button variant="primary" size="sm" className="w-full" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
