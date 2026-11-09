'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export interface DualPriceSliderProps {
  minPrice?: number;
  maxPrice?: number;
  onChange: (min: number | undefined, max: number | undefined) => void;
  minLimit?: number;
  maxLimit?: number;
  step?: number;
  className?: string;
}

function formatVnd(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return '';
  return new Intl.NumberFormat('vi-VN').format(val);
}

function parseVnd(str: string): number | undefined {
  const digits = str.replace(/\D/g, '');
  if (!digits) return undefined;
  return Number(digits);
}

export function DualPriceSlider({
  minPrice,
  maxPrice,
  onChange,
  minLimit = 0,
  maxLimit = 30000000,
  step = 500000,
  className,
}: DualPriceSliderProps) {
  const [localMin, setLocalMin] = useState<number>(minPrice ?? minLimit);
  const [localMax, setLocalMax] = useState<number>(maxPrice ?? maxLimit);
  const [inputMin, setInputMin] = useState<string>(formatVnd(minPrice));
  const [inputMax, setInputMax] = useState<string>(formatVnd(maxPrice));

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalMin(minPrice ?? minLimit);
    setInputMin(formatVnd(minPrice));
  }, [minPrice, minLimit]);

  useEffect(() => {
    setLocalMax(maxPrice ?? maxLimit);
    setInputMax(formatVnd(maxPrice));
  }, [maxPrice, maxLimit]);

  const triggerChange = (newMin: number, newMax: number) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const finalMin = newMin <= minLimit ? undefined : newMin;
      const finalMax = newMax >= maxLimit ? undefined : newMax;
      onChange(finalMin, finalMax);
    }, 300);
  };

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(val);
    setInputMin(formatVnd(val));
    triggerChange(val, localMax);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(val);
    setInputMax(formatVnd(val));
    triggerChange(localMin, val);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputMin(raw);
    const parsed = parseVnd(raw);
    if (parsed !== undefined) {
      const clamped = Math.max(minLimit, Math.min(parsed, localMax - step));
      setLocalMin(clamped);
      triggerChange(clamped, localMax);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputMax(raw);
    const parsed = parseVnd(raw);
    if (parsed !== undefined) {
      const clamped = Math.min(maxLimit, Math.max(parsed, localMin + step));
      setLocalMax(clamped);
      triggerChange(localMin, clamped);
    }
  };

  const applyPreset = (presetMin?: number, presetMax?: number) => {
    const fMin = presetMin ?? minLimit;
    const fMax = presetMax ?? maxLimit;
    setLocalMin(fMin);
    setLocalMax(fMax);
    setInputMin(formatVnd(presetMin));
    setInputMax(formatVnd(presetMax));
    onChange(presetMin, presetMax);
  };

  const minPercent = ((localMin - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((localMax - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
        <span>Khoảng giá (VNĐ)</span>
        <button
          type="button"
          onClick={() => applyPreset(undefined, undefined)}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-[11px]"
        >
          Mặc định
        </button>
      </div>

      {/* Two manual formatted inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMin}
            onChange={handleMinInputChange}
            placeholder="0"
            aria-label="Giá tối thiểu"
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-900 dark:text-stone-100 outline-none focus:border-teal-500"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 pointer-events-none">đ</span>
        </div>
        <span className="text-stone-400 text-xs">-</span>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMax}
            onChange={handleMaxInputChange}
            placeholder="Tối đa"
            aria-label="Giá tối đa"
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-900 dark:text-stone-100 outline-none focus:border-teal-500"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 pointer-events-none">đ</span>
        </div>
      </div>

      {/* Dual slider bar */}
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700" />
        <div
          className="absolute h-1.5 rounded-full bg-teal-600 dark:bg-teal-500"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={localMin}
          onChange={handleMinSlider}
          aria-label="Kéo chọn giá tối thiểu"
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-teal-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none cursor-pointer"
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={localMax}
          onChange={handleMaxSlider}
          aria-label="Kéo chọn giá tối đa"
          className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-teal-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none cursor-pointer"
        />
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {[
          { label: '< 3 triệu', min: undefined, max: 3000000 },
          { label: '3 - 5 tr', min: 3000000, max: 5000000 },
          { label: '5 - 8 tr', min: 5000000, max: 8000000 },
          { label: '8 - 15 tr', min: 8000000, max: 15000000 },
          { label: '> 15 triệu', min: 15000000, max: undefined },
        ].map((p) => {
          const isActive = minPrice === p.min && maxPrice === p.max;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.min, p.max)}
              className={cn(
                'text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer',
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

