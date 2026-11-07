export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'EXPIRED';

export type CancelReasonCode =
  | 'BUSY'
  | 'ROOM_TAKEN'
  | 'TENANT_NOT_ELIGIBLE'
  | 'TIME_CONFLICT'
  | 'OTHER';

export type CancelledBy = 'LANDLORD' | 'TENANT' | 'SYSTEM';

export interface AppointmentStatusHistory {
  id: number;
  appointmentId: string;
  fromStatus: string | null;
  toStatus: string;
  actorId: string;
  actorRole: string;
  reason: string | null;
  createdAt: string;
}

export interface ViewingAppointmentItem {
  id: string;
  roomId: string;
  roomTitle: string;
  roomAddress: string;
  roomCoverThumbKey: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  tenantNote: string | null;
  landlordNote: string | null;
  cancelReasonCode: CancelReasonCode | null;
  cancelReasonNote: string | null;
  cancelledBy: CancelledBy | null;
  confirmedAt: string | null;
  completedAt: string | null;
  version: number;
  createdAt: string;
}

export interface ViewingAppointmentDetail extends ViewingAppointmentItem {
  tenantId: string;
  landlordId: string;
  history: AppointmentStatusHistory[];
}

export interface AppointmentSummary {
  totalPending: number;
  totalConfirmed: number;
  totalNeedingOutcomeUpdate: number;
  totalCompleted: number;
  totalCancelled: number;
  totalExpired: number;
  todayCount: number;
}

export interface AppointmentFilterParams {
  status?: AppointmentStatus;
  roomId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ConfirmAppointmentPayload {
  force?: boolean;
  landlordNote?: string;
  version?: number;
}

export interface CancelAppointmentPayload {
  reasonCode: CancelReasonCode;
  reasonNote?: string;
  version?: number;
}

export interface CompleteAppointmentPayload {
  outcome: 'COMPLETED' | 'NO_SHOW';
  note?: string;
  version?: number;
}
