import { DisputeRepository } from '@/domain/repositories/DisputeRepository';
import { Dispute } from '@/domain/entities/Dispute';

/**
 * Empty placeholder repository until Sprint 4 dispute endpoints are implemented.
 */
export class StaticDisputeRepository implements DisputeRepository {
  private disputes: Dispute[] = [];

  async getDisputes(filters?: { status?: string; contractId?: string }): Promise<Dispute[]> {
    let result = [...this.disputes];
    if (filters?.status) result = result.filter((d) => d.status === filters.status);
    if (filters?.contractId) result = result.filter((d) => d.contractId === filters.contractId);
    return result;
  }

  async getDisputeById(id: string): Promise<Dispute | null> {
    return this.disputes.find((d) => d.id === id) || null;
  }

  async createDispute(_data: Omit<Dispute, 'id' | 'createdAt' | 'status'>): Promise<Dispute> {
    throw new Error('Tính năng tạo khiếu nại tranh chấp sẽ kết nối backend ở Sprint 4');
  }

  async resolveDispute(_id: string, _verdict: string, _status: Dispute['status']): Promise<void> {
    throw new Error('Tính năng xử lý tranh chấp sẽ kết nối backend ở Sprint 4');
  }
}
