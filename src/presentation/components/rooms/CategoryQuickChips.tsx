'use client';

import React from 'react';
import { RoomFilterParams } from '@/application/dto/listing.dto';
import { cn } from '@/lib/cn';

interface QuickChip {
  id: string;
  label: string;
  isActive: (params: RoomFilterParams) => boolean;
  apply: (params: RoomFilterParams) => Partial<RoomFilterParams>;
}

const PHONG_TRO_CHIPS: QuickChip[] = [
  {
    id: 'under_2m',
    label: 'Dưới 2 triệu',
    isActive: (p) => p.maxPrice === 2000000,
    apply: (p) => ({ maxPrice: p.maxPrice === 2000000 ? undefined : 2000000 }),
  },
  {
    id: 'under_3m',
    label: 'Dưới 3 triệu',
    isActive: (p) => p.maxPrice === 3000000,
    apply: (p) => ({ maxPrice: p.maxPrice === 3000000 ? undefined : 3000000 }),
  },
  {
    id: 'pets',
    label: 'Nuôi thú cưng',
    isActive: (p) => p.allowPets === true,
    apply: (p) => ({ allowPets: p.allowPets ? undefined : true }),
  },
  {
    id: 'cooking',
    label: 'Được nấu ăn',
    isActive: (p) => p.allowCooking === true,
    apply: (p) => ({ allowCooking: p.allowCooking ? undefined : true }),
  },
];

const NHA_NGUYEN_CAN_CHIPS: QuickChip[] = [
  {
    id: 'bed_1',
    label: '1 Phòng ngủ',
    isActive: (p) => p.bedrooms === 1,
    apply: (p) => ({ bedrooms: p.bedrooms === 1 ? undefined : 1 }),
  },
  {
    id: 'bed_2',
    label: '2 Phòng ngủ',
    isActive: (p) => p.bedrooms === 2,
    apply: (p) => ({ bedrooms: p.bedrooms === 2 ? undefined : 2 }),
  },
  {
    id: 'bed_3',
    label: '3+ Phòng ngủ',
    isActive: (p) => (p.bedrooms ?? 0) >= 3,
    apply: (p) => ({ bedrooms: (p.bedrooms ?? 0) >= 3 ? undefined : 3 }),
  },
  {
    id: 'full_furniture',
    label: 'Đầy đủ nội thất',
    isActive: (p) => p.furnishing === 'FULL',
    apply: (p) => ({ furnishing: p.furnishing === 'FULL' ? undefined : 'FULL' }),
  },
];

const CAN_HO_CHIPS: QuickChip[] = [
  {
    id: 'studio',
    label: 'Studio',
    isActive: (p) => p.roomTypeCode === 'STUDIO',
    apply: (p) => ({ roomTypeCode: p.roomTypeCode === 'STUDIO' ? undefined : 'STUDIO' }),
  },
  {
    id: 'apt_1pn',
    label: '1 Phòng ngủ',
    isActive: (p) => p.bedrooms === 1,
    apply: (p) => ({ bedrooms: p.bedrooms === 1 ? undefined : 1 }),
  },
  {
    id: 'apt_2pn',
    label: '2 Phòng ngủ',
    isActive: (p) => p.bedrooms === 2,
    apply: (p) => ({ bedrooms: p.bedrooms === 2 ? undefined : 2 }),
  },
  {
    id: 'pets',
    label: 'Cho nuôi pet',
    isActive: (p) => p.allowPets === true,
    apply: (p) => ({ allowPets: p.allowPets ? undefined : true }),
  },
];

const O_GHEP_CHIPS: QuickChip[] = [
  {
    id: 'male',
    label: 'Nam',
    isActive: (p) => p.genderPreference === 'MALE',
    apply: (p) => ({ genderPreference: p.genderPreference === 'MALE' ? undefined : 'MALE' }),
  },
  {
    id: 'female',
    label: 'Nữ',
    isActive: (p) => p.genderPreference === 'FEMALE',
    apply: (p) => ({ genderPreference: p.genderPreference === 'FEMALE' ? undefined : 'FEMALE' }),
  },
  {
    id: 'available_spots',
    label: 'Còn từ 2 chỗ',
    isActive: (p) => p.minAvailableSpots === 2,
    apply: (p) => ({ minAvailableSpots: p.minAvailableSpots === 2 ? undefined : 2 }),
  },
  {
    id: 'under_1_5m',
    label: 'Dưới 1.5 triệu/giường',
    isActive: (p) => p.maxPrice === 1500000,
    apply: (p) => ({ maxPrice: p.maxPrice === 1500000 ? undefined : 1500000 }),
  },
];

const CATEGORY_CHIPS_MAP: Record<string, QuickChip[]> = {
  phongTro: PHONG_TRO_CHIPS,
  nhaNguyenCan: NHA_NGUYEN_CAN_CHIPS,
  canHo: CAN_HO_CHIPS,
  oGhep: O_GHEP_CHIPS,
};

interface CategoryQuickChipsProps {
  categoryKey?: string;
  params: RoomFilterParams;
  onChange: (patch: Partial<RoomFilterParams>) => void;
  className?: string;
}

export function CategoryQuickChips({
  categoryKey,
  params,
  onChange,
  className,
}: CategoryQuickChipsProps) {
  const chips = categoryKey ? CATEGORY_CHIPS_MAP[categoryKey] : undefined;
  if (!chips || chips.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none', className)}>
      <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider shrink-0">
        Gợi ý:
      </span>
      {chips.map((chip) => {
        const active = chip.isActive(params);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.apply(params))}
            className={cn(
              'shrink-0 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer font-medium',
              active
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

