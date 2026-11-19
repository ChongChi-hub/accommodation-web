import { describe, expect, it } from 'vitest';
import {
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
});

