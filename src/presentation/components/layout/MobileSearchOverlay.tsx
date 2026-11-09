'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { HeaderSearchCombobox } from './HeaderSearchCombobox';

export interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tSearch('mobileTitle')}
      className="fixed inset-0 z-50 bg-background text-foreground flex flex-col"
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-border bg-surface">
        <span className="text-sm font-bold text-foreground">{tSearch('mobileTitle')}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          aria-label={tCommon('close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <HeaderSearchCombobox autoFocus wideDesktop={false} onAfterNavigate={onClose} />
      </div>
    </div>
  );
}
