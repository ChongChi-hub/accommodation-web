import { describe, expect, it } from 'vitest';
import {
  getProvinceAliases,
  matchesSearchQuery,
  normalizeVietnamese,
} from './search-normalization';

describe('search-normalization', () => {
  it('normalizes Vietnamese diacritics and symbols cleanly', () => {
    expect(normalizeVietnamese('Hà Nội')).toBe('ha noi');
    expect(normalizeVietnamese('TP. Hồ Chí Minh')).toBe('tp. ho chi minh');
    expect(normalizeVietnamese('Đà Nẵng')).toBe('da nang');
    expect(normalizeVietnamese('Thừa Thiên Huế')).toBe('thua thien hue');
  });

  it('matches unaccented query against accented target', () => {
    expect(matchesSearchQuery('Hà Nội', 'ha noi')).toBe(true);
    expect(matchesSearchQuery('Quận Cầu Giấy', 'cau giay')).toBe(true);
    expect(matchesSearchQuery('Đà Nẵng', 'da nang')).toBe(true);
    expect(matchesSearchQuery('Hà Nội', 'sai gon')).toBe(false);
  });

  it('matches aliases such as sai gon and hcm for Ho Chi Minh', () => {
    const hcmAliases = getProvinceAliases('HCM');
    expect(matchesSearchQuery('Hồ Chí Minh', 'sai gon', hcmAliases)).toBe(true);
    expect(matchesSearchQuery('Hồ Chí Minh', 'hcm', hcmAliases)).toBe(true);
    expect(matchesSearchQuery('Hồ Chí Minh', 'tphcm', hcmAliases)).toBe(true);
  });

  it('matches aliases such as hue for Thua Thien Hue', () => {
    const hueAliases = getProvinceAliases('Thừa Thiên Huế');
    expect(matchesSearchQuery('Thừa Thiên Huế', 'hue', hueAliases)).toBe(true);
  });
});
