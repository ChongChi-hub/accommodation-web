'use client';

import React from 'react';
import { Badge } from '@/presentation/components/ui/Badge';
import { AppointmentStatus } from '@/domain/entities/ViewingAppointment';
import { useTranslations } from 'next-intl';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const t = useTranslations('landlord.appointments.status');

  switch (status) {
    case 'PENDING':
      return <Badge variant="warning">{t('pending')}</Badge>;
    case 'CONFIRMED':
      return <Badge variant="success">{t('confirmed')}</Badge>;
    case 'DECLINED':
      return <Badge variant="neutral">{t('declined')}</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">{t('cancelled')}</Badge>;
    case 'COMPLETED':
      return <Badge variant="info">{t('completed')}</Badge>;
    case 'NO_SHOW':
      return <Badge variant="neutral">{t('noShow')}</Badge>;
    case 'EXPIRED':
      return <Badge variant="neutral">{t('expired')}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
