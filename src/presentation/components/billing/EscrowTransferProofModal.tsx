'use client';

import React, { useState } from 'react';
import { EscrowHold } from '@/domain/entities/Billing';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { formatVnd } from '@/shared/utils/format-vnd';
import { toast } from '@/presentation/stores/toast.store';
import { AlertTriangle, Check, Copy, FileCheck2, KeyRound, ShieldCheck, X, XCircle } from 'lucide-react';

interface Props {
  hold: EscrowHold;
  onClose: () => void;
  viewerRole: 'LANDLORD' | 'TENANT' | 'ADMIN';
  busy?: boolean;
  onConfirmMoveIn?: (contractId: string) => void;
  onRejectProof?: (contractId: string, reason: string) => Promise<void>;
}

export function EscrowTransferProofModal({
  hold,
  onClose,
  viewerRole,
  busy = false,
  onConfirmMoveIn,
  onRejectProof,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const copyTxCode = async () => {
    if (!hold.bankTxCode) return;
    try {
      await navigator.clipboard.writeText(hold.bankTxCode);
      setCopied(true);
      toast.success('Đã sao chép Mã giao dịch ngân hàng');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép tự động');
    }
  };

  const handleReject = async () => {
    if (!onRejectProof) return;
    setRejecting(true);
    try {
      await onRejectProof(hold.contractId, 'Chủ trọ kiểm tra biên lai hoặc mã giao dịch ngân hàng không khớp thực tế');
      onClose();
    } finally {
      setRejecting(false);
    }
  };

  const isVisualImage = Boolean(
    hold.receiptUrl && (hold.receiptUrl.startsWith('data:image/') || hold.receiptUrl.startsWith('http'))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Chi tiết Mã Giao Dịch &amp; Ảnh Biên Lai Chuyển Khoản Cọc
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Mã hợp đồng:</span>
            <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{hold.contractId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Số tiền cọc ký quỹ:</span>
            <span className="font-black text-sm text-teal-700 dark:text-teal-400">{formatVnd(hold.amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Mã giao dịch ngân hàng (FT / UNC):</span>
            <div className="flex items-center gap-1.5">
              <Badge variant="success" size="sm">
                <span className="font-mono font-bold">{hold.bankTxCode || 'Chưa cập nhật'}</span>
              </Badge>
              {hold.bankTxCode && (
                <button
                  type="button"
                  onClick={copyTxCode}
                  className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-teal-700"
                  title="Sao chép mã giao dịch"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
          {hold.paymentCode && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Nội dung VietQR Sàn:</span>
              <span className="font-mono font-semibold text-amber-800 dark:text-amber-300">{hold.paymentCode}</span>
            </div>
          )}
          {hold.receiptHash && (
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Mã vân tay chống trùng ảnh (SHA-256):</span>
              <span className="font-mono text-[11px] text-stone-600 dark:text-stone-400">{hold.receiptHash}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between">
            <span>Hình ảnh biên lai chuyển khoản người thuê đã tải lên:</span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã kiểm tra chống trùng lặp
            </span>
          </p>
          {isVisualImage ? (
            <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-950 p-3 flex flex-col items-center justify-center">
              <img
                src={hold.receiptUrl!}
                alt={`Biên lai chuyển khoản ${hold.bankTxCode || hold.contractId}`}
                className="max-h-[420px] w-auto object-contain rounded-lg shadow-sm border border-stone-200 dark:border-stone-800"
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Khoản cọc này chưa có hình ảnh biên lai đính kèm ({hold.receiptUrl || 'Trống'}).</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <div>
            {(viewerRole === 'LANDLORD' || viewerRole === 'ADMIN') &&
              hold.status === 'HELD' &&
              onRejectProof &&
              !hold.landlordConfirmedMoveIn && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={rejecting}
                  leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                  onClick={handleReject}
                >
                  Từ chối biên lai sai (Hủy cọc giả)
                </Button>
              )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Đóng
            </Button>
            {viewerRole === 'LANDLORD' && hold.status === 'HELD' && !hold.landlordConfirmedMoveIn && onConfirmMoveIn && (
              <Button
                variant="primary"
                size="sm"
                isLoading={busy}
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                onClick={() => {
                  onConfirmMoveIn(hold.contractId);
                  onClose();
                }}
              >
                Biên lai hợp lệ &amp; Bàn giao phòng
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
