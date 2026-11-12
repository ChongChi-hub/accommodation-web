'use client';
import { useTranslations } from 'next-intl';

import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

interface RoomMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address: string;
}

export function RoomMap({ latitude, longitude, address }: RoomMapProps) {
  const tAuto = useTranslations('autoI18n');
  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const delta = 0.006;
  const osmEmbedUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - delta}%2C${latitude - delta}%2C${longitude + delta}%2C${latitude + delta}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : null;

  return (
    <div id="location" className="space-y-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            {tAuto('k0608')}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">{address}</p>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Navigation className="w-3.5 h-3.5" />
            {tAuto('k0609')}
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Button>
        </a>
      </div>

      {hasCoordinates && osmEmbedUrl ? (
        <div className="space-y-2">
          <div className="aspect-16/9 sm:aspect-21/9 w-full rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 relative">
            <iframe
              title={`Bản đồ vị trí: ${address}`}
              src={osmEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] text-stone-400 text-right">
            {tAuto('k0610')}{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-600"
            >
              {tAuto('k0611')}
            </a>{' '}
            {tAuto('k0612')}
          </p>
        </div>
      ) : null}
    </div>
  );
}

