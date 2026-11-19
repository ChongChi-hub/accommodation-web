'use client';

import React from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { PayoutItem } from '@/domain/entities/Billing';
import { formatVnd } from '@/shared/utils/format-vnd';

interface Props {
  payout: PayoutItem | null;
  onClose: () => void;
}

export function PayoutReceiptPreviewModal({ payout, onClose }: Props) {
  if (!payout) return null;
  const imgSrc = payout.proofUrl || `/api/v1/billing/payouts/${encodeURIComponent(payout.id)}/proof-image`;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Biên lai giải ngân ${payout.payoutCode}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 space-y-3 border border-stone-200 dark:border-stone-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Biên lai Admin giải ngân ({payout.payoutCode})
        </h3>
        <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 bg-stone-50 dark:bg-stone-800/70 p-3 rounded-xl">
          <p><strong>Số tiền giải ngân:</strong> <span className="font-bold text-teal-700 dark:text-teal-400">{formatVnd(payout.amount)}</span></p>
          <p><strong>Ngân hàng nhận:</strong> {payout.bankCode} - <span className="font-mono">{payout.accountNumber}</span> ({payout.accountHolder})</p>
          <p><strong>Mã GD ngân hàng:</strong> <span className="font-mono font-bold">{payout.bankTxCode || '--'}</span></p>
        </div>
        <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-950 flex justify-center">
          <img src={imgSrc} alt={`Biên lai ${payout.payoutCode}`} className="max-h-96 object-contain" />
        </div>
        <Button variant="primary" size="sm" className="w-full" onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
}

