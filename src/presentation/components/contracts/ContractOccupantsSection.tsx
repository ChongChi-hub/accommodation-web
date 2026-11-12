'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { ContractOccupant } from '@/domain/entities/Contract';
import { container } from '@/infrastructure/di/container';
import { toast } from '@/presentation/stores/toast.store';
import { PlusCircle, Trash2, Users } from 'lucide-react';

interface ContractOccupantsSectionProps {
  contractId: string;
  role: 'TENANT' | 'LANDLORD';
  occupants: ContractOccupant[];
  onOccupantAdded: (occ: ContractOccupant) => void;
  onOccupantRemoved: (occupantId: string) => void;
}

export function ContractOccupantsSection({
  contractId,
  role,
  occupants,
  onOccupantAdded,
  onOccupantRemoved,
}: ContractOccupantsSectionProps) {
  const t = useTranslations('sprint3.contract');
  const tc = useTranslations('sprint3.common');
  const [busy, setBusy] = useState(false);
  const [occForm, setOccForm] = useState({
    fullName: '',
    phoneNumber: '',
    idCardNumber: '',
    relationship: 'BAN_CUNG_PHONG',
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const added = await container.contract.contractRepository.addOccupant(contractId, {
        ...occForm,
        primaryTenant: false,
      });
      onOccupantAdded(added);
      setOccForm({ fullName: '', phoneNumber: '', idCardNumber: '', relationship: 'BAN_CUNG_PHONG' });
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t('occupantsTitle')} ({occupants.length})
      </h3>
      <div className="space-y-2 text-xs">
        {occupants.map((o) => (
          <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900">
            <span>
              <strong>{o.fullName}</strong> • {o.phoneNumber} • {t('idCard')}: {o.idCardNumber}
            </span>
            {role === 'LANDLORD' && !o.primaryTenant && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={async () => {
                  await container.contract.contractRepository.removeOccupant(contractId, o.id);
                  onOccupantRemoved(o.id);
                }}
              >
                {t('remove')}
              </Button>
            )}
          </div>
        ))}
      </div>
      {role === 'LANDLORD' && (
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <Input placeholder={t('fullName')} required value={occForm.fullName} onChange={(e) => setOccForm((p) => ({ ...p, fullName: e.target.value }))} />
          <Input placeholder={t('phone')} required value={occForm.phoneNumber} onChange={(e) => setOccForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
          <Input placeholder={t('idCard')} required value={occForm.idCardNumber} onChange={(e) => setOccForm((p) => ({ ...p, idCardNumber: e.target.value }))} />
          <Button type="submit" variant="outline" size="sm" isLoading={busy} leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
            {t('addOccupant')}
          </Button>
        </form>
      )}
    </Card>
  );
}

