export interface Participant {
  userId: string;
  name: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | string;
  avatarUrl?: string;
}

export interface Conversation {
  id: string;
  roomId?: string | null;
  roomTitle?: string | null;
  lastMessageContent?: string | null;
  lastMessageTime?: string | null;
  unreadCount: number;
  otherParticipant?: Participant | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM_NOTICE' | string;
  isRead: boolean;
  isMine: boolean;
  createdAt: string;
}

export interface StartConversationParams {
  recipientId: string;
  recipientName?: string;
  recipientRole?: string;
  senderName?: string;
  roomId?: string;
  roomTitle?: string;
  initialMessage?: string;
}

export interface SendMessageParams {
  conversationId: string;
  content: string;
  type?: string;
}
