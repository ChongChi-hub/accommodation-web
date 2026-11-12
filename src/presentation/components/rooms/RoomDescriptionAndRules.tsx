'use client';
import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import {
  PawPrint,
  UtensilsCrossed,
  Clock,
  UserCheck,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { RoomDetailDto } from '@/application/dto/listing.dto';
import { cn } from '@/lib/cn';

interface RoomDescriptionAndRulesProps {
  room: RoomDetailDto;
}

export function RoomDescriptionAndRules({ room }: RoomDescriptionAndRulesProps) {
  const tAuto = useTranslations('autoI18n');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatGender = (val?: string) => {
    switch (val?.toUpperCase()) {
      case 'FEMALE_ONLY':
        return 'Chỉ cho Nữ thuê';
      case 'MALE_ONLY':
        return 'Chỉ cho Nam thuê';
      default:
        return 'Nam & Nữ (Tất cả đối tượng)';
    }
  };

  const rules = [
    {
      icon: PawPrint,
      title: 'Nuôi thú cưng',
      allowed: room.allowPets,
      desc: room.allowPets
        ? 'Cho phép nuôi thú cưng (yêu cầu giữ vệ sinh chung và không làm ồn)'
        : 'Không cho phép nuôi chó, mèo hoặc vật nuôi gây ồn',
    },
    {
      icon: UtensilsCrossed,
      title: 'Nấu ăn',
      allowed: room.allowCooking,
      desc: room.allowCooking
        ? 'Cho phép nấu ăn thoải mái, khuyến khích sử dụng bếp từ an toàn PCCC'
        : 'Không nấu nướng trong phòng để đảm bảo an toàn PCCC',
    },
    {
      icon: Clock,
      title: 'Giờ giấc & Giới nghiêm',
      allowed: true,
      desc: room.curfew && room.curfew.trim() !== ''
        ? room.curfew
        : 'Giờ giấc tự do 24/7, có khóa cổng vân tay riêng',
    },
    {
      icon: UserCheck,
      title: 'Khách đến thăm',
      allowed: true,
      desc: 'Được phép đón tiếp bạn bè, người thân; cần thông báo trước nếu lưu trú qua đêm',
    },
    {
      icon: Users,
      title: 'Đối tượng thuê',
      allowed: true,
      desc: formatGender(room.genderPreference),
    },
    {
      icon: FileText,
      title: 'Thời hạn hợp đồng',
      allowed: true,
      desc: `Cam kết thời hạn thuê tối thiểu ${room.minLeaseMonths || 6} tháng`,
    },
  ];

  return (
    <div id="description" className="space-y-8">
      {/* 1. Description with Read More */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          {tAuto('k0580')}
        </h2>
        <div className="relative">
          <div
            className={cn(
              'text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line',
              !isExpanded && 'line-clamp-4'
            )}
          >
            {room.description ||
              'Phòng trọ tiện nghi, thiết kế hiện đại, đầy đủ ánh sáng tự nhiên và thông gió tốt. Khu vực an ninh, văn minh, gần nhiều trường đại học và trục đường chính.'}
          </div>
          {(!room.description || room.description.length > 200) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer select-none"
            >
              {isExpanded ? (
                <>
                  {tAuto('k0581')}{' '}<ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  {tAuto('k0582')}{' '}<ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. House Rules Icon List */}
      <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            {tAuto('k0583')}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {tAuto('k0584')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rules.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/40"
              >
                <div
                  className={cn(
                    'p-2 rounded-lg shrink-0 mt-0.5',
                    rule.allowed
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {rule.title}
                    </span>
                    {rule.allowed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
