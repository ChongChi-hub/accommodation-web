import { Dispute } from '../entities/Dispute';

export interface DisputeRepository {
  getDisputes(filters?: { status?: string; contractId?: string }): Promise<Dispute[]>;
  getDisputeById(id: string): Promise<Dispute | null>;
  createDispute(data: Omit<Dispute, 'id' | 'createdAt' | 'status'>): Promise<Dispute>;
  resolveDispute(id: string, verdict: string, status: Dispute['status']): Promise<void>;
}

