'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { container } from '@/infrastructure/di/container';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Card } from '@/presentation/components/ui/Card';
import {
  LifeBuoy,
  ArrowLeft,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function NewSupportTicketPage() {
  const t = useTranslations('pages.support.new');
  const router = useRouter();
  const { user } = useAuthStore();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'ACCOUNT' | 'PAYMENT' | 'CONTRACT' | 'VIOLATION' | 'TECHNICAL' | 'OTHER'>('TECHNICAL');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await container.support.supportRepository.createTicket({
        userId: user?.id || 'usr_guest',
        userName: user?.fullName || 'Khách vãng lai',
        userEmail: user?.email || 'guest@toam.vn',
        userPhone: user?.phone || '0900000000',
        subject,
        category,
        priority,
        status: 'OPEN',
        description,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/support');
      }, 1500);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/support"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('back')}</span>
      </Link>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs uppercase tracking-wider">
          <LifeBuoy className="w-4 h-4" />
          <span>{t('badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-foreground-muted">
          {t('subtitle')}
        </p>
      </div>

      {success ? (
        <Card className="p-8 text-center space-y-3 bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
          <CheckCircle2 className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">{t('success')}</h3>
          <p className="text-xs text-foreground-muted">{t('redirecting')}</p>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {t('subjectLabel')} <span className="text-rose-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('subjectPlaceholder')}
                data-testid="support-new-subject"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t('categoryLabel')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  aria-label={t('categoryLabel')}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="TECHNICAL">{t('category.TECHNICAL')}</option>
                  <option value="PAYMENT">{t('category.BILLING')}</option>
                  <option value="CONTRACT">{t('category.CONTRACT')}</option>
                  <option value="VIOLATION">{t('category.DISPUTE')}</option>
                  <option value="ACCOUNT">{t('category.ACCOUNT')}</option>
                  <option value="OTHER">{t('category.OTHER')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  {t('priorityLabel')}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  aria-label={t('priorityLabel')}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="LOW">{t('priority.LOW')}</option>
                  <option value="MEDIUM">{t('priority.MEDIUM')}</option>
                  <option value="HIGH">{t('priority.HIGH')}</option>
                  <option value="URGENT">{t('priority.URGENT')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {t('descLabel')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descPlaceholder')}
                data-testid="support-new-desc"
                rows={5}
                required
                className="w-full p-3 rounded-xl border border-border bg-surface text-foreground text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none resize-y"
              />
            </div>

            {/* Mock Attachment Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {t('attachmentLabel')}
              </label>
              <label className="border-2 border-dashed border-border hover:border-teal-600 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-surface-muted/30 transition">
                <UploadCloud className="w-6 h-6 text-foreground-muted mb-1" />
                <span className="text-xs font-semibold text-foreground">
                  {fileName ? fileName : t('fileUploadPlaceholder')}
                </span>
                <span className="text-[10px] text-foreground-muted mt-0.5">{t('fileHint')}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                />
              </label>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? t('submitting') : t('submitBtn')}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
