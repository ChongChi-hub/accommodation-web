import { describe, it, expect } from 'vitest';
import { parseCccdQr, formatCccdDate } from './cccd-qr-parser';

describe('cccd-qr-parser', () => {
  describe('formatCccdDate', () => {
    it('formats ddMMyyyy to YYYY-MM-DD correctly', () => {
      expect(formatCccdDate('21112002')).toBe('2002-11-21');
      expect(formatCccdDate('05011995')).toBe('1995-01-05');
      expect(formatCccdDate('31122020')).toBe('2020-12-31');
    });

    it('returns empty string on invalid dates', () => {
      expect(formatCccdDate('')).toBe('');
      expect(formatCccdDate('123')).toBe('');
      expect(formatCccdDate('32112002')).toBe(''); // day > 31
      expect(formatCccdDate('21132002')).toBe(''); // month > 12
    });
  });

  describe('parseCccdQr', () => {
    it('parses standard 7-field Vietnam CCCD QR string without old ID', () => {
      const raw = '070206002098||ĐÀO TRỌNG TRÍ|21112002|Nam|Xã ABC, Huyện XYZ, Tỉnh DEF|20052021';
      const parsed = parseCccdQr(raw);

      expect(parsed).not.toBeNull();
      expect(parsed?.idNumber).toBe('070206002098');
      expect(parsed?.oldIdNumber).toBeUndefined();
      expect(parsed?.fullName).toBe('ĐÀO TRỌNG TRÍ');
      expect(parsed?.dateOfBirth).toBe('2002-11-21');
      expect(parsed?.gender).toBe('Nam');
      expect(parsed?.address).toBe('Xã ABC, Huyện XYZ, Tỉnh DEF');
      expect(parsed?.issueDate).toBe('2021-05-20');
      expect(parsed?.issuePlace).toBe('Cục Cảnh sát QLHC về TTXH');
    });

    it('parses standard 7-field Vietnam CCCD QR string with old 9-digit ID', () => {
      const raw = '001099012345|013579246|NGUYỄN VĂN AN|15081999|Nam|Số 10 Láng Hạ, Hà Nội|25042021';
      const parsed = parseCccdQr(raw);

      expect(parsed).not.toBeNull();
      expect(parsed?.idNumber).toBe('001099012345');
      expect(parsed?.oldIdNumber).toBe('013579246');
      expect(parsed?.fullName).toBe('NGUYỄN VĂN AN');
      expect(parsed?.dateOfBirth).toBe('1999-08-15');
      expect(parsed?.gender).toBe('Nam');
      expect(parsed?.issueDate).toBe('2021-04-25');
    });

    it('parses 6-field Vietnam CCCD QR variant', () => {
      const raw = '038198000123|TRẦN THỊ MAI|01011998|Nữ|Số 1 Đại lộ Lê Lợi, Thanh Hóa|15062022';
      const parsed = parseCccdQr(raw);

      expect(parsed).not.toBeNull();
      expect(parsed?.idNumber).toBe('038198000123');
      expect(parsed?.fullName).toBe('TRẦN THỊ MAI');
      expect(parsed?.dateOfBirth).toBe('1998-01-01');
      expect(parsed?.gender).toBe('Nữ');
      expect(parsed?.issueDate).toBe('2022-06-15');
    });

    it('returns null on invalid string or non-12-digit ID', () => {
      expect(parseCccdQr('')).toBeNull();
      expect(parseCccdQr('invalid string')).toBeNull();
      expect(parseCccdQr('123|abc|def')).toBeNull();
      expect(parseCccdQr('123456789||NGUYEN VAN A|01011990|Nam|Ha Noi|01012020')).toBeNull(); // 9-digit in place 0
    });
  });
});

