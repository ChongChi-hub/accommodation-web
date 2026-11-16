import { Conversation, ChatMessage, StartConversationParams, SendMessageParams } from '../entities/Chat';

export interface ChatRepository {
  getConversations(): Promise<Conversation[]>;
  startOrGetConversation(params: StartConversationParams): Promise<Conversation>;
  getMessages(conversationId: string, limit?: number): Promise<ChatMessage[]>;
  sendMessage(params: SendMessageParams): Promise<ChatMessage>;
  markAsRead(conversationId: string): Promise<void>;
  getUnreadCount(): Promise<number>;
}
