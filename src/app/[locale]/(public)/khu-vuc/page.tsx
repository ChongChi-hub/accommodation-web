import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { MapPin, ArrowRight, Building, Home, BedDouble, Users } from 'lucide-react';
import { APP_ROUTES } from '@/shared/routes';

export const metadata: Metadata = {
  title: 'Khu vực thuê phòng trọ toàn quốc | CozyNest',
  description: 'Khám phá phòng trọ, căn hộ, nhà nguyên căn và chỗ ở ghép tại các tỉnh thành trọng điểm cả nước.',
};

export default async function KhuVucPage() {
  const tArea = await getTranslations('areasPage');
  const hotAreas = await container.listing.listingRepository.getHotAreas(20, false).catch(() => []);

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950/60 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumb
          items={[
            { label: tArea('breadcrumbHome'), href: APP_ROUTES.home },
            { label: tArea('breadcrumbAreas') },
          ]}
        />

        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            {tArea('eyebrow')}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            {tArea('title')}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            {tArea('subtitle')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotAreas.map((area, idx) => {
            const isLarge = idx === 0 || idx === 1;
            return (
              <div
                key={area.code}
                className={`group relative rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-teal-500/40 ${
                  isLarge ? 'sm:col-span-2 aspect-16/9 sm:aspect-21/9' : 'aspect-4/3'
                }`}
              >
                <Image
                  src={area.imageUrl || '/images/areas/ha-noi-640.webp'}
                  alt={area.name}
                  fill
                  sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                {/* Stretched link to province page */}
                <Link
                  href={`/khu-vuc/${area.slug || area.code.toLowerCase()}`}
                  className="absolute inset-0 z-0"
                  aria-label={`Xem phòng tại ${area.name}`}
                />

                <div className="relative z-1 p-5 flex flex-col justify-between h-full pointer-events-none text-white">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-semibold">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      {area.code}
                    </span>
                    <span className="text-xs font-medium text-stone-200 drop-shadow-xs">
                      {area.roomCount} {tArea('listingsSuffix')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold drop-shadow-sm group-hover:text-teal-300 transition-colors">
                      {area.name}
                    </h2>

                    {/* Quick Category Links */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 pointer-events-auto relative z-10">
                      <Link
                        href={`/phong-tro?provinceCode=${area.code}`}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors flex items-center gap-1"
                      >
                        <Home className="w-3 h-3" /> {tArea('quickRoom')}
                      </Link>
                      <Link
                        href={`/can-ho?provinceCode=${area.code}`}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors flex items-center gap-1"
                      >
                        <Building className="w-3 h-3" /> {tArea('quickApartment')}
                      </Link>
                      <Link
                        href={`/nha-nguyen-can?provinceCode=${area.code}`}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors flex items-center gap-1"
                      >
                        <BedDouble className="w-3 h-3" /> {tArea('quickHouse')}
                      </Link>
                      <Link
                        href={`/o-ghep?provinceCode=${area.code}`}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" /> {tArea('quickShared')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

