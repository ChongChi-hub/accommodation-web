'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Đã xảy ra sự cố',
  message = 'Không thể tải thông tin. Vui lòng kiểm tra lại kết nối mạng.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">{title}</h4>
      <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-4 border-rose-300 text-rose-800 dark:border-rose-800 dark:text-rose-200 hover:bg-rose-100/50"
        >
          Thử lại
        </Button>
      )}
    </div>
  );
}

