'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Pagination } from '@/domain/repositories/LandlordRoomRepository';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Calendar, Phone, User, Clock, Check, X, FileText, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppointmentListViewProps {
  appointments: ViewingAppointmentItem[];
  pagination: Pagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onOpenDetail: (id: string) => void;
  onOpenConfirm: (item: ViewingAppointmentItem) => void;
  onOpenCancel: (item: ViewingAppointmentItem) => void;
  onOpenComplete: (item: ViewingAppointmentItem) => void;
}

export function AppointmentListView({
  appointments,
  pagination,
  isLoading,
  onPageChange,
  onOpenDetail,
  onOpenConfirm,
  onOpenCancel,
  onOpenComplete,
}: AppointmentListViewProps) {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('landlord.appointments');
  const now = new Date().toISOString();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-stone-100 dark:bg-stone-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <Calendar className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
        <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
          {t('empty.title')}
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          {t('empty.subtitle')}
        </p>
      </Card>
    );
  }

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('vi-VN', {
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
    <div className="space-y-4">
      <div className="space-y-3">
        {appointments.map((a) => {
          const isPastConfirmed = a.status === 'CONFIRMED' && a.scheduledStart <= now;

          return (
            <Card
              key={a.id}
              className="p-4 sm:p-5 hover:border-teal-700/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <AppointmentStatusBadge status={a.status} />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded">
                    <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    {formatDateTime(a.scheduledStart)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-400">{t('list.tenantPhone')}:</span>
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

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-8 space-y-1">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {a.roomTitle}
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    {a.roomAddress}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {a.contactName}
                    </span>
                    {a.tenantNote && (
                      <span className="italic line-clamp-1 text-stone-500">
                        {tAuto('k0522')}{a.tenantNote}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center justify-end gap-2 flex-wrap pt-2 md:pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenDetail(a.id)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    {t('actions.detail')}
                  </Button>

                  {a.status === 'PENDING' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenCancel(a)}
                        leftIcon={<X className="w-3.5 h-3.5" />}
                      >
                        {t('actions.decline')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onOpenConfirm(a)}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        {t('actions.confirm')}
                      </Button>
                    </>
                  )}

                  {isPastConfirmed && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenComplete(a)}
                      leftIcon={<FileText className="w-3.5 h-3.5" />}
                    >
                      {t('actions.updateOutcome')}
                    </Button>
                  )}

                  {a.status === 'CONFIRMED' && !isPastConfirmed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenCancel(a)}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      {t('actions.cancel')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs text-stone-600 dark:text-stone-400">
          <span>
            {t('pagination.showing', {
              from: pagination.page * pagination.size + 1,
              to: Math.min((pagination.page + 1) * pagination.size, pagination.totalElements),
              total: pagination.totalElements,
            })}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 0}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              {t('pagination.prev')}
            </Button>
            <span className="px-3 font-semibold text-stone-800 dark:text-stone-200">
              {pagination.page + 1} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages - 1}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
