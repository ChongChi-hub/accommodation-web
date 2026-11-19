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
        left: Math.round(tx * OSM_TILE_SIZE - originX),
        top: Math.round(ty * OSM_TILE_SIZE - originY),
      });
    }
  }
  return { originX, originY, tiles };
}

export async function geocodeVietnamAddress(
  address?: string,
  wardName?: string,
  provinceName?: string
): Promise<{ lat: number; lng: number } | null> {
  const queries = [
    [address, wardName, provinceName, 'Việt Nam'].filter((s) => s && s.trim()).join(', '),
    [wardName, provinceName, 'Việt Nam'].filter((s) => s && s.trim()).join(', '),
  ].filter((q) => q.length > 0);

  for (const q of queries) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(q)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) continue;
    const rows = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (rows.length > 0) {
      const lat = roundCoord(parseFloat(rows[0].lat));
      const lng = roundCoord(parseFloat(rows[0].lon));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
    }
  }
  return null;
}
