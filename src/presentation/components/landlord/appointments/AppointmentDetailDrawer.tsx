'use client';

import React, { useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentDetail, ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { X, Clock, Calendar, Phone, Mail, User, Building2, Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface AppointmentDetailDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  detail: ViewingAppointmentDetail | null;
  onClose: () => void;
  onOpenConfirm: (item: ViewingAppointmentItem) => void;
  onOpenCancel: (item: ViewingAppointmentItem) => void;
  onOpenComplete: (item: ViewingAppointmentItem) => void;
}

export function AppointmentDetailDrawer({
  isOpen,
  isLoading,
  detail,
  onClose,
  onOpenConfirm,
  onOpenCancel,
  onOpenComplete,
}: AppointmentDetailDrawerProps) {
  const t = useTranslations('landlord.appointments.detail');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const now = new Date().toISOString();
  const isPastConfirmed = detail?.status === 'CONFIRMED' && (detail?.scheduledStart || '') <= now;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-stone-800 animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{t('title')}</h3>
            {detail && <AppointmentStatusBadge status={detail.status} />}
          </div>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading || !detail ? (
            <div className="space-y-4">
              <div className="h-20 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
              <div className="h-32 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {detail.roomTitle}
                      </h4>
                      <p className="text-xs text-stone-500">{detail.roomAddress}</p>
                    </div>
                  </div>
                  <Link href={`/rooms/${detail.roomId}`} target="_blank" className="text-teal-700 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                  {t('timeSection')}
                </span>
                <div className="flex items-center gap-2 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-md border border-stone-100 dark:border-stone-800 text-xs">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {formatDateTime(detail.scheduledStart)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                  {t('tenantSection')}
                </span>
                <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-md border border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                    <User className="w-4 h-4 text-stone-400" />
                    <span className="font-semibold">{detail.contactName}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-400" />
                      {detail.status === 'CONFIRMED' || detail.status === 'COMPLETED' ? (
                        <a href={`tel:${detail.contactPhone}`} className="text-teal-700 font-bold hover:underline">
                          {detail.contactPhone}
                        </a>
                      ) : (
                        <span>{detail.contactPhone}</span>
                      )}
                    </div>
                    {detail.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCopyPhone(detail.contactPhone)}
                        className="text-stone-400 hover:text-stone-700 p-1 rounded"
                        title={t('copyPhone')}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  {detail.contactEmail && (
                    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                      <Mail className="w-4 h-4 text-stone-400" />
                      <span>{detail.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {detail.tenantNote && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                    {t('tenantNote')}
                  </span>
                  <p className="text-xs p-3 bg-stone-50 dark:bg-stone-800/40 rounded border italic text-stone-700 dark:text-stone-300">
                    &ldquo;{detail.tenantNote}&rdquo;
                  </p>
                </div>
              )}

              {detail.cancelReasonCode && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded text-xs space-y-1">
                  <span className="font-bold text-rose-700 dark:text-rose-400">{t('cancelReason')}:</span>
                  <p className="text-stone-700 dark:text-stone-300">
                    {detail.cancelReasonCode} {detail.cancelReasonNote ? `- ${detail.cancelReasonNote}` : ''}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                  {t('timeline')}
                </span>
                <div className="space-y-3 pl-3 border-l-2 border-stone-200 dark:border-stone-700 ml-2">
                  {detail.history?.map((h) => (
                    <div key={h.id} className="relative pl-3 text-xs space-y-0.5">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-white dark:ring-stone-900" />
                      <div className="flex items-center justify-between text-stone-500 text-[10px]">
                        <span>{h.actorRole} ({h.actorId})</span>
                        <span>{formatDateTime(h.createdAt)}</span>
                      </div>
                      <div className="font-semibold text-stone-800 dark:text-stone-200">
                        {h.fromStatus ? `${h.fromStatus} -> ` : ''} {h.toStatus}
                      </div>
                      {h.reason && <p className="text-stone-600 dark:text-stone-400 italic">&ldquo;{h.reason}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {detail && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80 flex items-center justify-end gap-2">
            {detail.status === 'PENDING' && (
              <>
                <Button variant="outline" size="sm" onClick={() => onOpenCancel(detail)}>
                  {t('actions.decline')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => onOpenConfirm(detail)}>
                  {t('actions.confirm')}
                </Button>
              </>
            )}
            {isPastConfirmed && (
              <Button variant="primary" size="sm" onClick={() => onOpenComplete(detail)}>
                {t('actions.updateOutcome')}
              </Button>
            )}
            {detail.status === 'CONFIRMED' && !isPastConfirmed && (
              <Button variant="outline" size="sm" onClick={() => onOpenCancel(detail)}>
                {t('actions.cancel')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
