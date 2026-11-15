'use client';

import React from 'react';
import { DeadLetterMessage } from '@/domain/entities/DeadLetterMessage';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { RotateCcw, Trash2, Copy, Check } from 'lucide-react';

interface DlqPayloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: DeadLetterMessage | null;
  onReplay?: (id: string) => void;
  onDiscard?: (id: string) => void;
  isReplaying?: boolean;
  isDiscarding?: boolean;
}

export function DlqPayloadDialog({
  isOpen,
  onClose,
  message,
  onReplay,
  onDiscard,
  isReplaying,
  isDiscarding,
}: DlqPayloadDialogProps) {
  const [copied, setCopied] = React.useState(false);

  if (!message) return null;

  let formattedPayload = message.payloadJson || '{}';
  try {
    formattedPayload = JSON.stringify(JSON.parse(message.payloadJson), null, 2);
  } catch {
    // Keep raw string if parse fails
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết sự kiện DLQ: ${message.eventType}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-surface-muted border border-border">
          <div>
            <span className="text-foreground-muted block text-[11px]">Dịch vụ nguồn</span>
            <span className="font-semibold text-foreground">{message.sourceService}</span>
          </div>
          <div>
            <span className="text-foreground-muted block text-[11px]">Thực thể</span>
            <span className="font-semibold text-foreground">
              {message.aggregateType} #{message.aggregateId}
            </span>
          </div>
          <div>
            <span className="text-foreground-muted block text-[11px]">Trạng thái</span>
            <Badge
              variant={
                message.status === 'PENDING_REPLAY'
                  ? 'warning'
                  : message.status === 'REPLAYED'
                    ? 'success'
                    : 'neutral'
              }
              size="sm"
            >
              {message.status}
            </Badge>
          </div>
          <div>
            <span className="text-foreground-muted block text-[11px]">Số lần thử lại</span>
            <span className="font-mono text-foreground">{message.retryCount} lần</span>
          </div>
          <div>
            <span className="text-foreground-muted block text-[11px]">Phiên bản schema</span>
            <span className="font-mono text-foreground">v{message.schemaVersion}</span>
          </div>
          <div>
            <span className="text-foreground-muted block text-[11px]">Thời điểm tạo</span>
            <span className="font-mono text-foreground">
              {new Date(message.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        <div>
          <span className="text-foreground-muted block mb-1 font-medium text-[11px]">
            Lý do lỗi (Failure Reason):
          </span>
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-mono text-[11px] break-all">
            {message.failureReason}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-foreground-muted font-medium text-[11px]">
              Dữ liệu Payload (Đã che PII):
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-foreground-muted hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-surface-muted border border-border font-mono text-[11px] text-foreground overflow-x-auto max-h-64 leading-relaxed">
            {formattedPayload}
          </pre>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          {message.status === 'PENDING_REPLAY' && onDiscard && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDiscard(message.id)}
              disabled={isDiscarding}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span>Loại bỏ</span>
            </Button>
          )}
          {message.status === 'PENDING_REPLAY' && onReplay && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onReplay(message.id)}
              disabled={isReplaying}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Phát lại sự kiện (Replay)</span>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
