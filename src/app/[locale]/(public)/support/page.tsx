'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { SupportTicket } from '@/domain/entities/SupportTicket';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Badge } from '@/presentation/components/ui/Badge';
import { Card } from '@/presentation/components/ui/Card';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  Clock,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function SupportPage() {
  const t = useTranslations('pages.support');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    container.support.supportRepository.getTickets().then((data: SupportTicket[]) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const filteredTickets = tickets.filter((tk) => {
    const matchSearch =
      tk.subject.toLowerCase().includes(search.toLowerCase()) ||
      tk.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || tk.status === statusFilter;
    const matchCat = categoryFilter === 'ALL' || tk.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="warning">{t('status.OPEN')}</Badge>;
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return <Badge variant="primary">{t('status.IN_PROGRESS')}</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">{t('status.RESOLVED')}</Badge>;
      case 'CLOSED':
        return <Badge variant="neutral">{t('status.CLOSED')}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'URGENT':
        return <Badge variant="danger">{t('priority.URGENT')}</Badge>;
      case 'HIGH':
        return <Badge variant="warning">{t('priority.HIGH')}</Badge>;
      case 'MEDIUM':
        return <Badge variant="neutral">{t('priority.MEDIUM')}</Badge>;
      case 'LOW':
        return <Badge variant="neutral">{t('priority.LOW')}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4" />
            <span>Tổ Ấm Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            {t('title')}
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            {t('subtitle')}
          </p>
        </div>

        <Link href="/support/new">
          <Button variant="primary" className="flex items-center gap-2 shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span>{t('newTicket')}</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-foreground-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          >
            <option value="ALL">{t('allStatus')}</option>
            <option value="OPEN">{t('status.OPEN')}</option>
            <option value="IN_PROGRESS">{t('status.IN_PROGRESS')}</option>
            <option value="RESOLVED">{t('status.RESOLVED')}</option>
            <option value="CLOSED">{t('status.CLOSED')}</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
          >
            <option value="ALL">{t('allCategories')}</option>
            <option value="PAYMENT">{t('category.BILLING')}</option>
            <option value="CONTRACT">{t('category.CONTRACT')}</option>
            <option value="TECHNICAL">{t('category.TECHNICAL')}</option>
            <option value="ACCOUNT">{t('category.ACCOUNT')}</option>
            <option value="DISPUTE">{t('category.DISPUTE')}</option>
          </select>
        </div>
      </div>

      {/* Ticket List Table / Card */}
      <Card className="overflow-hidden p-0 border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
              <tr>
                <th className="py-3 px-4">{t('table.ticketId')}</th>
                <th className="py-3 px-4">{t('table.subject')}</th>
                <th className="py-3 px-4 hidden sm:table-cell">{t('table.category')}</th>
                <th className="py-3 px-4">{t('table.priority')}</th>
                <th className="py-3 px-4">{t('table.status')}</th>
                <th className="py-3 px-4 text-right">{t('table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground-muted">
                    {t('empty')}
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground-muted">
                    {t('empty')}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-surface-muted/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800 dark:text-teal-400">
                      {ticket.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground max-w-xs truncate">
                      <div className="font-semibold">{ticket.subject}</div>
                      <div className="text-[11px] text-foreground-muted sm:hidden mt-0.5">
                        {ticket.category}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-foreground-muted hidden sm:table-cell">
                      {ticket.category}
                    </td>
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/support/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
