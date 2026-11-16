import { describe, it, expect } from 'vitest';
import {
  formatGoogleCalendarUtc,
  buildGoogleCalendarUrl,
  buildAppointmentCalendarDetails,
} from './google-calendar';

describe('google-calendar utils', () => {
  it('formats UTC ISO timestamp to basic YYYYMMDDTHHmmssZ format', () => {
    const iso = '2026-11-20T08:30:00.000Z';
    const formatted = formatGoogleCalendarUtc(iso);
    expect(formatted).toBe('20261120T083000Z');
  });

  it('builds valid Google Calendar URL with all query parameters', () => {
    const url = buildGoogleCalendarUrl({
      title: 'Lịch hẹn xem phòng: Phòng trọ Duy Tân',
      startIso: '2026-11-20T08:00:00.000Z',
      endIso: '2026-11-20T08:45:00.000Z',
      location: 'Số 10 Duy Tân, Cầu Giấy, Hà Nội',
      details: 'Khách hẹn: Nguyễn Văn Thuê\nMã phòng: 101',
    });

    expect(url).toContain('https://calendar.google.com/calendar/render?');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('text=L%E1%BB%8Bch+h%E1%BA%B9n+xem+ph%C3%B2ng%3A+Ph%C3%B2ng+tr%E1%BB%8D+Duy+T%C3%A2n');
    expect(url).toContain('dates=20261120T080000Z%2F20261120T084500Z');
    expect(url).toContain('location=S%E1%BB%91+10+Duy+T%C3%A2n%2C+C%E1%BA%A7u+Gi%E1%BA%A5y%2C+H%C3%A0+N%E1%BB%99i');
  });

  it('builds appointment calendar details correctly including tenant note and contact info', () => {
    const input = {
      contactName: 'Nguyễn Văn Thuê',
      contactPhone: '0901000001',
      roomId: 'room-101',
      roomTitle: 'Phòng trọ ban công thoáng mát',
      roomAddress: '15 Trần Thái Tông, Cầu Giấy, Hà Nội',
      scheduledStart: '2026-11-22T09:00:00.000Z',
      scheduledEnd: '2026-11-22T09:45:00.000Z',
      tenantNote: 'Tôi có thể đến sớm hơn 10 phút được không?',
    };

    const details = buildAppointmentCalendarDetails(input);
    expect(details.title).toBe('Lịch hẹn xem phòng: Phòng trọ ban công thoáng mát');
    expect(details.location).toBe('15 Trần Thái Tông, Cầu Giấy, Hà Nội');
    expect(details.details).toContain('Khách hẹn: Nguyễn Văn Thuê (0901000001)');
    expect(details.details).toContain('Mã phòng: room-101');
    expect(details.details).toContain('Ghi chú: Tôi có thể đến sớm hơn 10 phút được không?');
  });
});
