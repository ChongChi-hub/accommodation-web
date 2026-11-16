import { ChatRepository } from '@/domain/repositories/ChatRepository';
import { Conversation, ChatMessage, StartConversationParams, SendMessageParams } from '@/domain/entities/Chat';
import { ApiClient } from '../http/api-client';

interface RawConversationDto {
  id: string;
  roomId?: string | null;
  roomTitle?: string | null;
  lastMessageContent?: string | null;
  lastMessageTime?: string | null;
  unreadCount?: number;
  otherParticipant?: {
    userId: string;
    name: string;
    role: string;
    avatarUrl?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface RawChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  type?: string;
  isRead?: boolean;
  isMine?: boolean;
  createdAt: string;
}

export class HttpChatRepository implements ChatRepository {
  async getConversations(): Promise<Conversation[]> {
    const data = await ApiClient.get<RawConversationDto[]>('/chat/conversations');
    return (Array.isArray(data) ? data : []).map((c) => ({
      id: c.id,
      roomId: c.roomId ?? null,
      roomTitle: c.roomTitle ?? null,
      lastMessageContent: c.lastMessageContent ?? null,
      lastMessageTime: c.lastMessageTime ?? null,
      unreadCount: typeof c.unreadCount === 'number' ? c.unreadCount : 0,
      otherParticipant: c.otherParticipant
        ? {
            userId: c.otherParticipant.userId,
            name: c.otherParticipant.name,
            role: c.otherParticipant.role,
            avatarUrl: c.otherParticipant.avatarUrl,
          }
        : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async startOrGetConversation(params: StartConversationParams): Promise<Conversation> {
    const c = await ApiClient.post<RawConversationDto>('/chat/conversations', {
      recipientId: params.recipientId,
      recipientName: params.recipientName,
      recipientRole: params.recipientRole,
      senderName: params.senderName,
      roomId: params.roomId,
      roomTitle: params.roomTitle,
      initialMessage: params.initialMessage,
    });
    return {
      id: c.id,
      roomId: c.roomId ?? null,
      roomTitle: c.roomTitle ?? null,
      lastMessageContent: c.lastMessageContent ?? null,
      lastMessageTime: c.lastMessageTime ?? null,
      unreadCount: typeof c.unreadCount === 'number' ? c.unreadCount : 0,
      otherParticipant: c.otherParticipant
        ? {
            userId: c.otherParticipant.userId,
            name: c.otherParticipant.name,
            role: c.otherParticipant.role,
            avatarUrl: c.otherParticipant.avatarUrl,
          }
        : null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async getMessages(conversationId: string, limit = 50): Promise<ChatMessage[]> {
    const data = await ApiClient.get<RawChatMessageDto[]>(
      `/chat/conversations/${encodeURIComponent(conversationId)}/messages?limit=${limit}`
    );
    return (Array.isArray(data) ? data : []).map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      content: m.content,
      type: m.type ?? 'TEXT',
      isRead: Boolean(m.isRead),
      isMine: Boolean(m.isMine),
      createdAt: m.createdAt,
    }));
  }

  async sendMessage(params: SendMessageParams): Promise<ChatMessage> {
    const m = await ApiClient.post<RawChatMessageDto>(
      `/chat/conversations/${encodeURIComponent(params.conversationId)}/messages`,
      {
        content: params.content,
        type: params.type ?? 'TEXT',
      }
    );
    return {
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      content: m.content,
      type: m.type ?? 'TEXT',
      isRead: Boolean(m.isRead),
      isMine: Boolean(m.isMine),
      createdAt: m.createdAt,
    };
  }

  async markAsRead(conversationId: string): Promise<void> {
    await ApiClient.patch(`/chat/conversations/${encodeURIComponent(conversationId)}/read`);
  }

  async getUnreadCount(): Promise<number> {
    const res = await ApiClient.get<{ count: number }>('/chat/unread-count');
    return typeof res?.count === 'number' ? res.count : 0;
  }
}
