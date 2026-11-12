'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Dialog } from '@/presentation/components/ui/Dialog';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Breadcrumb } from '@/presentation/components/ui/Breadcrumb';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { container } from '@/infrastructure/di/container';
import { Contract, ContractAmendment, ContractOccupant } from '@/domain/entities/Contract';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDate, formatIsoDateTime, formatVnd } from '@/shared/utils/format-vnd';
import { CheckCircle2, Download, PenTool, PlusCircle, Trash2, Users } from 'lucide-react';

interface ContractDetailWorkspaceProps {
  contractId: string;
  role: 'TENANT' | 'LANDLORD';
  backHref: string;
}

export function ContractDetailWorkspace({ contractId, role, backHref }: ContractDetailWorkspaceProps) {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const [contract, setContract] = useState<Contract | null>(null);
  const [occupants, setOccupants] = useState<ContractOccupant[]>([]);
  const [amendments, setAmendments] = useState<ContractAmendment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signOpen, setSignOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [busy, setBusy] = useState(false);

  const [occForm, setOccForm] = useState({ fullName: '', phoneNumber: '', idCardNumber: '', relationship: 'BAN_CUNG_PHONG' });
  const [amendForm, setAmendForm] = useState({ amendmentType: 'RENT_ADJUSTMENT', newRent: '', newEndDate: '', effectiveDate: '', reason: '' });

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [c, occ, amd] = await Promise.all([
        container.contract.contractRepository.getContract(contractId),
        container.contract.contractRepository.getOccupants(contractId).catch(() => []),
        container.contract.contractRepository.getAmendments(contractId).catch(() => []),
      ]);
      setContract(c);
      setOccupants(occ);
      setAmendments(amd);
    } catch {
      toast.error(tc('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [contractId, tc]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated =
        role === 'TENANT'
          ? await container.contract.contractRepository.signTenant(contractId, otp.trim(), signatureText.trim() || undefined)
          : await container.contract.contractRepository.signLandlord(contractId, otp.trim(), signatureText.trim() || undefined);
      setContract(updated);
      setSignOpen(false);
      setOtp('');
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const { signedUrl } = await container.contract.contractRepository.getSignedPdfUrl(contractId);
      const blob = await container.contract.contractRepository.downloadPdfBlob(signedUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract?.contractCode || contractId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    }
  };

  const handleAddOccupant = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const added = await container.contract.contractRepository.addOccupant(contractId, {
        ...occForm,
        primaryTenant: false,
      });
      setOccupants((prev) => [...prev, added]);
      setOccForm({ fullName: '', phoneNumber: '', idCardNumber: '', relationship: 'BAN_CUNG_PHONG' });
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleCreateAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await container.contract.contractRepository.createAmendment(contractId, {
        amendmentType: amendForm.amendmentType,
        newRent: amendForm.newRent ? Number(amendForm.newRent) : undefined,
        newEndDate: amendForm.newEndDate || undefined,
        effectiveDate: amendForm.effectiveDate,
        reason: amendForm.reason,
      });
      setAmendments((prev) => [created, ...prev]);
      setAmendForm({ amendmentType: 'RENT_ADJUSTMENT', newRent: '', newEndDate: '', effectiveDate: '', reason: '' });
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  const handleSignAmendment = async (amendmentId: string) => {
    setBusy(true);
    try {
      const updated =
        role === 'TENANT'
          ? await container.contract.contractRepository.signAmendmentTenant(amendmentId)
          : await container.contract.contractRepository.signAmendmentLandlord(amendmentId);
      setAmendments((prev) => prev.map((a) => (a.id === amendmentId ? updated : a)));
      await loadAll();
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !contract) {
    return <Skeleton className="h-96 w-full max-w-4xl rounded-xl" />;
  }

  const alreadySigned = role === 'TENANT' ? Boolean(contract.tenantSignedAt) : Boolean(contract.landlordSignedAt);

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[{ label: t('tenantTitle'), href: backHref }, { label: contract.contractCode }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">{contract.contractCode}</h1>
            <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'warning'} size="md">{contract.status}</Badge>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{t('legalRef')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleDownloadPdf}>
            {t('downloadPdf')}
          </Button>
          {!alreadySigned && (
            <Button variant="primary" size="sm" leftIcon={<PenTool className="w-3.5 h-3.5" />} onClick={() => setSignOpen(true)}>
              {t('signNow')}
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6 space-y-4 text-xs">
        <div className="text-center border-b border-stone-200 dark:border-stone-800 pb-4">
          <p className="font-bold uppercase">{t('legalHeader')}</p>
          <p className="italic text-stone-500">{t('legalMotto')}</p>
          <h2 className="text-base font-bold uppercase pt-2">{t('legalTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p>{t('roomIdLabel')}: <strong>#{contract.roomId}</strong></p>
          <p>{t('tenantIdLabel')}: <strong className="font-mono">{contract.tenantId}</strong></p>
          <p>{t('startDate')}: <strong>{formatIsoDate(contract.startDate)}</strong></p>
          <p>{t('endDate')}: <strong>{formatIsoDate(contract.endDate)}</strong></p>
          <p>{t('monthlyRent')}: <strong className="text-teal-700">{formatVnd(contract.monthlyRent)}</strong></p>
          <p>{t('depositAmount')}: <strong className="text-teal-700">{formatVnd(contract.depositAmount)}</strong></p>
        </div>
        {contract.terms && <p className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900 whitespace-pre-wrap">{contract.terms}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${contract.landlordSignedAt ? 'text-emerald-600' : 'text-stone-300'}`} />
            <span>{t('landlordSigned')}: {contract.landlordSignedAt ? formatIsoDateTime(contract.landlordSignedAt) : t('unsigned')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${contract.tenantSignedAt ? 'text-emerald-600' : 'text-stone-300'}`} />
            <span>{t('tenantSigned')}: {contract.tenantSignedAt ? formatIsoDateTime(contract.tenantSignedAt) : t('unsigned')}</span>
          </div>
        </div>
        {contract.documentHash && (
          <p className="font-mono text-[11px] text-stone-400 break-all">{t('docHash')}: {contract.documentHash}</p>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4" />{t('occupantsTitle')} ({occupants.length})</h3>
        <div className="space-y-2 text-xs">
          {occupants.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900">
              <span><strong>{o.fullName}</strong> • {o.phoneNumber} • CCCD: {o.idCardNumber}</span>
              {role === 'LANDLORD' && !o.primaryTenant && (
                <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={async () => {
                  await container.contract.contractRepository.removeOccupant(contractId, o.id);
                  setOccupants((prev) => prev.filter((item) => item.id !== o.id));
                }}>{t('remove')}</Button>
              )}
            </div>
          ))}
        </div>
        {role === 'LANDLORD' && (
          <form onSubmit={handleAddOccupant} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            <Input placeholder={t('fullName')} required value={occForm.fullName} onChange={(e) => setOccForm((p) => ({ ...p, fullName: e.target.value }))} />
            <Input placeholder={t('phone')} required value={occForm.phoneNumber} onChange={(e) => setOccForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
            <Input placeholder={t('idCard')} required value={occForm.idCardNumber} onChange={(e) => setOccForm((p) => ({ ...p, idCardNumber: e.target.value }))} />
            <Button type="submit" variant="outline" size="sm" isLoading={busy} leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>{t('addOccupant')}</Button>
          </form>
        )}
      </Card>

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
                <Button variant="primary" size="sm" isLoading={busy} onClick={() => handleSignAmendment(a.id)}>{t('signAmendment')}</Button>
              )}
            </div>
          ))}
        </div>
        {role === 'LANDLORD' && contract.status === 'ACTIVE' && (
          <form onSubmit={handleCreateAmendment} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            <Select value={amendForm.amendmentType} onChange={(e) => setAmendForm((p) => ({ ...p, amendmentType: e.target.value }))} options={[{ value: 'RENT_ADJUSTMENT', label: 'RENT_ADJUSTMENT' }, { value: 'TERM_EXTENSION', label: 'TERM_EXTENSION' }]} />
            <Input type="number" placeholder={t('newRent')} value={amendForm.newRent} onChange={(e) => setAmendForm((p) => ({ ...p, newRent: e.target.value }))} />
            <Input type="date" placeholder={t('effectiveDate')} required value={amendForm.effectiveDate} onChange={(e) => setAmendForm((p) => ({ ...p, effectiveDate: e.target.value }))} />
            <Input placeholder={t('reason')} required value={amendForm.reason} onChange={(e) => setAmendForm((p) => ({ ...p, reason: e.target.value }))} />
            <Button type="submit" variant="outline" size="sm" isLoading={busy}>{t('createAmendment')}</Button>
          </form>
        )}
      </Card>

      <Dialog isOpen={signOpen} onClose={() => setSignOpen(false)} title={t('signTitle')} size="sm">
        <form onSubmit={handleSign} className="space-y-4 pt-2">
          <Input label={t('otpLabel')} required pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Input label={t('signatureLabel')} value={signatureText} onChange={(e) => setSignatureText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSignOpen(false)}>{tc('cancel')}</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={busy}>{tc('confirm')}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

