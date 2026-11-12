'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LandlordRoomItem } from '@/domain/entities/LandlordRoom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { Button } from '@/presentation/components/ui/Button';
import { LandlordRoomStatusBadge } from './LandlordRoomStatusBadge';
import { Edit, Eye, EyeOff, Trash2, ExternalLink, ImageIcon } from 'lucide-react';

interface Props {
  rooms: LandlordRoomItem[];
  onToggleVisibility: (roomId: number, currentHidden: boolean) => Promise<boolean>;
  onOpenDelete: (room: LandlordRoomItem) => void;
  isTogglingId?: number | null;
}

export function LandlordRoomTable({
  rooms,
  onToggleVisibility,
  onOpenDelete,
  isTogglingId,
}: Props) {
  const tAuto = useTranslations('autoI18n');
  const t = useTranslations('landlord.rooms');

  const formatPrice = (val: number) => {
    return `${val.toLocaleString('vi-VN')} đ`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.roomInfo')}</TableHead>
            <TableHead>{t('table.price')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.stats')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((r) => {
            const isModHidden = r.status === 'HIDDEN' && (r.hiddenBy === 'MODERATOR' || r.hiddenBy === 'ADMIN');
            const isHidden = r.status === 'HIDDEN';
            const isRented = r.status === 'RENTED';

            return (
              <TableRow key={r.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700">
                      {r.coverThumbUrl ? (
                        <Image
                          src={r.coverThumbUrl}
                          alt={r.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate max-w-[280px]">
                        {r.title}
                      </p>
                      <p className="text-xs text-stone-500 truncate max-w-[280px] mt-0.5">
                        {r.shortAddress || r.address}
                      </p>
                      <span className="inline-block text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                        {r.area}{' '}{tAuto('k0517')}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {formatPrice(r.price)}
                    <span className="text-xs font-normal text-stone-500">{tAuto('k0516')}</span>
                  </p>
                  {r.deposit > 0 && (
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {tAuto('k0521')}{' '}{formatPrice(r.deposit)}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  <LandlordRoomStatusBadge
                    status={r.status}
                    hiddenBy={r.hiddenBy}
                    hiddenReason={r.hiddenReason}
                    rejectedReason={r.rejectedReason}
                  />
                  {r.rejectedReason && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 max-w-[180px] line-clamp-1" title={r.rejectedReason}>
                      {tAuto('k0163')}{' '}{r.rejectedReason}
                    </p>
                  )}
                  {isModHidden && r.hiddenReason && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 max-w-[180px] line-clamp-1" title={r.hiddenReason}>
                      {tAuto('k0163')}{' '}{r.hiddenReason}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  <p className="text-xs text-stone-800 dark:text-stone-200">
                    <span className="font-semibold">{r.viewCount}</span>{' '}{tAuto('k0518')}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {formatDate(r.publishedAt || r.createdAt)}
                  </p>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Public Preview */}
                    <Link href={`/rooms/${r.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('actions.preview')}
                        title={t('actions.preview')}
                      >
                        <ExternalLink className="w-4 h-4 text-stone-500" />
                      </Button>
                    </Link>

                    {/* Edit */}
                    <Link href={`/dashboard/landlord/rooms/${r.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('actions.edit')}
                        title={t('actions.edit')}
                      >
                        <Edit className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      </Button>
                    </Link>

                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isModHidden || isTogglingId === r.id}
                      onClick={() => onToggleVisibility(r.id, isHidden)}
                      aria-label={isHidden ? t('actions.show') : t('actions.hide')}
                      title={isModHidden ? t('modHiddenTooltip') : isHidden ? t('actions.show') : t('actions.hide')}
                    >
                      {isHidden ? (
                        <EyeOff className={`w-4 h-4 ${isModHidden ? 'text-stone-300 dark:text-stone-600' : 'text-amber-600'}`} />
                      ) : (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      )}
                    </Button>

                    {/* Soft Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenDelete(r)}
                      aria-label={t('actions.delete')}
                      title={isRented ? t('deleteModal.rentedWarning') : t('actions.delete')}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
