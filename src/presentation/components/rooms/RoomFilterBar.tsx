'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RotateCcw, Search, DollarSign, ChevronDown } from 'lucide-react';
import { Combobox, ComboboxOption } from '@/presentation/components/ui/Combobox';
import { DualPriceSlider } from '@/presentation/components/rooms/DualPriceSlider';
import { CategoryQuickChips } from '@/presentation/components/rooms/CategoryQuickChips';
import { AdvancedFilterPopover } from '@/presentation/components/rooms/AdvancedFilterPopover';
import { RoomFilterParams, ProvinceDto, WardDto } from '@/application/dto/listing.dto';
import { getProvinceAliases } from '@/presentation/utils/search-normalization';
import { cn } from '@/lib/cn';

export interface RoomFilterBarProps {
  params: RoomFilterParams;
  onChange: (newParams: Partial<RoomFilterParams>) => void;
  onReset: () => void;
  provinces: ProvinceDto[];
  wards?: WardDto[];
  categoryKey?: string;
  hideRoomTypeFilter?: boolean;
}

const POPULAR_PROVINCE_CODES = new Set(['HN', 'HCM', 'DN', 'BD', 'VT', 'CT']);

function formatPriceShort(val?: number): string {
  if (!val) return '';
  if (val >= 1000000) return `${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)} tr`;
  return `${val / 1000}k`;
}

export function RoomFilterBar({
  params,
  onChange,
  onReset,
  provinces,
  wards = [],
  categoryKey,
}: RoomFilterBarProps) {
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const pricePopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pricePopoverRef.current && !pricePopoverRef.current.contains(e.target as Node)) {
        setIsPriceOpen(false);
      }
    };
    if (isPriceOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPriceOpen]);

  const provinceOptions: ComboboxOption[] = useMemo(() => {
    return provinces.map((p) => ({
      value: p.code,
      label: p.name,
      aliases: getProvinceAliases(p.code),
      group: POPULAR_PROVINCE_CODES.has(p.code) ? 'Phổ biến' : 'Tất cả (A-Z)',
    }));
  }, [provinces]);

  const wardOptions: ComboboxOption[] = useMemo(() => {
    return wards.map((w) => ({
      value: w.code,
      label: w.name,
      group: 'Phường / Xã',
    }));
  }, [wards]);

  const priceLabel = useMemo(() => {
    if (params.minPrice && params.maxPrice) {
      return `${formatPriceShort(params.minPrice)} - ${formatPriceShort(params.maxPrice)}`;
    }
    if (params.minPrice) return `Từ ${formatPriceShort(params.minPrice)}`;
    if (params.maxPrice) return `Dưới ${formatPriceShort(params.maxPrice)}`;
    return 'Mức giá';
  }, [params.minPrice, params.maxPrice]);

  const hasActiveFilters = Boolean(
    params.q ||
    params.provinceCode ||
    params.wardCode ||
    params.minPrice ||
    params.maxPrice ||
    params.allowPets ||
    params.allowCooking ||
    params.furnishing ||
    params.genderPreference ||
    params.bedrooms
  );

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3.5">
      {/* Primary search bar + Location + Price + Advanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Keyword Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={params.q || ''}
            onChange={(e) => onChange({ q: e.target.value || undefined })}
            placeholder="Tìm theo đường, trường học, tòa nhà..."
            aria-label="Tìm kiếm theo từ khóa"
            className="w-full h-10.5 pl-10 pr-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
          />
        </div>

        {/* Province Combobox */}
        <div className="lg:col-span-3">
          <Combobox
            value={params.provinceCode}
            onChange={(val) => onChange({ provinceCode: val, wardCode: undefined, districtCode: undefined })}
            options={provinceOptions}
            placeholder="Tất cả Tỉnh/Thành"
            searchPlaceholder="Tìm tỉnh (Hà Nội, TP.HCM, Huế...)"
            ariaLabel="Chọn Tỉnh hoặc Thành phố"
          />
        </div>

        {/* Ward Combobox */}
        <div className="lg:col-span-3">
          <Combobox
            value={params.wardCode}
            onChange={(val) => onChange({ wardCode: val })}
            options={wardOptions}
            placeholder={params.provinceCode ? 'Tất cả Phường/Xã' : 'Chọn Tỉnh trước'}
            searchPlaceholder="Tìm phường, xã..."
            disabled={!params.provinceCode}
            ariaLabel="Chọn Phường hoặc Xã"
          />
        </div>

        {/* Price Popover Trigger */}
        <div ref={pricePopoverRef} className="lg:col-span-2 relative">
          <button
            type="button"
            onClick={() => setIsPriceOpen((prev) => !prev)}
            aria-label={`Mức giá: ${priceLabel}`}
            className={cn(
              'w-full h-10.5 px-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer',
              params.minPrice || params.maxPrice
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <DollarSign className="w-4 h-4 text-stone-400 shrink-0" />
              <span className="truncate">{priceLabel}</span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-stone-400 transition-transform duration-200', isPriceOpen && 'rotate-180')} />
          </button>

          {isPriceOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl p-4">
              <DualPriceSlider
                minPrice={params.minPrice}
                maxPrice={params.maxPrice}
                onChange={(min, max) => onChange({ minPrice: min, maxPrice: max })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Category-specific Quick Chips & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
        <CategoryQuickChips categoryKey={categoryKey} params={params} onChange={onChange} className="flex-1" />

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <AdvancedFilterPopover params={params} onChange={onChange} />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="h-10 px-3 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
