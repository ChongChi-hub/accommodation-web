'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/presentation/components/ui/Badge';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface Props {
  status: string;
  hiddenBy?: string | null;
  hiddenReason?: string | null;
  rejectedReason?: string | null;
}

export function LandlordRoomStatusBadge({ status, hiddenBy, hiddenReason, rejectedReason }: Props) {
  const t = useTranslations('landlord.rooms.statusLabels');

  if (status === 'PUBLISHED') {
    return (
      <Badge variant="success" size="sm">
        {t('published')}
      </Badge>
    );
  }

  if (status === 'HIDDEN') {
    const isModHidden = hiddenBy === 'MODERATOR' || hiddenBy === 'ADMIN';
    return (
      <div className="inline-flex items-center gap-1.5" title={hiddenReason || undefined}>
        <Badge variant={isModHidden ? 'warning' : 'neutral'} size="sm">
          {isModHidden && <ShieldAlert className="w-3 h-3 mr-1 text-amber-600" />}
          {isModHidden ? t('hiddenMod') : t('hiddenOwner')}
        </Badge>
      </div>
    );
  }

  if (status === 'PENDING_REVIEW') {
    return (
      <Badge variant="info" size="sm">
        {t('pending')}
      </Badge>
    );
  }

  if (status === 'DRAFT') {
    return (
      <Badge variant="neutral" size="sm">
        {t('draft')}
      </Badge>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="inline-flex items-center gap-1.5" title={rejectedReason || undefined}>
        <Badge variant="danger" size="sm">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {t('rejected')}
        </Badge>
      </div>
    );
  }

  if (status === 'RENTED') {
    return (
      <Badge variant="secondary" size="sm">
        {t('rented')}
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" size="sm">
      {status}
    </Badge>
  );
}
