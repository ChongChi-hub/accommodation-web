'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useChat } from '@/presentation/hooks/useChat';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Link } from '@/i18n/routing';
import {
  MessageSquare,
  X,
  Send,
  Maximize2,
  ArrowLeft,
  Loader2,
  Clock,
  Home,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { getMessagesRoute } from '@/presentation/utils/user-display';

export interface FloatingChatWidgetProps {
  defaultOpen?: boolean;
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  roomId?: string;
  roomTitle?: string;
}

export function FloatingChatWidget({
  defaultOpen = false,
  recipientId,
  recipientName,
  recipientRole,
  roomId,
  roomTitle,
}: FloatingChatWidgetProps) {
  const tChat = useTranslations('chat');
  const tCommon = useTranslations('common');
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [viewMode, setViewMode] = useState<'chat' | 'list'>('chat');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isLoadingMessages,
    isSending,
    totalUnread,
    selectConversation,
    sendMessage,
  } = useChat({
    autoLoad: isAuthenticated && isOpen,
    recipientId,
    recipientName,
    recipientRole,
    roomId,
    roomTitle,
  });

  const effectiveRole = user?.workspaceHint || user?.roles?.[0] || null;
  const fullMessagesRoute = getMessagesRoute(effectiveRole);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, viewMode]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  const otherParticipant = activeConversation?.otherParticipant;

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-800 dark:from-teal-900 dark:to-stone-900 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              {viewMode === 'chat' && conversations.length > 1 && (
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/90"
                  title={tChat('allConversations')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {viewMode === 'chat' && otherParticipant ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={otherParticipant.name} size="sm" className="ring-2 ring-white/20" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-white leading-tight">
                      {otherParticipant.name}
                    </p>
                    <p className="text-[10px] text-teal-200 truncate flex items-center gap-1">
                      {otherParticipant.role === 'LANDLORD' ? tChat('landlordRole') : tChat('tenantRole')}
                      {activeConversation?.roomTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[130px]" title={activeConversation.roomTitle}>
                            {activeConversation.roomTitle}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-300" />
                  <span className="text-xs font-bold">{tChat('messagesTitle')}</span>
                  {totalUnread > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                      {totalUnread}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {fullMessagesRoute && (
                <Link
                  href={fullMessagesRoute}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white"
                  title={tChat('openFullPage')}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white"
                title={tCommon('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {viewMode === 'list' ? (
            /* Conversations List */
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>{tChat('noConversations')}</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      selectConversation(c.id);
                      setViewMode('chat');
                    }}
                    className={cn(
                      'w-full p-3.5 flex items-start gap-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50',
                      activeConversation?.id === c.id && 'bg-teal-50/50 dark:bg-teal-950/30'
                    )}
                  >
                    <Avatar name={c.otherParticipant?.name || 'User'} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {c.otherParticipant?.name || 'User'}
                        </p>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formatMessageTime(c.lastMessageTime || c.updatedAt)}
                        </span>
                      </div>
                      {c.roomTitle && (
                        <p className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1 truncate mt-0.5">
                          <Home className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{c.roomTitle}</span>
                        </p>
                      )}
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {c.lastMessageContent || tChat('noMessagesYet')}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Active Chat Thread */
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-stone-50/40 dark:bg-stone-900/40">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>{tChat('loadingMessages')}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-stone-400 space-y-1">
                    <MessageSquare className="w-8 h-8 text-stone-300 dark:text-stone-700" />
                    <p className="font-medium text-stone-600 dark:text-stone-300">
                      {tChat('startGreeting')}
                    </p>
                    <p className="text-[11px]">{tChat('greetingHint')}</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex flex-col max-w-[82%] text-xs',
                        m.isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2.5 rounded-2xl break-words leading-relaxed shadow-xs',
                          m.isMine
                            ? 'bg-teal-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 rounded-tl-xs'
                        )}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-0.5 px-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatMessageTime(m.createdAt)}
                        {m.isMine && (
                          <CheckCheck
                            className={cn(
                              'w-2.5 h-2.5',
                              m.isRead ? 'text-teal-500' : 'text-stone-300 dark:text-stone-600'
                            )}
                          />
                        )}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSend}
                className="p-2.5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={tChat('typePlaceholder')}
                  disabled={isSending || isLoading}
                  className="flex-1 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-3 py-2 rounded-xl border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-colors"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!inputText.trim() || isSending}
                  className="shrink-0 h-8 w-8 p-0 rounded-xl flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative group flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg shadow-teal-700/25 hover:shadow-xl hover:shadow-teal-700/35 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        aria-label={tChat('toggleChat')}
      >
        <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span className="text-xs font-bold tracking-wide">{tChat('chatboxPill')}</span>
        {totalUnread > 0 && (
          <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse">
            {totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
