'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { MapPin, ArrowRight } from 'lucide-react';
import { HotAreaDto } from '@/application/dto/listing.dto';

interface HomeHotAreasProps {
  areas: HotAreaDto[];
  isLoading?: boolean;
}

export function HomeHotAreas({ areas, isLoading }: HomeHotAreasProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-4/3 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const topAreas = areas.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            Khu vực trọng điểm
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Khám phá phòng trọ theo thành phố
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {topAreas.map((area) => (
          <Link
            key={area.code}
            href={`/rooms?provinceCode=${area.code}`}
            className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-stone-200/60 dark:border-stone-800 bg-stone-900 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Image
              src={area.imageUrl || 'https://res.cloudinary.com/dfs07oaet/image/upload/v1794153417/cozynest/uploads/locations/ha-noi.webp'}
              alt={area.name}
              fill
              className="object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-300"
              sizes="(max-width: 768px) 50vw, 200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h3 className="text-xs font-bold leading-tight group-hover:text-amber-300 transition-colors">
                {area.name}
              </h3>
              <p className="text-[10px] text-stone-300 font-medium mt-0.5">
                {area.roomCount} phòng trống
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

