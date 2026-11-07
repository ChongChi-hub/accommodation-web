'use client';

import React, { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentItem, CancelReasonCode } from '@/domain/entities/ViewingAppointment';
import { useTranslations } from 'next-intl';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  appointment: ViewingAppointmentItem | null;
  onClose: () => void;
  onCancel: (reasonCode: CancelReasonCode, reasonNote?: string) => Promise<void>;
}

export function CancelAppointmentModal({
  isOpen,
  appointment,
  onClose,
  onCancel,
}: CancelAppointmentModalProps) {
  const t = useTranslations('landlord.appointments.modals.cancel');
  const [reasonCode, setReasonCode] = useState<CancelReasonCode>('BUSY');
  const [reasonNote, setReasonNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const reasons: Array<{ code: CancelReasonCode; label: string }> = [
    { code: 'BUSY', label: t('reasons.busy') },
    { code: 'ROOM_TAKEN', label: t('reasons.roomTaken') },
    { code: 'TENANT_NOT_ELIGIBLE', label: t('reasons.notEligible') },
    { code: 'TIME_CONFLICT', label: t('reasons.timeConflict') },
    { code: 'OTHER', label: t('reasons.other') },
  ];

  const isOther = reasonCode === 'OTHER';
  const isValid = !isOther || reasonNote.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onCancel(reasonCode, reasonNote || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDecline = appointment.status === 'PENDING';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isDecline ? t('titleDecline') : t('titleCancel')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {t('subtitle')}
        </p>

        <div className="space-y-2">
          {reasons.map((r) => (
            <label
              key={r.code}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                reasonCode === r.code
                  ? 'border-teal-700 bg-teal-50/50 dark:bg-teal-950/20 font-semibold text-teal-900 dark:text-teal-200'
                  : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <input
                type="radio"
                name="cancelReason"
                value={r.code}
                checked={reasonCode === r.code}
                onChange={() => setReasonCode(r.code)}
                className="w-4 h-4 text-teal-700 border-stone-300 focus:ring-teal-700"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
            <span>{t('noteLabel')}</span>
            {isOther && (
              <span className={`text-[10px] ${reasonNote.trim().length >= 10 ? 'text-teal-600' : 'text-rose-500'}`}>
                {reasonNote.trim().length} / 10 {t('minChars')}
              </span>
            )}
          </div>
          <textarea
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder={isOther ? t('notePlaceholderOther') : t('notePlaceholder')}
            rows={2}
            className="w-full text-xs p-2.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="submit"
            isLoading={isSubmitting}
            disabled={!isValid}
          >
            {isDecline ? t('submitDecline') : t('submitCancel')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
