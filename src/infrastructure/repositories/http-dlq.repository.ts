import { DeadLetterMessage, DlqMetrics } from '@/domain/entities/DeadLetterMessage';
import { DlqRepository } from '@/domain/repositories/DlqRepository';
import { ApiClient } from '../http/api-client';

export class HttpDlqRepository implements DlqRepository {
  async listAll(): Promise<DeadLetterMessage[]> {
    const data = await ApiClient.get<DeadLetterMessage[]>('/admin/dlq');
    return data || [];
  }

  async getMetrics(): Promise<DlqMetrics> {
    const data = await ApiClient.get<DlqMetrics>('/admin/dlq/metrics');
    return data || { total: 0, pendingReplay: 0, replayed: 0, discarded: 0 };
  }

  async replay(id: string): Promise<DeadLetterMessage> {
    return ApiClient.post<DeadLetterMessage>(`/admin/dlq/${id}/replay`);
  }

  async discard(id: string): Promise<DeadLetterMessage> {
    return ApiClient.post<DeadLetterMessage>(`/admin/dlq/${id}/discard`);
  }
}
