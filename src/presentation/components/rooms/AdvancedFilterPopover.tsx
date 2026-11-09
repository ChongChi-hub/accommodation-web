'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { RoomFilterParams } from '@/application/dto/listing.dto';
import { Button } from '@/presentation/components/ui/Button';
import { cn } from '@/lib/cn';

interface AdvancedFilterPopoverProps {
  params: RoomFilterParams;
  onChange: (patch: Partial<RoomFilterParams>) => void;
  className?: string;
}

export function AdvancedFilterPopover({
  params,
  onChange,
  className,
}: AdvancedFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Count how many non-standard filters are active
  const activeCount = [
    params.allowPets,
    params.allowCooking,
    params.furnishing,
    params.genderPreference,
    params.bedrooms,
    params.minAvailableSpots,
  ].filter(Boolean).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={popoverRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'h-10 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-xs',
          activeCount > 0
            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Bộ lọc khác</span>
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Bộ lọc nâng cao</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preferences Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Tiện ích sinh hoạt
            </label>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.allowPets || false}
                  onChange={(e) => onChange({ allowPets: e.target.checked || undefined })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Cho phép nuôi thú cưng</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.allowCooking || false}
                  onChange={(e) => onChange({ allowCooking: e.target.checked || undefined })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Cho phép tự do nấu ăn</span>
              </label>
            </div>
          </div>

          {/* Furnishing */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Nội thất
            </label>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: 'Tất cả', val: undefined },
                { label: 'Đầy đủ', val: 'FULL' },
                { label: 'Cơ bản', val: 'BASIC' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onChange({ furnishing: opt.val })}
                  className={cn(
                    'text-xs py-1.5 px-2 rounded-lg border text-center font-medium transition-colors cursor-pointer',
                    params.furnishing === opt.val
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender for Shared */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Ưu tiên giới tính
            </label>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: 'Tất cả', val: undefined },
                { label: 'Nam', val: 'MALE' },
                { label: 'Nữ', val: 'FEMALE' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onChange({ genderPreference: opt.val })}
                  className={cn(
                    'text-xs py-1.5 px-2 rounded-lg border text-center font-medium transition-colors cursor-pointer',
                    params.genderPreference === opt.val
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                onChange({
                  allowPets: undefined,
                  allowCooking: undefined,
                  furnishing: undefined,
                  genderPreference: undefined,
                  bedrooms: undefined,
                  minAvailableSpots: undefined,
                })
              }
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Đặt lại
            </button>
            <Button size="sm" variant="primary" onClick={() => setIsOpen(false)}>
              Xem kết quả
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
