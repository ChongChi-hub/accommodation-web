import { describe, expect, it } from 'vitest';
import {
  buildAddressQueries,
  computeVisibleTiles,
  getProvinceDefaultCenter,
  latLngToWorldPixel,
  worldPixelToLatLng,
} from './osm-tile-math';

describe('osm-tile-math', () => {
  it('round-trips Hanoi coordinates accurately at zoom 16', () => {
    const lat = 21.028511;
    const lng = 105.854167;
    const px = latLngToWorldPixel(lat, lng, 16);
    const back = worldPixelToLatLng(px.x, px.y, 16);
    expect(Math.abs(back.lat - lat)).toBeLessThan(0.00001);
    expect(Math.abs(back.lng - lng)).toBeLessThan(0.00001);
  });

  it('resolves province centers from accented Vietnamese names', () => {
    const hcm = getProvinceDefaultCenter('Thành phố Hồ Chí Minh');
    expect(hcm.lat).toBeCloseTo(10.776889, 3);
    expect(hcm.lng).toBeCloseTo(106.700806, 3);

    const dn = getProvinceDefaultCenter('Đà Nẵng');
    expect(dn.lat).toBeCloseTo(16.054407, 3);
  });

  it('builds deduplicated cascading queries for 2-level Vietnamese addresses', () => {
    const queries = buildAddressQueries('47/11, Trương Văn Hải, Tăng Nhơn Phú B, Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh');
    expect(queries[0]).toEqual({
      query: '47/11, Trương Văn Hải, Tăng Nhơn Phú B, Thủ Đức, Hồ Chí Minh, Việt Nam',
      zoom: 17,
    });
    expect(queries[1]).toEqual({
      query: 'Trương Văn Hải, Tăng Nhơn Phú B, Thủ Đức, Hồ Chí Minh, Việt Nam',
      zoom: 16,
    });
    expect(queries.some((q) => q.query === 'Thủ Đức, Hồ Chí Minh, Việt Nam' && q.zoom === 15)).toBe(true);
    expect(queries.some((q) => q.query === 'Hồ Chí Minh, Việt Nam' && q.zoom === 13)).toBe(true);
  });

  it('uses keyless OpenStreetMap tiles without cartocdn API-key endpoints', () => {
    const { tiles } = computeVisibleTiles({ lat: 21.028511, lng: 105.854167 }, 16, { width: 512, height: 320 });
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) {
      expect(tile.url).toMatch(/^https:\/\/tile\.openstreetmap\.de\/16\/\d+\/\d+\.png$/);
      expect(tile.fallbackUrl).toMatch(/^https:\/\/tile\.openstreetmap\.org\/16\/\d+\/\d+\.png$/);
      expect(tile.url).not.toContain('cartocdn');
      expect(tile.fallbackUrl).not.toContain('cartocdn');
    }
  });
});

