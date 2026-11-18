'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { useChat } from '@/presentation/hooks/useChat';
import { UserPresenceBadge } from '@/presentation/components/chat/UserPresenceBadge';
import { SafeMessageContent } from '@/presentation/components/chat/SafeMessageContent';
import { Send, MessageSquare, Loader2, Home, Clock, CheckCheck, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

function LandlordMessagesContent() {
  const tChat = useTranslations('chat');
  const tAuto = useTranslations('autoI18n');
  const searchParams = useSearchParams();

  const conversationIdParam = searchParams.get('conversationId') || undefined;
  const tenantIdParam = searchParams.get('tenantId') || undefined;
  const tenantNameParam = searchParams.get('tenantName') || undefined;
  const roomIdParam = searchParams.get('roomId') || undefined;
  const roomTitleParam = searchParams.get('roomTitle') || undefined;

  const [inputMsg, setInputMsg] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(conversationIdParam || tenantIdParam));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isLoadingMessages,
    isSending,
    selectConversation,
    sendMessage,
  } = useChat({
    initialConversationId: conversationIdParam,
    recipientId: tenantIdParam,
    recipientName: tenantNameParam,
    recipientRole: 'TENANT',
    roomId: roomIdParam,
    roomTitle: roomTitleParam,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isSending) return;
    const text = inputMsg;
    const ok = await sendMessage(text);
    if (ok) {
      setInputMsg('');
    }
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const other = activeConversation?.otherParticipant;

  return (
    <div className="space-y-4 min-w-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {tAuto('k0182')}
        </h1>
        <p className="text-xs text-stone-500">{tAuto('k0183')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[640px]">
        {/* Left column: Conversations list (1-col toggle on mobile) */}
        <Card className={cn(
          'p-0 overflow-hidden flex-col border border-stone-200 dark:border-stone-800',
          mobileShowThread ? 'hidden md:flex' : 'flex'
        )}>
          <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 font-bold text-xs uppercase tracking-wider text-stone-500 flex items-center justify-between">
            <span>{tAuto('k0184')}</span>
            <span className="text-[11px] font-mono text-stone-400">({conversations.length})</span>
          </div>

          <div className="divide-y divide-stone-100 dark:border-stone-800 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>{tChat('noConversations')}</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeConversation?.id === c.id;
                const participantName = c.otherParticipant?.name || 'Khách thuê';
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      selectConversation(c.id);
                      setMobileShowThread(true);
                    }}
                    className={cn(
                      'w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer',
                      isActive
                        ? 'bg-teal-50/80 dark:bg-teal-950/40 border-l-4 border-teal-600'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar name={participantName} size="md" />
                      <UserPresenceBadge
                        userId={c.otherParticipant?.userId}
                        variant="dot"
                        className="absolute bottom-0 right-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {participantName}
                        </p>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formatTime(c.lastMessageTime || c.updatedAt)}
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
                );
              })
            )}
          </div>
        </Card>

        {/* Right column: Chat thread (1-col toggle on mobile) */}
        <Card className={cn(
          'md:col-span-2 p-0 overflow-hidden flex-col border border-stone-200 dark:border-stone-800',
          mobileShowThread ? 'flex' : 'hidden md:flex'
        )}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/60 dark:bg-stone-800/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    aria-label={tChat('allConversations')}
                    className="md:hidden p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <Avatar name={other?.name || 'Khách thuê'} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {other?.name || 'Khách thuê'}
                    </p>
                    <p className="text-[10px] text-teal-700 dark:text-teal-400 truncate flex items-center gap-1">
                      <span>{tChat('tenantRole')}</span>
                      {activeConversation.roomTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[260px] font-medium" title={activeConversation.roomTitle}>
                            {activeConversation.roomTitle}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <UserPresenceBadge userId={other?.userId} />
                </div>
              </div>

              {/* Messages scroll area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/30 dark:bg-stone-900/30">
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
                  messages.map((m) => {
                    const isMe = m.isMine;
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          'flex flex-col max-w-[78%]',
                          isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs break-words',
                            isMe
                              ? 'bg-teal-700 text-white rounded-tr-xs'
                              : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700 rounded-tl-xs'
                          )}
                        >
                          <SafeMessageContent text={m.content} />
                        </div>
                        <span className="text-[10px] text-stone-400 mt-1 px-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(m.createdAt)}
                          {isMe && (
                            <CheckCheck
                              className={cn(
                                'w-3 h-3',
                                m.isRead ? 'text-teal-600' : 'text-stone-300 dark:text-stone-600'
                              )}
                            />
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat send input (Enter sends, Shift+Enter adds newline) */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-end gap-2"
              >
                <textarea
                  rows={1}
                  maxLength={2000}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder={tChat('typePlaceholderLandlord')}
                  disabled={isSending}
                  className="flex-1 resize-none max-h-28 bg-stone-50 dark:bg-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 border border-transparent focus:border-teal-700 focus:bg-white dark:focus:bg-stone-900 focus:outline-none transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!inputMsg.trim() || isSending}
                  leftIcon={
                    isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {tAuto('k0188')}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="w-10 h-10 text-stone-300" />}
                title={tChat('selectConversation')}
                description={tChat('selectConversationHint')}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function LandlordMessagesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[640px] w-full rounded-2xl" />}>
      <LandlordMessagesContent />
    </Suspense>
  );
}
