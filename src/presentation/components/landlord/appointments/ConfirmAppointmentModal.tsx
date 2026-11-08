'use client';

import React, { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { AlertTriangle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ConfirmAppointmentModalProps {
  isOpen: boolean;
  appointment: ViewingAppointmentItem | null;
  conflictWarning: {
    id: string;
    roomTitle: string;
    start: string;
    end: string;
  } | null;
  onClose: () => void;
  onConfirm: (force: boolean, note?: string) => Promise<void>;
}

export function ConfirmAppointmentModal({
  isOpen,
  appointment,
  conflictWarning,
  onClose,
  onConfirm,
}: ConfirmAppointmentModalProps) {
  const t = useTranslations('landlord.appointments.modals.confirm');
  const [landlordNote, setLandlordNote] = useState('');
  const [force, setForce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (conflictWarning && !force) return;
    setIsSubmitting(true);
    try {
      await onConfirm(force, landlordNote || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4 pt-2" aria-labelledby="confirm-appointment-title">
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {t('message', {
            name: appointment.contactName,
            time: formatDateTime(appointment.scheduledStart),
          })}
        </p>

        {conflictWarning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t('conflictAlertTitle')}</span>
            </div>
            <p className="text-amber-700 dark:text-amber-400">
              {t('conflictAlertDesc', {
                roomTitle: conflictWarning.roomTitle || t('conflictOtherRoom'),
                time: formatDateTime(conflictWarning.start),
              })}
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer font-medium text-stone-800 dark:text-stone-200">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="w-4 h-4 text-teal-700 rounded border-stone-300 focus:ring-teal-700"
              />
              <span>{t('forceConfirmLabel')}</span>
            </label>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {t('noteLabel')}
          </label>
          <textarea
            value={landlordNote}
            onChange={(e) => setLandlordNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={2}
            className="w-full text-xs p-2.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            disabled={conflictWarning ? !force : false}
          >
            {t('submit')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
