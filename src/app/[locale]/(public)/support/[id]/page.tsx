'use client';

import React, { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { SupportTicket, TicketMessage } from '@/domain/entities/SupportTicket';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import {
  LifeBuoy,
  ArrowLeft,
  Send,
  User,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Headphones,
} from 'lucide-react';

export default function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const t = useTranslations('pages.support');
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    container.support.supportRepository.getTicketById(ticketId).then((data: SupportTicket | null) => {
      setTicket(data);
      setLoading(false);
    });
  }, [ticketId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    setIsSending(true);
    try {
      const newMsg = await container.support.supportRepository.addMessage(ticket.id, {
        senderId: user?.id || 'usr_current',
        senderName: user?.fullName || 'Tôi',
        senderRole: user?.roles?.includes('ADMIN') ? 'ADMIN' : 'USER',
        message: replyText.trim(),
      });

      setTicket((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMsg],
              updatedAt: new Date().toISOString(),
            }
          : null
      );
      setReplyText('');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-foreground-muted">
        {t('detail.loading')}
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t('detail.notFound')}</h2>
        <Link href="/support">
          <Button variant="outline">{t('detail.back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/support"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('detail.back')}</span>
      </Link>

      {/* Ticket Header & Status Banner */}
      <Card className="p-6 border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-teal-800 dark:text-teal-400">
              #{ticket.id}
            </span>
            <Badge variant="primary">{ticket.category}</Badge>
            <Badge variant="neutral">{ticket.priority}</Badge>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300">
            {t(`status.${ticket.status}`)}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {ticket.subject}
        </h1>

        <div className="p-3.5 rounded-xl bg-surface-muted text-xs text-foreground leading-relaxed border border-border/60">
          <p className="font-semibold text-foreground-muted mb-1">{t('detail.initialDesc')}</p>
          <p>{ticket.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-foreground-muted pt-2 border-t border-border/60">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{t('detail.creator')} {ticket.userName} ({ticket.userPhone})</span>
          </div>
          {ticket.assignedAgentName && (
            <div className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-medium">
              <Headphones className="w-3.5 h-3.5" />
              <span>{t('detail.assignedTo')}: {ticket.assignedAgentName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('detail.created')}: {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </Card>

      {/* Conversation Thread */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          {t('detail.conversation')} ({ticket.messages.length})
        </h3>

        <div className="space-y-3">
          {ticket.messages.map((msg) => {
            const isAdmin = msg.senderRole === 'ADMIN';
            return (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  isAdmin
                    ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800'
                    : 'bg-surface border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span>{msg.senderName}</span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 text-[10px] rounded bg-teal-700 text-white font-semibold">
                        {t('detail.cskhBadge')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-foreground-muted">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    - {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply Box */}
      <Card className="p-4 sm:p-6 border border-border">
        <form onSubmit={handleSendReply} className="space-y-3">
          <label className="text-xs font-bold text-foreground block">
            {t('detail.replyLabel')}
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={t('detail.replyPlaceholder')}
            rows={3}
            required
            className="w-full p-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none resize-y"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? t('detail.sendingReply') : t('detail.sendReply')}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
