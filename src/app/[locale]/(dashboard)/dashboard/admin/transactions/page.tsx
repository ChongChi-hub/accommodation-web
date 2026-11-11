'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { ApiClient } from '@/infrastructure/http/api-client';
import { container } from '@/infrastructure/di/container';
import { AdminFinancialStats, RefundItem } from '@/domain/entities/Billing';
import { AccountItem, AdjustmentRequest, ReconciliationSummary } from '@/presentation/components/admin/transactions/types';
import { ReconTab } from '@/presentation/components/admin/transactions/ReconTab';
import { MakerCheckerAndRefundsTab } from '@/presentation/components/admin/transactions/MakerCheckerAndRefundsTab';
import { ExportTab } from '@/presentation/components/admin/transactions/ExportTab';
import { Scale } from 'lucide-react';

export default function AdminTransactionsAndLedgerPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'RECON' | 'MAKER_CHECKER' | 'EXPORT'>('RECON');
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);

  const [reconData, setReconData] = useState<ReconciliationSummary | null>(null);
  const [adminStats, setAdminStats] = useState<AdminFinancialStats | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reconRes, statsRes, accsRes, reqsRes, refundsRes] = await Promise.all([
        ApiClient.request<ReconciliationSummary>('/billing/ledger/reconcile-now', { method: 'POST' }),
        container.billing.billingRepository.getAdminDashboardStats().catch(() => null),
        ApiClient.request<AccountItem[]>('/billing/ledger/accounts'),
        ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests'),
        container.billing.billingRepository.getAdminRefunds().catch(() => []),
      ]);
      setReconData(reconRes);
      setAdminStats(statsRes);
      setAccounts(accsRes || []);
      setRequests(reqsRes || []);
      setRefunds(refundsRes);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Unable to load ledger data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleRunReconcile = async () => {
    setIsReconciling(true);
    try {
      const res = await ApiClient.request<ReconciliationSummary>('/billing/ledger/reconcile-now', { method: 'POST' });
      setReconData(res);
      toast.success('Reconciliation completed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reconciliation failed');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-600" />
          Double-Entry Ledger & Financial Oversight
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={activeTab === 'RECON' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('RECON')}>Reconciliation</Button>
        <Button variant={activeTab === 'MAKER_CHECKER' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('MAKER_CHECKER')}>Maker-Checker & Refunds</Button>
        <Button variant={activeTab === 'EXPORT' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('EXPORT')}>Export CSV</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : activeTab === 'RECON' ? (
        <ReconTab reconData={reconData} adminStats={adminStats} isReconciling={isReconciling} onRunReconcile={handleRunReconcile} />
      ) : activeTab === 'MAKER_CHECKER' ? (
        <MakerCheckerAndRefundsTab
          accounts={accounts}
          requests={requests}
          refunds={refunds}
          currentUserId={currentUser?.id}
          onCreateAdjustment={async (payload) => {
            await ApiClient.post('/billing/maker-checker/adjustment', payload);
            const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
            setRequests(reqsRes || []);
            toast.success('Adjustment request created');
          }}
          onApprove={async (req) => {
            await ApiClient.post(`/billing/maker-checker/${req.id}/approve`);
            await loadInitialData();
            toast.success('Adjustment approved');
          }}
          onReject={async (req) => {
            await ApiClient.post(`/billing/maker-checker/${req.id}/reject`, { reason: 'Rejected by checker' });
            const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
            setRequests(reqsRes || []);
            toast.success('Adjustment rejected');
          }}
          onApproveRefund={async (id) => {
            const updated = await container.billing.billingRepository.approveRefund(id);
            setRefunds((prev) => prev.map((x) => (x.id === id ? updated : x)));
            toast.success('Refund approved');
          }}
        />
      ) : (
        <ExportTab accounts={accounts} />
      )}
    </div>
  );
}
