'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useUserPresence, formatPresenceText, UserPresence } from '@/presentation/hooks/useUserPresence';

export interface UserPresenceBadgeProps {
  userId?: string | null;
  initialPresence?: UserPresence | null;
  variant?: 'default' | 'compact' | 'light' | 'dot';
  className?: string;
}

export const UserPresenceBadge: React.FC<UserPresenceBadgeProps> = ({
  userId,
  initialPresence,
  variant = 'default',
  className,
}) => {
  const { presence } = useUserPresence(userId);
  const currentPresence = presence || initialPresence;
  const status = formatPresenceText(currentPresence);

  if (variant === 'dot') {
    return (
      <span
        title={status.text}
        className={cn(
          'w-2.5 h-2.5 rounded-full border-2 border-white dark:border-stone-900 shrink-0',
          status.isOnline ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600',
          className
        )}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          'text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-colors',
          status.isOnline
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
            : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
          className
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            status.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
          )}
        />
        {status.text}
      </span>
    );
  }

  if (variant === 'light') {
    return (
      <span
        className={cn(
          'text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-colors',
          status.isOnline
            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
            : 'bg-white/10 text-stone-200 border border-white/20',
          className
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            status.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-stone-300'
          )}
        />
        {status.text}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-colors',
        status.isOnline
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
          : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
        )}
      />
      {status.text}
    </span>
  );
};
