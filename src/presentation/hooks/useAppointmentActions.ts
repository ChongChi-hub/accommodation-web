'use client';

import { useState } from 'react';
import {
  ViewingAppointmentItem,
  ViewingAppointmentDetail,
  CancelReasonCode,
} from '@/domain/entities/ViewingAppointment';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { ApiError } from '@/infrastructure/http/api-client';

export interface ConflictWarning {
  id: string;
  roomTitle: string;
  start: string;
  end: string;
}

export function useAppointmentActions(
  refresh: () => void,
  selectedDetail: ViewingAppointmentDetail | null,
  openDetail: (id: string) => Promise<void>
) {
  const [confirmTarget, setConfirmTarget] = useState<ViewingAppointmentItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ViewingAppointmentItem | null>(null);
  const [completeTarget, setCompleteTarget] = useState<ViewingAppointmentItem | null>(null);
  const [conflictWarning, setConflictWarning] = useState<ConflictWarning | null>(null);

  const executeConfirm = async (force: boolean = false, landlordNote?: string) => {
    if (!confirmTarget) return;
    try {
      await container.landlord.appointmentRepository.confirm(confirmTarget.id, {
        force,
        landlordNote,
        version: confirmTarget.version,
      });
      toast.success('Đã xác nhận lịch hẹn xem phòng!');
      setConfirmTarget(null);
      setConflictWarning(null);
      refresh();
      if (selectedDetail?.id === confirmTarget.id) {
        openDetail(confirmTarget.id);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.errorCode === 'TIME_CONFLICT') {
        const anyErr = err as ApiError & {
          data?: {
            conflictingAppointmentId?: string;
            conflictingRoomTitle?: string;
            conflictingStart?: string;
            conflictingEnd?: string;
          };
        };
        setConflictWarning({
          id: anyErr.data?.conflictingAppointmentId || '',
          roomTitle: anyErr.data?.conflictingRoomTitle || '',
          start: anyErr.data?.conflictingStart || '',
          end: anyErr.data?.conflictingEnd || '',
        });
      } else {
        toast.error(err instanceof Error ? err.message : 'Xác nhận thất bại');
      }
    }
  };

  const executeCancel = async (reasonCode: CancelReasonCode, reasonNote?: string) => {
    if (!cancelTarget) return;
    try {
      await container.landlord.appointmentRepository.cancel(cancelTarget.id, {
        reasonCode,
        reasonNote,
        version: cancelTarget.version,
      });
      toast.success('Đã hủy lịch hẹn xem phòng!');
      setCancelTarget(null);
      refresh();
      if (selectedDetail?.id === cancelTarget.id) {
        openDetail(cancelTarget.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  const executeComplete = async (outcome: 'COMPLETED' | 'NO_SHOW', note?: string) => {
    if (!completeTarget) return;
    try {
      await container.landlord.appointmentRepository.complete(completeTarget.id, {
        outcome,
        note,
        version: completeTarget.version,
      });
      toast.success(
        outcome === 'COMPLETED' ? 'Đã hoàn thành cuộc hẹn xem phòng!' : 'Đã ghi nhận khách không đến'
      );
      setCompleteTarget(null);
      refresh();
      if (selectedDetail?.id === completeTarget.id) {
        openDetail(completeTarget.id);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thao tác thất bại');
    }
  };

  return {
    confirmTarget,
    cancelTarget,
    completeTarget,
    conflictWarning,
    setConfirmTarget,
    setCancelTarget,
    setCompleteTarget,
    setConflictWarning,
    executeConfirm,
    executeCancel,
    executeComplete,
  };
}

