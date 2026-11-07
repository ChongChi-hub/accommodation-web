'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { cn } from '@/lib/cn';

export interface ChartCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  description?: string;
  dataPoints?: number[];
  className?: string;
}

export function ChartCard({
  title,
  value,
  change,
  isPositive = true,
  description,
  dataPoints = [30, 45, 35, 60, 50, 75, 90],
  className,
}: ChartCardProps) {
  const max = Math.max(...dataPoints, 1);

  return (
    <Card className={cn('p-5 flex flex-col justify-between', className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">{title}</p>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-foreground-muted mt-1">{description}</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-end gap-1.5 h-12">
        {dataPoints.map((val, idx) => {
          const heightPercent = Math.max(10, Math.round((val / max) * 100));
          return (
            <div
              key={idx}
              className="flex-1 bg-surface-muted rounded overflow-hidden flex items-end h-full group relative"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full bg-teal-700/70 group-hover:bg-teal-700 transition-all rounded"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
