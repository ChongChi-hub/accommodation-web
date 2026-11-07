'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Select } from '@/presentation/components/ui/Select';
import { Button } from '@/presentation/components/ui/Button';
import { RoomFilterParams, ProvinceDto, WardDto } from '@/application/dto/listing.dto';

export interface RoomFilterBarProps {
  params: RoomFilterParams;
  onChange: (newParams: Partial<RoomFilterParams>) => void;
  onReset: () => void;
  provinces: ProvinceDto[];
  wards?: WardDto[];
}

export function RoomFilterBar({
  params,
  onChange,
  onReset,
  provinces,
  wards = [],
}: RoomFilterBarProps) {
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
    { value: 'MINI_APARTMENT', label: 'Chung cư mini' },
    { value: 'STUDIO', label: 'Căn hộ Studio' },
    { value: 'APARTMENT', label: 'Căn hộ nguyên căn' },
    { value: 'HOMESTAY', label: 'Phòng trọ cao cấp' },
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
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-4 rounded-2xl shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
        <Select
          aria-label="Chọn Loại phòng"
          options={roomTypeOptions}
          value={params.roomTypeCode || ''}
          onChange={(e) => onChange({ roomTypeCode: e.target.value })}
        />
        <Select
          aria-label="Chọn Mức giá"
          options={priceOptions}
          value={currentPriceValue}
          onChange={handlePriceChange}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
        <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={params.allowPets || false}
              onChange={(e) => onChange({ allowPets: e.target.checked || undefined })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Cho phép nuôi thú cưng</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={params.allowCooking || false}
              onChange={(e) => onChange({ allowCooking: e.target.checked || undefined })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Cho phép nấu ăn</span>
          </label>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-stone-500 hover:text-stone-900"
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}

