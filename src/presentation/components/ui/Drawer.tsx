'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className,
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute inset-y-0 flex max-w-full',
          position === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          className={cn(
            'w-screen max-w-md bg-white dark:bg-stone-900 shadow-2xl border-stone-200 dark:border-stone-800 flex flex-col',
            position === 'right' ? 'border-l' : 'border-r',
            className
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800">
            {title && (
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

