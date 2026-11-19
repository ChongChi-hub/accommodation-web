'use client';

import React from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { AdminPendingApprovalItem } from '@/domain/entities/WalletVerification';
import { formatVnd } from '@/shared/utils/format-vnd';

interface AdminProofPreviewModalProps {
  item: AdminPendingApprovalItem | null;
  onClose: () => void;
}

export function AdminProofPreviewModal({ item, onClose }: AdminProofPreviewModalProps) {
  if (!item) return null;
  const imgUrl = `/api/v1/billing/payments/proofs/${encodeURIComponent(item.paymentCode)}/image`;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Biên lai ${item.paymentCode}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 space-y-3 border border-stone-200 dark:border-stone-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
          Biên lai hỗ trợ giao dịch ({item.paymentCode})
        </h3>
        <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 bg-stone-50 dark:bg-stone-800/70 p-3 rounded-xl">
          <p><strong>Khách thuê:</strong> {item.tenantName}</p>
          <p><strong>Hợp đồng:</strong> <span className="font-mono">{item.orderId}</span></p>
          <p><strong>Số tiền:</strong> <span className="font-bold text-teal-700 dark:text-teal-400">{formatVnd(item.amount)}</span></p>
          <p><strong>Mã GD khách nhập:</strong> <span className="font-mono">{item.submittedBankTxCode || '--'}</span></p>
        </div>
        <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-950 flex justify-center">
          <img src={imgUrl} alt={`Biên lai ${item.paymentCode}`} className="max-h-96 object-contain" />
        </div>
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          Lưu ý: Ảnh biên lai chỉ dùng để đối chiếu. Admin chỉ bấm Duyệt sau khi đã thấy tiền thật vào đủ tài khoản sàn LE THANH CUONG.
        </p>
        <Button variant="primary" size="sm" className="w-full" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}

