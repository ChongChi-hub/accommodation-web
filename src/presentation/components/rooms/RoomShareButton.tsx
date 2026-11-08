'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

export function RoomShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="text-xs text-stone-700 dark:text-stone-300 whitespace-nowrap shrink-0"
      aria-label="Chia sẻ liên kết phòng trọ"
      leftIcon={
        copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )
      }
    >
      {copied ? <span className="text-emerald-600 font-semibold">Đã sao chép!</span> : 'Chia sẻ'}
    </Button>
  );
}
