'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export function Tabs({
  items,
  activeId,
  onChange,
  className,
  variant = 'pills',
}: TabsProps) {
  if (variant === 'underline') {
    return (
      <div className={cn('border-b border-border flex gap-6 overflow-x-auto', className)}>
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 pb-3 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap',
                isActive
                  ? 'text-teal-700 dark:text-teal-400 font-semibold'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-foreground-muted border border-border">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700 dark:bg-teal-400 rounded-t" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex p-1 bg-surface-muted border border-border rounded-xl gap-1 overflow-x-auto max-w-full',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap',
              isActive
                ? 'bg-surface text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface text-foreground-muted border border-border">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
