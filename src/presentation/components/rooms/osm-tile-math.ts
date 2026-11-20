export const OSM_TILE_SIZE = 256;
export const DEFAULT_VN_CENTER = { lat: 21.028511, lng: 105.854167 };

const PROVINCE_CENTERS: Array<{ match: string; lat: number; lng: number }> = [
  { match: 'ha noi', lat: 21.028511, lng: 105.854167 },
  { match: 'ho chi minh', lat: 10.776889, lng: 106.700806 },
  { match: 'da nang', lat: 16.054407, lng: 108.202167 },
  { match: 'hai phong', lat: 20.844912, lng: 106.688084 },
  { match: 'can tho', lat: 10.045162, lng: 105.746854 },
  { match: 'binh duong', lat: 11.17316, lng: 106.65249 },
  { match: 'dong nai', lat: 10.94647, lng: 106.82432 },
  { match: 'hue', lat: 16.463713, lng: 107.590866 },
  { match: 'nha trang', lat: 12.238791, lng: 109.196749 },
  { match: 'khanh hoa', lat: 12.238791, lng: 109.196749 },
  { match: 'da lat', lat: 11.940419, lng: 108.458313 },
  { match: 'lam dong', lat: 11.940419, lng: 108.458313 },
  { match: 'bac ninh', lat: 21.186081, lng: 106.07631 },
  { match: 'thai nguyen', lat: 21.567156, lng: 105.825204 },
];

export function normalizeText(raw: string): string {
  return raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
}

export function getProvinceDefaultCenter(provinceName?: string): { lat: number; lng: number } {
  if (!provinceName) return DEFAULT_VN_CENTER;
  const norm = normalizeText(provinceName);
  const found = PROVINCE_CENTERS.find((p) => norm.includes(p.match));
  return found ? { lat: found.lat, lng: found.lng } : DEFAULT_VN_CENTER;
}

export function clampLat(lat: number): number {
  return Math.max(-85.0511, Math.min(85.0511, lat));
}

export function wrapLng(lng: number): number {
  let v = lng;
  while (v > 180) v -= 360;
  while (v < -180) v += 360;
  return v;
}

export function roundCoord(val: number): number {
  return Math.round(val * 1_000_000) / 1_000_000;
}

export function latLngToWorldPixel(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const worldSize = OSM_TILE_SIZE * Math.pow(2, zoom);
  const sinLat = Math.sin((clampLat(lat) * Math.PI) / 180);
  const x = ((lng + 180) / 360) * worldSize;
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * worldSize;
  return { x, y };
}

export function worldPixelToLatLng(px: number, py: number, zoom: number): { lat: number; lng: number } {
  const worldSize = OSM_TILE_SIZE * Math.pow(2, zoom);
  const lng = wrapLng((px / worldSize) * 360 - 180);
  const n = Math.PI - (2 * Math.PI * py) / worldSize;
  const lat = clampLat((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  return { lat: roundCoord(lat), lng: roundCoord(lng) };
}

export interface VisibleOsmTile {
  key: string;
  url: string;
  fallbackUrl: string;
  left: number;
  top: number;
}

export function computeVisibleTiles(
  center: { lat: number; lng: number },
  zoom: number,
  viewport: { width: number; height: number }
): { originX: number; originY: number; tiles: VisibleOsmTile[] } {
  const centerPx = latLngToWorldPixel(center.lat, center.lng, zoom);
  const originX = centerPx.x - viewport.width / 2;
  const originY = centerPx.y - viewport.height / 2;
  const tileCount = Math.pow(2, zoom);
  const minTileX = Math.floor(originX / OSM_TILE_SIZE);
  const maxTileX = Math.floor((originX + viewport.width) / OSM_TILE_SIZE);
  const minTileY = Math.max(0, Math.floor(originY / OSM_TILE_SIZE));
  const maxTileY = Math.min(tileCount - 1, Math.floor((originY + viewport.height) / OSM_TILE_SIZE));

  const tiles: VisibleOsmTile[] = [];
  for (let ty = minTileY; ty <= maxTileY; ty++) {
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      const wrappedX = ((tx % tileCount) + tileCount) % tileCount;
      tiles.push({
        key: `${zoom}-${tx}-${ty}`,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`,
        fallbackUrl: `https://tile.openstreetmap.de/${zoom}/${wrappedX}/${ty}.png`,
        left: Math.round(tx * OSM_TILE_SIZE - originX),
        top: Math.round(ty * OSM_TILE_SIZE - originY),
      });
    }
  }
  return { originX, originY, tiles };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  zoom: number;
  displayName?: string;
}

function joinUniqueParts(parts: Array<string | undefined>): string {
  const seen: string[] = [];
  const kept: string[] = [];
  for (const raw of parts) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const norm = normalizeText(trimmed);
    if (!norm) continue;
    if (seen.some((prev) => prev.includes(norm))) continue;
    seen.push(norm);
    kept.push(trimmed);
  }
  return kept.join(', ');
}

export function buildAddressQueries(
  address?: string,
  wardName?: string,
  provinceName?: string
): Array<{ query: string; zoom: number }> {
  const items: Array<{ query: string; zoom: number }> = [];
  const pushUnique = (query: string, zoom: number) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (!items.some((i) => normalizeText(i.query) === normalizeText(trimmed))) {
      items.push({ query: trimmed, zoom });
    }
  };

  const cleanAddr = address?.trim() || '';
  if (cleanAddr) {
    pushUnique(joinUniqueParts([cleanAddr, wardName, provinceName, 'Việt Nam']), 17);
    const streetOnly = cleanAddr
      .replace(/^(số|so)\s+[\w/-]+[,\s]+/i, '')
      .replace(/^[\d]+[a-zA-Z]?(\/[\w-]+)*[,\s]+/, '')
      .trim();
    if (streetOnly && streetOnly.length >= 4 && normalizeText(streetOnly) !== normalizeText(cleanAddr)) {
      pushUnique(joinUniqueParts([streetOnly, wardName, provinceName, 'Việt Nam']), 16);
    }
  }
  if (wardName?.trim()) {
    pushUnique(joinUniqueParts([wardName, provinceName, 'Việt Nam']), 15);
  }
  if (provinceName?.trim()) {
    pushUnique(joinUniqueParts([provinceName, 'Việt Nam']), 13);
  }
  return items;
}

export async function geocodeVietnamAddress(
  address?: string,
  wardName?: string,
  provinceName?: string,
  signal?: AbortSignal
): Promise<GeocodeResult | null> {
  const candidates = buildAddressQueries(address, wardName, provinceName);

  for (const item of candidates) {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(item.query)}`, {
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!res.ok) continue;
    const data = (await res.json()) as { found?: boolean; lat?: number; lng?: number; displayName?: string };
    if (data.found && typeof data.lat === 'number' && typeof data.lng === 'number') {
      return { lat: data.lat, lng: data.lng, zoom: item.zoom, displayName: data.displayName };
    }
  }
  return null;
}
