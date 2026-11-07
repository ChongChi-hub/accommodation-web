import { SupportTicket, TicketMessage } from '../entities/SupportTicket';

export interface SupportRepository {
  getTickets(filters?: { userId?: string; status?: string; category?: string }): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket | null>;
  createTicket(data: Omit<SupportTicket, 'id' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket>;
  addMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>): Promise<TicketMessage>;
  updateStatus(ticketId: string, status: SupportTicket['status']): Promise<void>;
}
