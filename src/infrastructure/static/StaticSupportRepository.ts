import { SupportRepository } from '@/domain/repositories/SupportRepository';
import { SupportTicket, TicketMessage } from '@/domain/entities/SupportTicket';

/**
 * In-memory Sprint 4 placeholder repository initialized empty (no fabricated tickets).
 */
export class StaticSupportRepository implements SupportRepository {
  private tickets: SupportTicket[] = [];

  async getTickets(filters?: { userId?: string; status?: string; category?: string }): Promise<SupportTicket[]> {
    let result = [...this.tickets];
    if (filters?.userId) result = result.filter((t) => t.userId === filters.userId);
    if (filters?.status) result = result.filter((t) => t.status === filters.status);
    if (filters?.category) result = result.filter((t) => t.category === filters.category);
    return result;
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    return this.tickets.find((t) => t.id === id) || null;
  }

  async createTicket(_data: Omit<SupportTicket, 'id' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    throw new Error('Tính năng gửi yêu cầu hỗ trợ sẽ kết nối backend ở Sprint 4');
  }

  async addMessage(_ticketId: string, _message: Omit<TicketMessage, 'id' | 'createdAt'>): Promise<TicketMessage> {
    throw new Error('Tính năng phản hồi yêu cầu hỗ trợ sẽ kết nối backend ở Sprint 4');
  }

  async updateStatus(_ticketId: string, _status: SupportTicket['status']): Promise<void> {
    throw new Error('Tính năng cập nhật trạng thái hỗ trợ sẽ kết nối backend ở Sprint 4');
  }
}
