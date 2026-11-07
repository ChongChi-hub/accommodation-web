'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { ViewMode } from '@/presentation/hooks/useLandlordAppointments';
import { Search, LayoutList, Building2, Calendar, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppointmentFiltersBarProps {
  search: string;
  roomId: string;
  viewMode: ViewMode;
  onSearchChange: (search: string) => void;
  onRoomChange: (roomId: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  roomOptions?: Array<{ id: string; title: string }>;
}

export function AppointmentFiltersBar({
  search,
  roomId,
  viewMode,
  onSearchChange,
  onRoomChange,
  onViewModeChange,
  onRefresh,
  roomOptions = [],
}: AppointmentFiltersBarProps) {
  const t = useTranslations('landlord.appointments.filters');
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            leftIcon={<Search className="w-4 h-4 text-stone-400" />}
          />
        </div>

        {roomOptions.length > 0 && (
          <select
            value={roomId}
            onChange={(e) => onRoomChange(e.target.value)}
            className="w-full sm:w-64 h-9 px-3 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700"
          >
            <option value="">{t('allRooms')}</option>
            {roomOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-stone-100 dark:border-stone-800">
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-md border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => onViewModeChange('list')}
            aria-label={t('viewList')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">{t('viewList')}</span>
          </button>
          <button
            onClick={() => onViewModeChange('by_room')}
            aria-label={t('viewByRoom')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewMode === 'by_room'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('viewByRoom')}</span>
          </button>
          <button
            onClick={() => onViewModeChange('calendar')}
            aria-label={t('viewCalendar')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-stone-700 text-teal-700 dark:text-teal-300 shadow-sm font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">{t('viewCalendar')}</span>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          aria-label={t('refresh')}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          <span className="hidden sm:inline">{t('refresh')}</span>
        </Button>
      </div>
    </div>
  );
}
