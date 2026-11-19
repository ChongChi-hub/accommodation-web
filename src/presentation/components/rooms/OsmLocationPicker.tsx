'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { toast } from '@/presentation/stores/toast.store';
import { Crosshair, ExternalLink, Loader2, MapPin, Minus, Plus, RotateCcw, Search } from 'lucide-react';
import {
  computeVisibleTiles,
  DEFAULT_VN_CENTER,
  geocodeVietnamAddress,
  getProvinceDefaultCenter,
  latLngToWorldPixel,
  OSM_TILE_SIZE,
  roundCoord,
  worldPixelToLatLng,
} from './osm-tile-math';

interface OsmLocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  wardName?: string;
  provinceName?: string;
  onChange: (lat: number | undefined, lng: number | undefined) => void;
}

export function OsmLocationPicker({ latitude, longitude, address, wardName, provinceName, onChange }: OsmLocationPickerProps) {
  const hasPin = typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(() => (hasPin ? { lat: latitude, lng: longitude } : getProvinceDefaultCenter(provinceName)));
  const [zoom, setZoom] = useState<number>(hasPin ? 16 : 13);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [matchedLabel, setMatchedLabel] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 640, height: 320 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startCenterPx: { x: number; y: number }; moved: boolean } | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initialKeyRef = useRef<string | null>(hasPin ? `${provinceName || ''}|${wardName || ''}|${address?.trim() || ''}` : null);
  const lastGeoKeyRef = useRef<string>('');
  const prevAddrRef = useRef<string>(address?.trim() || '');

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
  }, []);

  useEffect(() => { if (hasPin) setCenter({ lat: latitude, lng: longitude }); }, [hasPin, latitude, longitude]);

  useEffect(() => {
    const trimmedAddr = address?.trim() || '';
    const trimmedWard = wardName?.trim() || '';
    const trimmedProv = provinceName?.trim() || '';
    const key = `${trimmedProv}|${trimmedWard}|${trimmedAddr}`;
    if (!trimmedProv && !trimmedWard && !trimmedAddr) return;
    if (initialKeyRef.current !== null && initialKeyRef.current === key) return;
    initialKeyRef.current = null;
    if (lastGeoKeyRef.current === key) return;

    const addrChanged = trimmedAddr !== prevAddrRef.current;
    prevAddrRef.current = trimmedAddr;
    const delayMs = addrChanged ? 650 : 250;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const found = await geocodeVietnamAddress(trimmedAddr, trimmedWard, trimmedProv, controller.signal);
        if (controller.signal.aborted) return;
        lastGeoKeyRef.current = key;
        if (found) {
          setCenter({ lat: found.lat, lng: found.lng });
          setZoom(found.zoom);
          setMatchedLabel(found.displayName || null);
          onChangeRef.current(found.lat, found.lng);
        } else if (trimmedProv) {
          setCenter(getProvinceDefaultCenter(trimmedProv));
          setZoom(13);
        }
      } catch {
        // aborted or network error
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [address, wardName, provinceName]);

  const { originX, originY, tiles } = computeVisibleTiles(center, zoom, viewport);
  const pinScreenPos = hasPin ? (() => { const p = latLngToWorldPixel(latitude, longitude, zoom); return { left: p.x - originX, top: p.y - originY }; })() : null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startCenterPx: latLngToWorldPixel(center.lat, center.lng, zoom), moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    if (drag.moved) setCenter(worldPixelToLatLng(drag.startCenterPx.x - dx, drag.startCenterPx.y - dy, zoom));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!drag.moved && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const picked = worldPixelToLatLng(originX + (e.clientX - rect.left), originY + (e.clientY - rect.top), zoom);
      onChange(picked.lat, picked.lng);
      setCenter(picked);
      setMatchedLabel(null);
    }
  };

  const handleGeocodeAddress = async () => {
    if (!address?.trim() && !wardName && !provinceName) { toast.error('Vui lòng nhập địa chỉ hoặc chọn tỉnh/thành trước khi định vị.'); return; }
    setIsSearching(true);
    try {
      const found = await geocodeVietnamAddress(address, wardName, provinceName);
      if (found) {
        onChange(found.lat, found.lng);
        setCenter({ lat: found.lat, lng: found.lng });
        setZoom(found.zoom);
        setMatchedLabel(found.displayName || null);
        toast.success('Đã tìm thấy vị trí gần nhất trên bản đồ. Bạn có thể bấm trực tiếp để tinh chỉnh.');
      } else {
        toast.error('Chưa tìm thấy tọa độ tự động. Hãy kéo bản đồ và bấm trực tiếp vào vị trí nhà trọ.');
      }
    } catch {
      toast.error('Không thể tra cứu bản đồ lúc này. Bạn có thể bấm trực tiếp trên bản đồ để ghim vị trí.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { toast.error('Trình duyệt không hỗ trợ định vị GPS.'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = roundCoord(pos.coords.latitude);
        const lng = roundCoord(pos.coords.longitude);
        onChange(lat, lng); setCenter({ lat, lng }); setZoom(17); setMatchedLabel('Vị trí GPS hiện tại'); setIsLocating(false);
        toast.success('Đã lấy vị trí GPS hiện tại.');
      },
      () => { setIsLocating(false); toast.error('Không thể truy cập GPS. Vui lòng cấp quyền vị trí hoặc bấm chọn trực tiếp trên bản đồ.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const osmExternalUrl = hasPin
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
    : `https://www.openstreetmap.org/#map=${zoom}/${center.lat || DEFAULT_VN_CENTER.lat}/${center.lng || DEFAULT_VN_CENTER.lng}`;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface-muted/40 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            Ghim vị trí chính xác trên OpenStreetMap
          </p>
          <p className="text-[11px] text-foreground-muted mt-0.5">
            Bản đồ tự động dò theo Tỉnh/Thành, Phường/Xã và Địa chỉ chi tiết. Kéo hoặc bấm trực tiếp để tinh chỉnh vị trí nhà trọ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={handleGeocodeAddress} disabled={isSearching} leftIcon={isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}>
            Tìm theo địa chỉ
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation} disabled={isLocating} leftIcon={isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}>
            Vị trí hiện tại
          </Button>
        </div>
      </div>

      <div ref={containerRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} role="application" aria-label="Bản đồ chọn vị trí phòng trọ OpenStreetMap" className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-border bg-stone-200 dark:bg-stone-800 select-none cursor-crosshair touch-none">
        {tiles.map((tile) => (
          <img key={tile.key} src={tile.url} alt="" draggable={false} width={OSM_TILE_SIZE} height={OSM_TILE_SIZE} onError={(e) => { if (!e.currentTarget.dataset.fb) { e.currentTarget.dataset.fb = '1'; e.currentTarget.src = tile.fallbackUrl; } }} className="absolute max-w-none pointer-events-none select-none" style={{ left: tile.left, top: tile.top, width: OSM_TILE_SIZE, height: OSM_TILE_SIZE }} />
        ))}
        {isSearching && (
          <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-lg bg-stone-900/85 text-white px-2.5 py-1 text-[11px] shadow">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang định vị theo địa chỉ...
          </div>
        )}
        {pinScreenPos && (
          <div className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-full" style={{ left: pinScreenPos.left, top: pinScreenPos.top }}>
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg ring-4 ring-white/90 flex items-center justify-center"><MapPin className="w-4 h-4 fill-white text-rose-600" /></div>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-700 mt-0.5 shadow" />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
          <button type="button" onClick={() => setZoom((z) => Math.min(18, z + 1))} aria-label="Phóng to bản đồ" className="w-8 h-8 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"><Plus className="w-4 h-4" /></button>
          <button type="button" onClick={() => setZoom((z) => Math.max(5, z - 1))} aria-label="Thu nhỏ bản đồ" className="w-8 h-8 rounded-lg bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 shadow flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"><Minus className="w-4 h-4" /></button>
        </div>
        <div className="absolute bottom-2 right-2 z-20 rounded bg-white/85 dark:bg-stone-900/85 px-2 py-0.5 text-[10px] text-stone-700 dark:text-stone-300">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {hasPin ? (
          <div className="flex flex-wrap items-center gap-2 text-teal-700 dark:text-teal-400 font-medium">
            <span>Đã ghim: <strong className="font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</strong>{matchedLabel ? ` · ${matchedLabel}` : ''}</span>
            <button type="button" onClick={() => { onChange(undefined, undefined); setMatchedLabel(null); }} className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-rose-600 cursor-pointer"><RotateCcw className="w-3 h-3" /> Bỏ ghim</button>
          </div>
        ) : (
          <span className="text-foreground-muted">Nhập địa chỉ hoặc bấm trực tiếp lên bản đồ để ghim tọa độ.</span>
        )}
        <a href={osmExternalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">Mở trên OpenStreetMap <ExternalLink className="w-3 h-3" /></a>
      </div>
    </div>
  );
}
