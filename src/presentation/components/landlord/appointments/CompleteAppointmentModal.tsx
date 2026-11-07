'use client';

import React, { useState } from 'react';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { CheckCircle2, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  appointment: ViewingAppointmentItem | null;
  onClose: () => void;
  onComplete: (outcome: 'COMPLETED' | 'NO_SHOW', note?: string) => Promise<void>;
}

export function CompleteAppointmentModal({
  isOpen,
  appointment,
  onClose,
  onComplete,
}: CompleteAppointmentModalProps) {
  const t = useTranslations('landlord.appointments.modals.complete');
  const [outcome, setOutcome] = useState<'COMPLETED' | 'NO_SHOW'>('COMPLETED');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onComplete(outcome, note || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <p className="text-xs text-stone-600 dark:text-stone-300">
          {t('subtitle')}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setOutcome('COMPLETED')}
            className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
              outcome === 'COMPLETED'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-600/20'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <div className="text-xs font-semibold">{t('completed')}</div>
          </div>

          <div
            onClick={() => setOutcome('NO_SHOW')}
            className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
              outcome === 'NO_SHOW'
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 font-bold ring-2 ring-rose-600/20'
                : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <UserX className="w-5 h-5 mx-auto mb-1 text-rose-600" />
            <div className="text-xs font-semibold">{t('noShow')}</div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {t('noteLabel')}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={2}
            className="w-full text-xs p-2.5 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {t('submit')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
