'use client';

import React from 'react';
import {
  Wifi,
  Wind,
  Flame,
  Refrigerator,
  WashingMachine,
  Utensils,
  Sun,
  ArrowUpDown,
  Car,
  ShieldCheck,
  Tv,
  Bed,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AmenityDto } from '@/application/dto/listing.dto';

interface RoomAmenitiesProps {
  amenities: AmenityDto[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  air_conditioner: Wind,
  wind: Wind,
  water_heater: Flame,
  flame: Flame,
  refrigerator: Refrigerator,
  washing_machine: WashingMachine,
  kitchen: Utensils,
  utensils: Utensils,
  balcony: Sun,
  sun: Sun,
  elevator: ArrowUpDown,
  arrowupdown: ArrowUpDown,
  parking: Car,
  car: Car,
  security: ShieldCheck,
  shieldcheck: ShieldCheck,
  tv: Tv,
  bed: Bed,
};

const CATEGORY_NAMES: Record<string, string> = {
  BASIC: 'Tiện nghi cơ bản',
  FURNITURE: 'Nội thất & Gia dụng',
  FACILITY: 'Tiện ích không gian',
  BUILDING: 'Tiện ích tòa nhà & An ninh',
  OTHER: 'Tiện ích khác',
};

export function RoomAmenities({ amenities }: RoomAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
        Chưa có thông tin tiện nghi cụ thể.
      </div>
    );
  }

  // Group by category
  const grouped = amenities.reduce<Record<string, AmenityDto[]>>((acc, item) => {
    const cat = item.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const renderIcon = (iconName?: string) => {
    if (!iconName) return <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />;
    const key = iconName.toLowerCase().replace(/[-_]/g, '');
    const IconComponent = ICON_MAP[key] || Sparkles;
    return <IconComponent className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
        Tiện nghi & Dịch vụ có sẵn ({amenities.length})
      </h2>

      <div className="space-y-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {CATEGORY_NAMES[category] || category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 flex items-center gap-2.5 text-xs font-medium text-stone-800 dark:text-stone-200"
                >
                  {renderIcon(item.icon || item.code)}
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
