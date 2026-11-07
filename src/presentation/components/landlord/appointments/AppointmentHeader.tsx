'use client';

import React from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { AppointmentSummary, AppointmentStatus } from '@/domain/entities/ViewingAppointment';
import { Clock, CheckCircle2, AlertCircle, Calendar, CheckSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppointmentHeaderProps {
  summary: AppointmentSummary | null;
  currentStatus: AppointmentStatus | 'ALL';
  onStatusChange: (status: AppointmentStatus | 'ALL') => void;
}

export function AppointmentHeader({
  summary,
  currentStatus,
  onStatusChange,
}: AppointmentHeaderProps) {
  const t = useTranslations('landlord.appointments');

  const stats = [
    {
      key: 'PENDING',
      label: t('stats.pending'),
      count: summary?.totalPending ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900/50',
      statusTarget: 'PENDING' as const,
    },
    {
      key: 'CONFIRMED',
      label: t('stats.confirmed'),
      count: summary?.totalConfirmed ?? 0,
      icon: CheckCircle2,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      border: 'border-teal-200 dark:border-teal-900/50',
      statusTarget: 'CONFIRMED' as const,
    },
    {
      key: 'NEEDING_UPDATE',
      label: t('stats.needingUpdate'),
      count: summary?.totalNeedingOutcomeUpdate ?? 0,
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-900/50',
      statusTarget: 'CONFIRMED' as const,
    },
    {
      key: 'TODAY',
      label: t('stats.today'),
      count: summary?.todayCount ?? 0,
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      border: 'border-indigo-200 dark:border-indigo-900/50',
      statusTarget: 'ALL' as const,
    },
    {
      key: 'COMPLETED',
      label: t('stats.completed'),
      count: summary?.totalCompleted ?? 0,
      icon: CheckSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      statusTarget: 'COMPLETED' as const,
    },
  ];

  const tabs: Array<{ key: AppointmentStatus | 'ALL'; label: string; count?: number }> = [
    { key: 'ALL', label: t('tabs.all') },
    { key: 'PENDING', label: t('tabs.pending'), count: summary?.totalPending },
    { key: 'CONFIRMED', label: t('tabs.confirmed'), count: summary?.totalConfirmed },
    { key: 'COMPLETED', label: t('tabs.completed'), count: summary?.totalCompleted },
    { key: 'CANCELLED', label: t('tabs.cancelled'), count: summary?.totalCancelled },
    { key: 'EXPIRED', label: t('tabs.expired'), count: summary?.totalExpired },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t('title')}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.key}
              onClick={() => onStatusChange(s.statusTarget)}
              className={`p-4 border transition-all cursor-pointer hover:shadow-md ${s.border} ${s.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  {s.label}
                </span>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                {s.count}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 dark:border-stone-800">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
