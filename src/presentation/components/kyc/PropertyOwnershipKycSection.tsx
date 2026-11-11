'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { Select } from '@/presentation/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/presentation/components/ui/Table';
import { container } from '@/infrastructure/di/container';
import { PropertyOwnershipDoc } from '@/domain/entities/Billing';
import { LandlordRoomItem } from '@/domain/entities/LandlordRoom';
import { toast } from '@/presentation/stores/toast.store';
import { formatIsoDateTime } from '@/shared/utils/format-vnd';
import { ShieldCheck, Upload } from 'lucide-react';

export function PropertyOwnershipKycSection() {
  const t = useTranslations('sprint3.ownershipKyc');
  const tc = useTranslations('sprint3.common');
  const [rooms, setRooms] = useState<LandlordRoomItem[]>([]);
  const [roomId, setRoomId] = useState('');
  const [docs, setDocs] = useState<PropertyOwnershipDoc[]>([]);
  const [docType, setDocType] = useState('LAND_USE_RIGHT_CERT');
  const [rawNumber, setRawNumber] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      const res = await container.landlord.landlordRoomRepository.getRooms({ page: 0, size: 50 });
      const items = res.data || [];
      setRooms(items);
      if (items.length > 0 && !roomId) {
        setRoomId(String(items[0].id));
      }
    } catch {
      toast.error(tc('loadError'));
    }
  }, [roomId, tc]);

  const loadDocs = useCallback(async (selectedRoomId: string) => {
    if (!selectedRoomId) return;
    try {
      const list = await container.ownershipKyc.ownershipKycRepository.getDocsByRoom(selectedRoomId);
      setDocs(list);
    } catch {
      setDocs([]);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (roomId) loadDocs(roomId);
  }, [roomId, loadDocs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !file) {
      toast.error(tc('actionError'));
      return;
    }
    setIsSubmitting(true);
    try {
      const uploaded = await container.ownershipKyc.ownershipKycRepository.uploadPrivateFile(file);
      const created = await container.ownershipKyc.ownershipKycRepository.uploadOwnershipDoc(roomId, {
        docType,
        fileUrl: uploaded.objectKey,
        rawNumber: rawNumber.trim() || undefined,
        expiresAt: expiresAt ? `${expiresAt}T23:59:59` : undefined,
      });
      setDocs((prev) => [created, ...prev]);
      setRawNumber('');
      setExpiresAt('');
      setFile(null);
      toast.success(tc('actionSuccess'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : tc('actionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-stone-900 dark:text-stone-100">{t('bannerTitle')}</p>
            <p className="text-stone-600 dark:text-stone-300">{t('bannerDesc')}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{t('uploadTitle')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('selectRoom')}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              options={
                rooms.length > 0
                  ? rooms.map((r) => ({ value: String(r.id), label: `#${r.id} - ${r.title}` }))
                  : [{ value: '', label: tc('empty') }]
              }
            />
            <Select
              label={t('docType')}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              options={[
                { value: 'LAND_USE_RIGHT_CERT', label: 'GCN QSDD / Sổ hồng' },
                { value: 'AUTHORIZATION_CONTRACT', label: 'Hợp đồng ủy quyền cho thuê' },
                { value: 'SUBLEASE_AGREEMENT', label: 'Hợp đồng thuê lại hợp pháp' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('rawNumber')}
              value={rawNumber}
              onChange={(e) => setRawNumber(e.target.value)}
            />
            <Input
              label={t('expiresAt')}
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t('fileLabel')}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              {t('submitBtn')}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 text-xs font-bold">
          {t('docsTableTitle')}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t('docType')}</TableHead>
              <TableHead>{t('rawNumber')}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-stone-500 py-6">
                  {t('empty')}
                </TableCell>
              </TableRow>
            ) : (
              docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-xs">{d.docType}</TableCell>
                  <TableCell className="font-mono text-xs">{d.maskedNumber || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'APPROVED' ? 'success' : d.status === 'REJECTED' ? 'danger' : 'warning'} size="sm">
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">{formatIsoDateTime(d.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
