export interface CalendarEventInput {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startIso: string;
  endIso?: string | null;
}

function formatIcsUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeIcsText(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildAppointmentIcs(event: CalendarEventInput): string {
  const start = formatIcsUtc(event.startIso);
  const fallbackEnd = new Date(new Date(event.startIso).getTime() + 45 * 60 * 1000).toISOString();
  const end = formatIcsUtc(event.endIso || fallbackEnd);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CozyNest//AppointmentCalendar//VN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(event.id)}@cozynest.vn`,
    `DTSTAMP:${formatIcsUtc(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : '',
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function downloadAppointmentIcs(event: CalendarEventInput): void {
  const content = buildAppointmentIcs(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cozynest-appointment-${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

