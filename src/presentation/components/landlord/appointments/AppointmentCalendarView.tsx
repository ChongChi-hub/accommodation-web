'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { ViewingAppointmentItem } from '@/domain/entities/ViewingAppointment';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppointmentCalendarViewProps {
  appointments: ViewingAppointmentItem[];
  onOpenDetail: (id: string) => void;
}

export function AppointmentCalendarView({
  appointments,
  onOpenDetail,
}: AppointmentCalendarViewProps) {
  const t = useTranslations('landlord.appointments.calendar');
  const [baseDate, setBaseDate] = useState(() => new Date());

  // Generate 7 days starting from baseDate
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + idx);
    return d;
  });

  const nextWeek = () => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + 7);
    setBaseDate(d);
  };

  const prevWeek = () => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - 7);
    setBaseDate(d);
  };

  const resetToday = () => {
    setBaseDate(new Date());
  };

  const getVietnamDateKey = (dateInput: Date | string): string => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = getVietnamDateKey(date);
    return appointments.filter((a) => {
      try {
        const itemDateStr = getVietnamDateKey(a.scheduledStart);
        return itemDateStr === dateStr;
      } catch {
        return false;
      }
    });
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            {days[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            {' - '}
            {days[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={prevWeek} leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
            {t('prev')}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetToday}>
            {t('today')}
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
            {t('next')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dayItems = getAppointmentsForDay(day);
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <Card
              key={idx}
              className={`min-h-[220px] p-2 flex flex-col gap-2 ${
                isToday ? 'border-teal-600 bg-teal-50/20 dark:bg-teal-950/10' : 'bg-white dark:bg-stone-900'
              }`}
            >
              <div
                className={`p-1.5 text-center rounded border-b ${
                  isToday
                    ? 'bg-teal-700 text-white font-bold'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider">
                  {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                </div>
                <div className="text-xs font-semibold">
                  {day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>

              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-72">
                {dayItems.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] text-stone-400 italic py-6">
                    {t('noAppointments')}
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onOpenDetail(item.id)}
                      className="p-1.5 rounded bg-stone-50 dark:bg-stone-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-stone-200 dark:border-stone-700 cursor-pointer transition-all text-left space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-teal-800 dark:text-teal-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.scheduledStart)}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">
                        {item.roomTitle}
                      </p>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {item.contactName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
