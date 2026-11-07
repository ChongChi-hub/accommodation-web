export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'ACCOUNT' | 'PAYMENT' | 'CONTRACT' | 'VIOLATION' | 'TECHNICAL' | 'OTHER';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN' | 'SUPPORT_AGENT';
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  assignedTo?: string;
  assignedAgentName?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
