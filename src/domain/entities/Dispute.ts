export type DisputeType = 'DEPOSIT_RETURN' | 'DAMAGE_COMPENSATION' | 'EARLY_TERMINATION' | 'OVERCHARGED_UTILITY' | 'OTHER';
export type DisputeStatus = 'PENDING' | 'MEDIATING' | 'RESOLVED' | 'DISMISSED';

export interface Dispute {
  id: string;
  contractId: string;
  roomTitle: string;
  complainantId: string;
  complainantName: string;
  complainantRole: 'TENANT' | 'LANDLORD';
  defendantId: string;
  defendantName: string;
  defendantRole: 'TENANT' | 'LANDLORD';
  disputeType: DisputeType;
  amount: number;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  verdict?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}
