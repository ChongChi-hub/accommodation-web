'use client';
import { useTranslations } from 'next-intl';

import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, ExternalLink, MapPin, Minus, Navigation, Plus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';
import {
  computeVisibleTiles,
  latLngToWorldPixel,
  OSM_TILE_SIZE,
  worldPixelToLatLng,
} from './osm-tile-math';

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
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const [center, setCenter] = useState<{ lat: number; lng: number }>(() =>
    hasCoordinates ? { lat: latitude, lng: longitude } : { lat: 21.028511, lng: 105.854167 }
  );
  const [zoom, setZoom] = useState(16);
  const [viewport, setViewport] = useState({ width: 720, height: 320 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startCenterPx: { x: number; y: number } } | null>(null);

  useEffect(() => {
    if (hasCoordinates) {
      setCenter({ lat: latitude, lng: longitude });
    }
  }, [hasCoordinates, latitude, longitude]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) setViewport({ width: rect.width, height: rect.height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasCoordinates]);

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const { originX, originY, tiles } = computeVisibleTiles(center, zoom, viewport);
  const pinScreenPos = hasCoordinates
    ? (() => {
        const p = latLngToWorldPixel(latitude, longitude, zoom);
        return { left: p.x - originX, top: p.y - originY };
      })()
    : null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCenterPx: latLngToWorldPixel(center.lat, center.lng, zoom),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setCenter(worldPixelToLatLng(drag.startCenterPx.x - dx, drag.startCenterPx.y - dy, zoom));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

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

        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Navigation className="w-3.5 h-3.5" />
            {tAuto('k0609')}
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Button>
        </a>
      </div>

      {hasCoordinates ? (
        <div className="space-y-2">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            role="region"
            aria-label={`Bản đồ vị trí: ${address}`}
            className="aspect-16/9 sm:aspect-21/9 w-full min-h-[260px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-200 dark:bg-stone-800 relative select-none cursor-grab active:cursor-grabbing touch-none"
          >
            {tiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.url}
                alt=""
                draggable={false}
                width={OSM_TILE_SIZE}
                height={OSM_TILE_SIZE}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fallbackApplied) return;
                  img.dataset.fallbackApplied = '1';
                  img.src = tile.fallbackUrl;
                }}
                className="absolute max-w-none pointer-events-none select-none"
                style={{ left: tile.left, top: tile.top, width: OSM_TILE_SIZE, height: OSM_TILE_SIZE }}
              />
            ))}

            {pinScreenPos && (
              <div
                className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-full"
                style={{ left: pinScreenPos.left, top: pinScreenPos.top }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-rose-600 text-white shadow-lg ring-4 ring-white/95 flex items-center justify-center">
                    <MapPin className="w-4 h-4 fill-white text-rose-600" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-rose-700 mt-0.5 shadow" />
                </div>
              </div>
            )}

            <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(18, z + 1))}
                aria-label="Phóng to bản đồ"
                className="w-8 h-8 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(5, z - 1))}
                aria-label="Thu nhỏ bản đồ"
                className="w-8 h-8 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCenter({ lat: latitude, lng: longitude });
                  setZoom(16);
                }}
                aria-label="Về vị trí phòng trọ"
                title="Về vị trí phòng trọ"
                className="w-8 h-8 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 text-teal-700 dark:text-teal-400 shadow flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
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
