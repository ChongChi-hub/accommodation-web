/**
 * Maps raw backend roomTypeCode to i18n key and provides safe fallback
 */

export const KNOWN_ROOM_TYPE_CODES = [
  'MINI_APARTMENT',
  'STUDIO',
  'HOMESTAY',
  'APARTMENT',
  'SINGLE',
  'FULL_HOUSE',
  'SHARED',
  'DORMITORY',
  'ROOM',
] as const;

export type RoomTypeCode = (typeof KNOWN_ROOM_TYPE_CODES)[number];

export function getRoomTypeKey(code?: string | null): string {
  if (!code) return 'UNKNOWN';
  const upper = code.trim().toUpperCase();
  if (KNOWN_ROOM_TYPE_CODES.includes(upper as RoomTypeCode)) {
    return upper;
  }
  return 'UNKNOWN';
}

export function formatRoomType(
  code: string | null | undefined,
  t: (key: string) => string
): string {
  const key = getRoomTypeKey(code);
  try {
    return t(`roomTypes.${key}`);
  } catch {
    return code || 'Phòng trọ';
  }
}
