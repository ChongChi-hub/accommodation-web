'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { AppointmentStatusBadge } from '@/presentation/components/landlord/appointments/AppointmentStatusBadge';
import { downloadAppointmentIcs } from '@/shared/utils/appointment-ics';
import { Calendar, Phone, Clock, MapPin, Plus, Download, XCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function TenantAppointmentsPage() {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('tenant.appointments');
  const tLedger = useTranslations('sprint3.ledger');
  const tc = useTranslations('sprint3.common');
  const [appointments, setAppointments] = useState<ViewingAppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const res = await container.appointment.appointmentRepository.getTenantAppointments(0, 50);
      setAppointments(res.data);
    } catch {
      if (!isBackground) toast.error('Không thể tải danh sách lịch hẹn của bạn');
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(false);

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchAppointments(true);
      }
    }, 5000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchAppointments(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchAppointments]);

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

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t('title')} ({appointments.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('subtitle')}
          </p>
        </div>
        <Link href="/rooms">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            {t('bookNew')}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Calendar className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
            {t('empty.title')}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {t('empty.subtitle')}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <AppointmentStatusBadge status={a.status} />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    {formatDateTime(a.scheduledStart)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-400">{t('landlordPhone')}:</span>
                  {a.status === 'CONFIRMED' || a.status === 'COMPLETED' ? (
                    <a
                      href={`tel:${a.contactPhone}`}
                      className="font-semibold text-teal-800 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {a.contactPhone}
                    </a>
                  ) : (
                    <span className="font-semibold text-stone-600 dark:text-stone-300">
                      {a.contactPhone}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {a.roomTitle}
                </h4>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{a.roomAddress}</span>
                </p>
              </div>

              {a.tenantNote && (
                <p className="text-xs text-stone-600 dark:text-stone-400 italic bg-stone-50 dark:bg-stone-800/40 p-2 rounded">
                  {t('myNote')}{tAuto('k0266')}{a.tenantNote}&rdquo;
                </p>
              )}

              {a.cancelReasonCode && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded text-xs space-y-0.5">
                  <span className="font-bold text-rose-700 dark:text-rose-400">{t('cancelReason')}:</span>
                  <p className="text-stone-700 dark:text-stone-300">
                    {a.cancelReasonCode} {a.cancelReasonNote ? `- ${a.cancelReasonNote}` : ''}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() =>
                    downloadAppointmentIcs({
                      id: a.id,
                      title: `CozyNest: ${a.roomTitle}`,
                      description: a.tenantNote || a.landlordNote,
                      location: a.roomAddress,
                      startIso: a.scheduledStart,
                      endIso: a.scheduledEnd,
                    })
                  }
                >
                  {tLedger('downloadIcs')}
                </Button>
                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    onClick={async () => {
                      try {
                        await container.appointment.appointmentRepository.cancelTenantAppointment(a.id, {
                          reasonCode: 'BUSY',
                          version: a.version,
                        });
                        toast.success(tc('actionSuccess'));
                        fetchAppointments(true);
                      } catch (err: unknown) {
                        toast.error(err instanceof Error ? err.message : tc('actionError'));
                      }
                    }}
                  >
                    {tc('cancel')}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
