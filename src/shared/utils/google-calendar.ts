export interface GoogleCalendarEventInput {
  title: string;
  startIso: string;
  endIso?: string | null;
  location?: string | null;
  details?: string | null;
}

export function formatGoogleCalendarUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildGoogleCalendarUrl(event: GoogleCalendarEventInput): string {
  const start = formatGoogleCalendarUtc(event.startIso);
  const fallbackEnd = new Date(new Date(event.startIso).getTime() + 45 * 60 * 1000).toISOString();
  const end = formatGoogleCalendarUtc(event.endIso || fallbackEnd);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  });

  if (event.location && event.location.trim()) {
    params.set('location', event.location.trim());
  }

  if (event.details && event.details.trim()) {
    params.set('details', event.details.trim());
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildAppointmentCalendarDetails(appointment: {
  contactName: string;
  contactPhone?: string | null;
  roomId: string;
  roomTitle?: string | null;
  roomAddress: string;
  scheduledStart: string;
  scheduledEnd?: string | null;
  tenantNote?: string | null;
}): GoogleCalendarEventInput {
  const title = `Lịch hẹn xem phòng: ${appointment.roomTitle || `Phòng #${appointment.roomId}`}`;
  const details = [
    `Khách hẹn: ${appointment.contactName}${appointment.contactPhone ? ` (${appointment.contactPhone})` : ''}`,
    `Mã phòng: ${appointment.roomId}`,
    appointment.roomTitle ? `Tên phòng: ${appointment.roomTitle}` : '',
    `Địa điểm hẹn: ${appointment.roomAddress}`,
    appointment.tenantNote ? `Ghi chú: ${appointment.tenantNote}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title,
    startIso: appointment.scheduledStart,
    endIso: appointment.scheduledEnd,
    location: appointment.roomAddress,
    details,
  };
}
