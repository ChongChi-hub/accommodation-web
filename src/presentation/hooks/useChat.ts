'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Conversation, ChatMessage, StartConversationParams } from '@/domain/entities/Chat';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';

export interface UseChatOptions {
  autoLoad?: boolean;
  pollIntervalMs?: number;
  initialConversationId?: string;
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  roomId?: string;
  roomTitle?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const {
    autoLoad = true,
    pollIntervalMs = 4000,
    initialConversationId,
    recipientId,
    recipientName,
    recipientRole,
    roomId,
    roomTitle,
  } = options;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConversation?.id || null;

  const { user } = useAuthStore();
  const repo = container.chat.chatRepository;

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const list = await repo.getConversations();
      setConversations(list);
      return list;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách tin nhắn';
      setError(msg);
      return [];
    }
  }, [repo]);

  const loadMessages = useCallback(
    async (convId: string, silent = false) => {
      if (!silent) setIsLoadingMessages(true);
      try {
        const msgs = await repo.getMessages(convId);
        setMessages(msgs);
        // Mark as read
        repo
          .markAsRead(convId)
          .then(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cozynest:refresh-badges'));
              window.dispatchEvent(new CustomEvent('chat:unread-updated'));
            }
          })
          .catch(() => {});
        // Update local unreadCount
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cozynest:refresh-badges'));
          window.dispatchEvent(new CustomEvent('chat:unread-updated'));
        }
      } catch (err: unknown) {
        if (!silent) {
          const msg = err instanceof Error ? err.message : 'Không thể tải tin nhắn';
          setError(msg);
        }
      } finally {
        if (!silent) setIsLoadingMessages(false);
      }
    },
    [repo]
  );

  const selectConversation = useCallback(
    (convId: string) => {
      const found = conversations.find((c) => c.id === convId);
      if (found) {
        setActiveConversation(found);
      } else {
        setActiveConversation({
          id: convId,
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      loadMessages(convId, false);
    },
    [conversations, loadMessages]
  );

  const startOrOpenConversation = useCallback(
    async (params: StartConversationParams) => {
      setIsLoading(true);
      try {
        const conv = await repo.startOrGetConversation(params);
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === conv.id);
          return exists ? prev.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...prev];
        });
        setActiveConversation(conv);
        await loadMessages(conv.id, false);
        return conv;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể mở cuộc trò chuyện';
        toast.error(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [repo, loadMessages]
  );

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim();
      const currentConvId = activeConvIdRef.current;
      if (!trimmed || !currentConvId) return false;

      setIsSending(true);

      // Optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        id: tempId,
        conversationId: currentConvId,
        senderId: 'me',
        senderName: 'Tôi',
        content: trimmed,
        type: 'TEXT',
        isRead: false,
        isMine: true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const realMsg = await repo.sendMessage({
          conversationId: currentConvId,
          content: trimmed,
          type: 'TEXT',
        });

        // Replace optimistic message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...realMsg, isMine: true } : m))
        );

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConvId
              ? {
                  ...c,
                  lastMessageContent: realMsg.content,
                  lastMessageTime: realMsg.createdAt,
                  updatedAt: realMsg.createdAt,
                }
              : c
          )
        );
        return true;
      } catch (err: unknown) {
        // Rollback optimistic message on error; caller preserves draft so user can retry without losing text
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        const msg = err instanceof Error ? err.message : 'Gửi tin nhắn thất bại';
        toast.error(msg);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [repo]
  );

  // Initial load
  useEffect(() => {
    if (!autoLoad) return;
    let isMounted = true;
    setIsLoading(true);

    loadConversations()
      .then(async (list) => {
        if (!isMounted) return;

        // If specific recipient passed, start or open that conversation
        if (recipientId) {
          try {
            const conv = await repo.startOrGetConversation({
              recipientId,
              recipientName,
              recipientRole,
              senderName: user?.fullName || undefined,
              roomId,
              roomTitle,
            });
            if (isMounted) {
              setConversations((prev) => {
                const exists = prev.some((c) => c.id === conv.id);
                return exists ? prev.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...prev];
              });
              setActiveConversation(conv);
              loadMessages(conv.id, false);
            }
            return;
          } catch {
            // Handled
          }
        }

        // If specific conversationId passed
        if (initialConversationId) {
          const matched = list.find((c) => c.id === initialConversationId);
          if (matched) {
            setActiveConversation(matched);
            loadMessages(matched.id, false);
            return;
          }
        }

        // Default to first conversation
        if (list.length > 0) {
          setActiveConversation(list[0]);
          loadMessages(list[0].id, false);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    autoLoad,
    initialConversationId,
    recipientId,
    recipientName,
    recipientRole,
    roomId,
    roomTitle,
    loadConversations,
    loadMessages,
    repo,
  ]);

  // Real-time polling: pauses automatically when autoLoad is false or browser tab is hidden
  useEffect(() => {
    if (!autoLoad || !pollIntervalMs || pollIntervalMs <= 0) return;

    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const currentId = activeConvIdRef.current;
      if (currentId) {
        loadMessages(currentId, true);
      }
      loadConversations();
    };

    const interval = setInterval(tick, pollIntervalMs);
    const onVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        tick();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [autoLoad, pollIntervalMs, loadMessages, loadConversations]);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isLoadingMessages,
    isSending,
    error,
    totalUnread,
    selectConversation,
    startOrOpenConversation,
    sendMessage,
    loadConversations,
  };
}
