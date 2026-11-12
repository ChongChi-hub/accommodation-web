'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Contract, ContractAmendment } from '@/domain/entities/Contract';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate } from '@/shared/utils/format-vnd';

interface ContractAmendmentsSectionProps {
  contract: Contract;
  role: 'TENANT' | 'LANDLORD';
  amendments: ContractAmendment[];
  onAmendmentCreated: (a: ContractAmendment) => void;
  onAmendmentSigned: (a: ContractAmendment) => Promise<void>;
}

export function ContractAmendmentsSection({
  contract,
  role,
  amendments,
  onAmendmentCreated,
  onAmendmentSigned,
}: ContractAmendmentsSectionProps) {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const [busy, setBusy] = useState(false);
  const [signingTarget, setSigningTarget] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [amendForm, setAmendForm] = useState({
    amendmentType: 'RENT_ADJUSTMENT',
    newRent: '',
    newEndDate: '',
    effectiveDate: '',
    reason: '',
  });

  const handleCreateAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await container.contract.contractRepository.createAmendment(contract.id, {
        amendmentType: amendForm.amendmentType,
        newRent: amendForm.newRent ? Number(amendForm.newRent) : undefined,
        newEndDate: amendForm.newEndDate || undefined,
        effectiveDate: amendForm.effectiveDate,
        reason: amendForm.reason,
      });
      onAmendmentCreated(created);
      setAmendForm({ amendmentType: 'RENT_ADJUSTMENT', newRent: '', newEndDate: '', effectiveDate: '', reason: '' });
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmSignAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingTarget) return;
    setBusy(true);
    try {
      const updated =
        role === 'TENANT'
          ? await container.contract.contractRepository.signAmendmentTenant(signingTarget, otpCode.trim(), signatureText.trim() || undefined)
          : await container.contract.contractRepository.signAmendmentLandlord(signingTarget, otpCode.trim(), signatureText.trim() || undefined);
      await onAmendmentSigned(updated);
      setSigningTarget(null);
      setOtpCode('');
      setSignatureText('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-sm font-bold">{t('amendmentsTitle')} ({amendments.length})</h3>
      <div className="space-y-2 text-xs">
        {amendments.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
            <div>
              <p className="font-bold">{a.amendmentCode} • {a.amendmentType} ({a.status})</p>
              <p className="text-stone-500">{a.reason} • {t('effectiveDate')}: {formatIsoDate(a.effectiveDate)}</p>
            </div>
            {((role === 'TENANT' && !a.tenantSignedAt) || (role === 'LANDLORD' && !a.landlordSignedAt)) && (
              <Button variant="primary" size="sm" isLoading={busy} onClick={() => setSigningTarget(a.id)}>
                {t('signAmendment')}
              </Button>
            )}
          </div>
        ))}
      </div>
      {role === 'LANDLORD' && contract.status === 'ACTIVE' && (
        <form onSubmit={handleCreateAmendment} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
          <Select
            value={amendForm.amendmentType}
            onChange={(e) => setAmendForm((p) => ({ ...p, amendmentType: e.target.value }))}
            options={[{ value: 'RENT_ADJUSTMENT', label: 'RENT_ADJUSTMENT' }, { value: 'TERM_EXTENSION', label: 'TERM_EXTENSION' }]}
          />
          <Input type="number" placeholder={t('newRent')} value={amendForm.newRent} onChange={(e) => setAmendForm((p) => ({ ...p, newRent: e.target.value }))} />
          <Input type="date" placeholder={t('effectiveDate')} required value={amendForm.effectiveDate} onChange={(e) => setAmendForm((p) => ({ ...p, effectiveDate: e.target.value }))} />
          <Input placeholder={t('reason')} required value={amendForm.reason} onChange={(e) => setAmendForm((p) => ({ ...p, reason: e.target.value }))} />
          <Button type="submit" variant="outline" size="sm" isLoading={busy}>{t('createAmendment')}</Button>
        </form>
      )}

      <Dialog isOpen={Boolean(signingTarget)} onClose={() => setSigningTarget(null)} title={t('signAmendment')} size="sm">
        <form onSubmit={handleConfirmSignAmendment} className="space-y-4 pt-2">
          <Input label={t('otpLabel')} required pattern="[0-9]{6}" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
          <Input label={t('signatureLabel')} value={signatureText} onChange={(e) => setSignatureText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSigningTarget(null)}>{tc('cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={busy}>{tc('confirm')}</Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}

