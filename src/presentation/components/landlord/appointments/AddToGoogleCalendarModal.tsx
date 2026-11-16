'use client';

import React from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { Calendar, CalendarPlus, Clock, MapPin, User, FileText, Phone, Hash } from 'lucide-react';
import { buildGoogleCalendarUrl, buildAppointmentCalendarDetails } from '@/shared/utils/google-calendar';
import { toast } from '@/presentation/stores/toast.store';
import { useTranslations } from 'next-intl';

interface AddToGoogleCalendarModalProps {
  isOpen: boolean;
  appointment: ViewingAppointmentItem | null;
  onClose: () => void;
}

export function AddToGoogleCalendarModal({
  isOpen,
  appointment,
  onClose,
}: AddToGoogleCalendarModalProps) {
  const t = useTranslations('landlord.appointments.modals.googleCalendar');

  if (!isOpen || !appointment) return null;

  const formatTimeRange = (startIso: string, endIso?: string | null) => {
    try {
      const start = new Date(startIso);
      const end = endIso ? new Date(endIso) : new Date(start.getTime() + 45 * 60 * 1000);
      const timeStr = `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      const dateStr = start.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return `${timeStr}, ${dateStr}`;
    } catch {
      return startIso;
    }
  };

  const handleAddToCalendar = () => {
    const calendarInput = buildAppointmentCalendarDetails({
      contactName: appointment.contactName,
      contactPhone: appointment.contactPhone,
      roomId: appointment.roomId,
      roomTitle: appointment.roomTitle,
      roomAddress: appointment.roomAddress,
      scheduledStart: appointment.scheduledStart,
      scheduledEnd: appointment.scheduledEnd,
      tenantNote: appointment.tenantNote,
    });

    const url = buildGoogleCalendarUrl(calendarInput);
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(t('openedSuccess'));
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <div className="space-y-4 pt-1" aria-labelledby="google-calendar-modal-title">
        <div className="flex items-start gap-3 bg-teal-50 dark:bg-teal-950/40 p-3.5 rounded-lg border border-teal-200 dark:border-teal-800">
          <CalendarPlus className="w-6 h-6 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-teal-950 dark:text-teal-200">
              {t('question')}
            </h4>
            <p className="text-xs text-teal-800 dark:text-teal-300">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="bg-stone-50 dark:bg-stone-800/60 rounded-lg p-3.5 border border-stone-200 dark:border-stone-700 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <User className="w-4 h-4 text-stone-500 shrink-0" />
            <span className="font-medium text-stone-500 min-w-20">{t('tenantName')}:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{appointment.contactName}</span>
            {appointment.contactPhone && (
              <span className="text-stone-500 flex items-center gap-1 ml-auto">
                <Phone className="w-3.5 h-3.5" />
                {appointment.contactPhone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Hash className="w-4 h-4 text-stone-500 shrink-0" />
            <span className="font-medium text-stone-500 min-w-20">{t('roomId')}:</span>
            <span className="font-medium text-stone-800 dark:text-stone-200">
              #{appointment.roomId} {appointment.roomTitle ? ` - ${appointment.roomTitle}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Clock className="w-4 h-4 text-stone-500 shrink-0" />
            <span className="font-medium text-stone-500 min-w-20">{t('appointmentTime')}:</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">
              {formatTimeRange(appointment.scheduledStart, appointment.scheduledEnd)}
            </span>
          </div>

          <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
            <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <span className="font-medium text-stone-500 min-w-20 shrink-0">{t('location')}:</span>
            <span className="text-stone-800 dark:text-stone-200">{appointment.roomAddress}</span>
          </div>

          {appointment.tenantNote && (
            <div className="flex items-start gap-2 pt-1 border-t border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
              <FileText className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <span className="font-medium text-stone-500 min-w-20 shrink-0">{t('tenantNote')}:</span>
              <span className="italic text-stone-600 dark:text-stone-300">{appointment.tenantNote}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {t('dismiss')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={handleAddToCalendar}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('addToCalendar')}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
