import { describe, it, expect } from 'vitest';
import { KNOWN_ROOM_TYPE_CODES, getRoomTypeKey, formatRoomType } from './room-type';
import vi from '@/i18n/messages/vi.json';
import en from '@/i18n/messages/en.json';

describe('Room Type i18n Mapping (UI-FIX-3)', () => {
  it('should map all known enum codes to valid non-empty Vietnamese translations', () => {
    const viRoomTypes = (vi as any).roomTypes || {};
    expect(viRoomTypes).toBeDefined();

    for (const code of KNOWN_ROOM_TYPE_CODES) {
      const key = getRoomTypeKey(code);
      const translated = viRoomTypes[key];
      expect(translated, `Missing vi.json key for enum: ${code}`).toBeDefined();
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
      expect(translated).not.toEqual(code); // Must not be the raw enum code
    }
  });

  it('should map all known enum codes to valid non-empty English translations', () => {
    const enRoomTypes = (en as any).roomTypes || {};
    expect(enRoomTypes).toBeDefined();

    for (const code of KNOWN_ROOM_TYPE_CODES) {
      const key = getRoomTypeKey(code);
      const translated = enRoomTypes[key];
      expect(translated, `Missing en.json key for enum: ${code}`).toBeDefined();
      expect(typeof translated).toBe('string');
      expect(translated.length).toBeGreaterThan(0);
      expect(translated).not.toEqual(code);
    }
  });

  it('should fallback to UNKNOWN for unrecognized enum codes without throwing', () => {
    expect(getRoomTypeKey('INVALID_CODE_XYZ')).toBe('UNKNOWN');
    expect(getRoomTypeKey('')).toBe('UNKNOWN');
    expect(getRoomTypeKey(null)).toBe('UNKNOWN');

    const mockT = (k: string) => ((vi as any).roomTypes?.[k.replace('roomTypes.', '')] || 'Phòng trọ');
    expect(formatRoomType('MINI_APARTMENT', mockT)).toBe('Chung cư mini');
    expect(formatRoomType('INVALID_CODE', mockT)).toBe('Phòng trọ');
  });
});
