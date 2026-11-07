'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Button } from '@/presentation/components/ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { LandlordRoomItem } from '@/domain/entities/LandlordRoom';

interface Props {
  room: LandlordRoomItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (roomId: number) => Promise<void>;
  isDeleting: boolean;
}

export function LandlordRoomDeleteModal({
  room,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: Props) {
  const t = useTranslations('landlord.rooms.deleteModal');

  if (!room) return null;

  const isRented = room.status === 'RENTED';

  const handleConfirm = async () => {
    if (isRented) return;
    await onConfirm(room.id);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
          <p className="font-semibold text-stone-900 dark:text-stone-100">{room.title}</p>
          <p className="text-stone-500 mt-0.5">{room.address}</p>
        </div>

        {isRented ? (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <p>{t('rentedWarning')}</p>
          </div>
        ) : (
          <p className="text-xs text-stone-600 dark:text-stone-400">
            {t('desc')}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('cancelBtn')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isDeleting}
            disabled={isRented}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            {t('confirmBtn')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
