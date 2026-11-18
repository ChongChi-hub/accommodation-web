export type RentalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED' | string;

export interface RentalRequest {
  id: string;
  roomId: string;
  roomTitle?: string | null;
  tenantId: string;
  tenantName?: string | null;
  landlordId: string;
  proposedMoveInDate: string;
  numOccupants: number;
  message?: string;
  status: RentalRequestStatus;
  rejectionReason?: string | null;
  contractId?: string | null;
  holdingExpiresAt?: string | null;
  createdAt: string;
}

export interface CreateRentalRequestPayload {
  roomId: string;
  landlordId: string;
  proposedMoveInDate: string;
  numOccupants: number;
  message?: string;
  idempotencyKey?: string;
}

