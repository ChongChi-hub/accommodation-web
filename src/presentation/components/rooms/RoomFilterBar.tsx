'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw, Search } from 'lucide-react';
import { Select } from '@/presentation/components/ui/Select';
import { Button } from '@/presentation/components/ui/Button';
import { RoomFilterParams, ProvinceDto, WardDto } from '@/application/dto/listing.dto';

export interface RoomFilterBarProps {
  params: RoomFilterParams;
  onChange: (newParams: Partial<RoomFilterParams>) => void;
  onReset: () => void;
  provinces: ProvinceDto[];
  wards?: WardDto[];
  hideRoomTypeFilter?: boolean;
}

export function RoomFilterBar({
  params,
  onChange,
  onReset,
  provinces,
  wards = [],
  hideRoomTypeFilter = false,
}: RoomFilterBarProps) {
  const tTypes = useTranslations('roomTypes');
  const tSearch = useTranslations('search');
  const tCat = useTranslations('categoryPages');

  const provinceOptions = [
    { value: '', label: 'Tất cả Tỉnh / Thành phố' },
    ...provinces.map((p) => ({ value: p.code, label: p.name })),
  ];

  const wardOptions = [
    { value: '', label: 'Tất cả Phường / Xã' },
    ...wards.map((w) => ({ value: w.code, label: w.name })),
  ];

  const roomTypeOptions = [
    { value: '', label: 'Mọi loại phòng' },
    { value: 'SINGLE', label: tTypes('SINGLE') },
    { value: 'FULL_HOUSE', label: tTypes('FULL_HOUSE') },
    { value: 'MINI_APARTMENT', label: tTypes('MINI_APARTMENT') },
    { value: 'STUDIO', label: tTypes('STUDIO') },
    { value: 'APARTMENT', label: tTypes('APARTMENT') },
    { value: 'SHARED', label: tTypes('SHARED') },
    { value: 'HOMESTAY', label: tTypes('HOMESTAY') },
  ];

  const priceOptions = [
    { value: '', label: 'Mức giá bất kỳ' },
    { value: '0-3000000', label: 'Dưới 3 triệu' },
    { value: '3000000-5000000', label: '3 - 5 triệu' },
    { value: '5000000-8000000', label: '5 - 8 triệu' },
    { value: '8000000-15000000', label: 'Trên 8 triệu' },
  ];

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onChange({ minPrice: undefined, maxPrice: undefined });
      return;
    }
    const [min, max] = val.split('-').map(Number);
    onChange({ minPrice: min, maxPrice: max });
  };

  const currentPriceValue =
    params.minPrice !== undefined && params.maxPrice !== undefined
      ? `${params.minPrice}-${params.maxPrice}`
      : '';

  return (
    <div className="bg-surface border border-border p-4 rounded-2xl shadow-xs space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={params.q || ''}
          onChange={(e) => onChange({ q: e.target.value || undefined })}
          placeholder={tSearch('placeholder')}
          aria-label={tSearch('placeholder')}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface-muted/40 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary"
        />
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${hideRoomTypeFilter ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-3`}>
        <Select
          aria-label="Chọn Tỉnh hoặc Thành phố"
          options={provinceOptions}
          value={params.provinceCode || ''}
          onChange={(e) => onChange({ provinceCode: e.target.value, wardCode: undefined, districtCode: undefined })}
        />
        <Select
          aria-label="Chọn Phường hoặc Xã"
          options={wardOptions}
          value={params.wardCode || ''}
          onChange={(e) => onChange({ wardCode: e.target.value })}
          disabled={!params.provinceCode}
        />
        {!hideRoomTypeFilter && (
          <Select
            aria-label="Chọn Loại phòng"
            options={roomTypeOptions}
            value={params.roomTypeCode || ''}
            onChange={(e) => onChange({ roomTypeCode: e.target.value })}
          />
        )}
        <Select
          aria-label="Chọn Mức giá"
          options={priceOptions}
          value={currentPriceValue}
          onChange={handlePriceChange}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
        <div className="flex items-center gap-4 text-foreground-muted">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={params.verifiedOnly || false}
              onChange={(e) => onChange({ verifiedOnly: e.target.checked || undefined })}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tin đã xác thực</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={params.allowPets || false}
              onChange={(e) => onChange({ allowPets: e.target.checked || undefined })}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Cho phép nuôi thú cưng</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={params.allowCooking || false}
              onChange={(e) => onChange({ allowCooking: e.target.checked || undefined })}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Cho phép nấu ăn</span>
          </label>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-foreground-muted hover:text-foreground"
        >
          {tCat('resetFilters')}
        </Button>
      </div>
    </div>
  );
}
