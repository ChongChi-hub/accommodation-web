'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Building2, ChevronDown, ChevronUp, Clock, User, Check, X, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppointmentByRoomViewProps {
  appointments: ViewingAppointmentItem[];
  onOpenDetail: (id: string) => void;
  onOpenConfirm: (item: ViewingAppointmentItem) => void;
  onOpenCancel: (item: ViewingAppointmentItem) => void;
  onOpenComplete: (item: ViewingAppointmentItem) => void;
}

export function AppointmentByRoomView({
  appointments,
  onOpenDetail,
  onOpenConfirm,
  onOpenCancel,
  onOpenComplete,
}: AppointmentByRoomViewProps) {
  const t = useTranslations('landlord.appointments');
  const now = new Date().toISOString();

  // Group appointments by roomId
  const grouped = appointments.reduce((acc, appt) => {
    if (!acc[appt.roomId]) {
      acc[appt.roomId] = {
        roomId: appt.roomId,
        roomTitle: appt.roomTitle,
        roomAddress: appt.roomAddress,
        items: [],
      };
    }
    acc[appt.roomId].items.push(appt);
    return acc;
  }, {} as Record<string, { roomId: string; roomTitle: string; roomAddress: string; items: ViewingAppointmentItem[] }>);

  const groups = Object.values(grouped);
  const [collapsedRooms, setCollapsedRooms] = useState<Record<string, boolean>>({});

  const toggleRoom = (roomId: string) => {
    setCollapsedRooms((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
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

  if (groups.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <Building2 className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
        <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
          {t('empty.title')}
        </h3>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isCollapsed = !!collapsedRooms[group.roomId];
        const pendingCount = group.items.filter((i) => i.status === 'PENDING').length;

        return (
          <Card key={group.roomId} className="overflow-hidden border transition-all">
            <div
              onClick={() => toggleRoom(group.roomId)}
              className="p-4 bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 border-b border-stone-100 dark:border-stone-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {group.roomTitle}
                  </h4>
                  <p className="text-xs text-stone-500">{group.roomAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <Badge variant="warning">
                    {pendingCount} {t('byRoom.pending')}
                  </Badge>
                )}
                <Badge variant="neutral">
                  {group.items.length} {t('byRoom.total')}
                </Badge>
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {group.items.map((item) => {
                  const isPastConfirmed = item.status === 'CONFIRMED' && item.scheduledStart <= now;

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AppointmentStatusBadge status={item.status} />
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                            {formatDateTime(item.scheduledStart)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2 pt-0.5">
                          <span className="font-semibold flex items-center gap-1">
                            <User className="w-3 h-3 text-stone-400" /> {item.contactName}
                          </span>
                          <span>•</span>
                          <span>{item.contactPhone}</span>
                        </p>
                        {item.tenantNote && (
                          <p className="text-xs text-stone-500 italic">
                            &ldquo;{item.tenantNote}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenDetail(item.id)}
                        >
                          {t('actions.detail')}
                        </Button>

                        {item.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenCancel(item)}
                              leftIcon={<X className="w-3.5 h-3.5" />}
                            >
                              {t('actions.decline')}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onOpenConfirm(item)}
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
                            onClick={() => onOpenComplete(item)}
                            leftIcon={<FileText className="w-3.5 h-3.5" />}
                          >
                            {t('actions.updateOutcome')}
                          </Button>
                        )}

                        {item.status === 'CONFIRMED' && !isPastConfirmed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenCancel(item)}
                            leftIcon={<X className="w-3.5 h-3.5" />}
                          >
                            {t('actions.cancel')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
