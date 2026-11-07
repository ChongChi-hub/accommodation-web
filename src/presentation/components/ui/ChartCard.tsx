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
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded',
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {change}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">{description}</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-end gap-1.5 h-12">
        {dataPoints.map((val, idx) => {
          const heightPercent = Math.round((val / max) * 100);
          return (
            <div
              key={idx}
              className="flex-1 bg-stone-100 dark:bg-stone-800 rounded-xs overflow-hidden flex items-end h-full group relative"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full bg-teal-600/70 group-hover:bg-teal-600 transition-all rounded-xs"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
