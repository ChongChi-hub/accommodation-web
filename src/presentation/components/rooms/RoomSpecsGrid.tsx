'use client';

import React from 'react';
import {
  Maximize2,
  Users,
  Layers,
  Bed,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { RoomDetailDto } from '@/application/dto/listing.dto';

interface RoomSpecsGridProps {
  room: RoomDetailDto;
}

export function RoomSpecsGrid({ room }: RoomSpecsGridProps) {
  const formatFurnishing = (val?: string) => {
    switch (val?.toUpperCase()) {
      case 'FULL':
        return 'Đầy đủ nội thất';
      case 'PARTIAL':
        return 'Nội thất cơ bản';
      case 'NONE':
        return 'Nhà trống';
      default:
        return 'Đầy đủ nội thất';
    }
  };

  const formatAvailableDate = (dateStr?: string) => {
    if (!dateStr) return 'Dọn vào ngay';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN');
    } catch {
      return 'Dọn vào ngay';
    }
  };

  const specs = [
    {
      icon: Maximize2,
      label: 'Diện tích sử dụng',
      value: `${room.area} m²`,
    },
    {
      icon: Users,
      label: 'Sức chứa tối đa',
      value: `Tối đa ${room.maxOccupants} người`,
    },
    {
      icon: Layers,
      label: 'Vị trí phòng',
      value: room.floor ? `Tầng ${room.floor}` : 'Tầng 1',
    },
    {
      icon: Bed,
      label: 'Quy mô phòng',
      value: `${room.bedrooms || 1} PN • ${room.bathrooms || 1} WC`,
    },
    {
      icon: Sparkles,
      label: 'Tình trạng nội thất',
      value: formatFurnishing(room.furnishing),
    },
    {
      icon: CalendarCheck,
      label: 'Thời gian dọn vào',
      value: formatAvailableDate(room.availableDate),
    },
  ];

  return (
    <div
      id="overview"
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 md:p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800"
    >
      {specs.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 shadow-2xs"
          >
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block truncate">
                {item.label}
              </span>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">
                {item.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
