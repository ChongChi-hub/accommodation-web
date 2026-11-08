'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReasonCode('BUSY');
      setReasonNote('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const reasons: Array<{ code: CancelReasonCode; label: string }> = [
    { code: 'BUSY', label: t('reasons.busy') },
    { code: 'ROOM_TAKEN', label: t('reasons.roomTaken') },
    { code: 'TENANT_NOT_ELIGIBLE', label: t('reasons.notEligible') },
    { code: 'TIME_CONFLICT', label: t('reasons.timeConflict') },
    { code: 'OTHER', label: t('reasons.other') },
  ];

  const noteLength = reasonNote.trim().length;
  const isOther = reasonCode === 'OTHER';
  const isValid = (!isOther || noteLength >= 10) && noteLength <= 500;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCancel(reasonCode, reasonNote || undefined);
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

  const isDecline = appointment.status === 'PENDING';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isDecline ? t('titleDecline') : t('titleCancel')}
      size="md"
    >
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-4 pt-2"
        aria-labelledby="cancel-appointment-modal-title"
      >
        <p id="cancel-appointment-modal-title" className="text-xs text-stone-600 dark:text-stone-300">
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
            <span
              className={`text-[10px] ${
                noteLength > 500
                  ? 'text-rose-500 font-bold'
                  : isOther && noteLength < 10
                  ? 'text-rose-500'
                  : 'text-stone-400'
              }`}
            >
              {noteLength}/500 {isOther && noteLength < 10 && `(tối thiểu 10)`}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder={isOther ? t('notePlaceholderOther') : t('notePlaceholder')}
            rows={3}
            maxLength={500}
            className="w-full text-xs p-2.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
          <div className="text-[10px] text-stone-400 dark:text-stone-500 text-right">
            Esc để đóng, Ctrl + Enter để gửi
          </div>
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
