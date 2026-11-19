'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import { ContractCheckinInfo } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatVnd } from '@/shared/utils/format-vnd';
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  KeyRound,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface MyRoomHandoverCardProps {
  checkin: ContractCheckinInfo;
  roomTitle?: string;
  onDownloadPdf?: () => void;
  downloadingPdf?: boolean;
}

function buildMoveInIcs(checkin: ContractCheckinInfo, roomTitle?: string): string {
  const dateCompact = (checkin.startDate || '').replace(/-/g, '') || '20260101';
  const uid = `cozynest-movein-${checkin.contractId}@toam.vn`;
  const summary = `Nhan phong: ${roomTitle || `Phong #${checkin.roomId}`} (${checkin.orderCode || checkin.contractCode})`;
  const location = (checkin.fullAddress || checkin.areaHint || '').replace(/[\r\n,]/g, ' ');
  const desc = [
    `Ma don: ${checkin.orderCode || checkin.contractCode}`,
    checkin.checkinCode ? `Ma nhan phong: ${checkin.checkinCode}` : '',
    checkin.landlordName ? `Chu tro: ${checkin.landlordName}` : '',
    checkin.landlordPhone ? `SDT chu tro: ${checkin.landlordPhone}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CozyNest ToAm//Move-in Handover//VI',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${dateCompact}`,
    `DTEND;VALUE=DATE:${dateCompact}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function MyRoomHandoverCard({
  checkin,
  roomTitle,
  onDownloadPdf,
  downloadingPdf = false,
}: MyRoomHandoverCardProps) {
  const t = useTranslations('myRoomHandover');
  const [copiedKey, setCopiedKey] = useState<'order' | 'checkin' | null>(null);

  const handleCopy = async (value: string, kind: 'order' | 'checkin') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(kind);
      toast.success(t('copied'));
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error(t('copyFailed'));
    }
  };

  const handleDownloadIcs = () => {
    const ics = buildMoveInIcs(checkin, roomTitle);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhan-phong-${checkin.orderCode || checkin.contractCode}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!checkin.revealed) {
    return (
      <Card className="p-5 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{t('lockedTitle')}</span>
          </div>
          <Badge variant="warning" size="sm">
            {checkin.status === 'AWAITING_DEPOSIT' ? t('statusAwaitingDeposit') : checkin.status}
          </Badge>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          {t('lockedDesc')}
        </p>
        {checkin.areaHint && (
          <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              {t('areaOnlyLabel')}: <strong>{checkin.areaHint}</strong>
            </span>
          </p>
        )}
        {checkin.status === 'AWAITING_DEPOSIT' && (
          <div className="pt-1">
            <Link href={`/dashboard/tenant/deposits?contractId=${encodeURIComponent(checkin.contractId)}`}>
              <Button variant="primary" size="sm">
                {t('payDepositNow')} ({formatVnd(checkin.depositAmount)})
              </Button>
            </Link>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-5 border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-950/20 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">{t('revealedTitle')}</h2>
            <p className="text-[11px] text-stone-500">{t('revealedSubtitle')}</p>
          </div>
        </div>
        <Badge variant="success" size="sm">
          {t('statusActive')}
        </Badge>
      </div>

      {/* Order Code & Check-in Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checkin.orderCode && (
          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] text-stone-500">{t('orderCodeLabel')}</p>
              <p className="font-mono text-sm font-black text-teal-700 dark:text-teal-400 truncate" data-testid="my-room-order-code">
                {checkin.orderCode}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy(checkin.orderCode!, 'order')}
              leftIcon={copiedKey === 'order' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedKey === 'order' ? t('copiedBtn') : t('copyBtn')}
            </Button>
          </div>
        )}

        {checkin.checkinCode && (
          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> {t('checkinCodeLabel')}
              </p>
              <p className="font-mono text-sm font-black text-stone-900 dark:text-stone-100 tracking-widest">
                {checkin.checkinCode}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy(checkin.checkinCode!, 'checkin')}
              leftIcon={copiedKey === 'checkin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedKey === 'checkin' ? t('copiedBtn') : t('copyBtn')}
            </Button>
          </div>
        )}
      </div>

      {/* Full Address & Landlord Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-1">
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-teal-600" /> {t('fullAddressLabel')}
          </p>
          <p className="font-semibold text-stone-900 dark:text-stone-100" data-testid="my-room-full-address">
            {checkin.fullAddress || checkin.areaHint || t('contactLandlordFallback')}
          </p>
          <p className="text-[11px] text-stone-500">
            {t('moveInDateLabel')}: <strong>{formatIsoDate(checkin.startDate)}</strong>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-1">
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" /> {t('landlordContactLabel')}
          </p>
          <p className="font-semibold text-stone-900 dark:text-stone-100">
            {checkin.landlordName || t('landlordDefaultName')}
          </p>
          {checkin.landlordPhone && (
            <a
              href={`tel:${checkin.landlordPhone}`}
              className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-mono font-bold hover:underline"
            >
              <Phone className="w-3 h-3" /> {checkin.landlordPhone}
            </a>
          )}
        </div>
      </div>

      {/* Check-in Instructions */}
      {checkin.checkinInstructions && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 space-y-1.5">
          <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{t('instructionsTitle')}</p>
          <p className="text-xs text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed">
            {checkin.checkinInstructions}
          </p>
        </div>
      )}

      {/* Action Buttons: .ics calendar & PDF */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadIcs}
          leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
        >
          {t('addToCalendarBtn')}
        </Button>
        {onDownloadPdf && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={downloadingPdf}
            onClick={onDownloadPdf}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {t('downloadPdfBtn')}
          </Button>
        )}
      </div>
    </Card>
  );
}
