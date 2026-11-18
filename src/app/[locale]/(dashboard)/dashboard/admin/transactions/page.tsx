'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { toast } from '@/presentation/stores/toast.store';
import { useAuthStore } from '@/presentation/stores/auth.store';
import { ApiClient } from '@/infrastructure/http/api-client';
import { container } from '@/infrastructure/di/container';
import { AdminFinancialStats, PayoutItem, RefundItem, RiskProfile } from '@/domain/entities/Billing';
import {
  AccountItem,
  AdjustmentRequest,
  AdminPaymentIntentItem,
  JournalEntryDetailItem,
  ReconciliationSummary,
} from '@/presentation/components/admin/transactions/types';
import { ReconTab } from '@/presentation/components/admin/transactions/ReconTab';
import { TransactionsHistoryTab } from '@/presentation/components/admin/transactions/TransactionsHistoryTab';
import { MakerCheckerAndRefundsTab } from '@/presentation/components/admin/transactions/MakerCheckerAndRefundsTab';
import { RiskTab } from '@/presentation/components/admin/transactions/RiskTab';
import { ExportTab } from '@/presentation/components/admin/transactions/ExportTab';
import { Scale } from 'lucide-react';

export default function AdminTransactionsAndLedgerPage() {
  const tl = useTranslations('sprint3.ledger');
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'RECON' | 'TRANSACTIONS' | 'MAKER_CHECKER' | 'RISK' | 'EXPORT'>('RECON');
  const [isLoading, setIsLoading] = useState(true);
  const [isReconciling, setIsReconciling] = useState(false);

  const [reconData, setReconData] = useState<ReconciliationSummary | null>(null);
  const [adminStats, setAdminStats] = useState<AdminFinancialStats | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [entries, setEntries] = useState<JournalEntryDetailItem[]>([]);
  const [intents, setIntents] = useState<AdminPaymentIntentItem[]>([]);
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reconRes, statsRes, accsRes, entriesRes, intentsRes, reqsRes, refundsRes, payoutsRes, profilesRes] =
        await Promise.all([
          ApiClient.request<ReconciliationSummary>('/billing/ledger/reconcile-now', { method: 'POST' }),
          container.billing.billingRepository.getAdminDashboardStats().catch(() => null),
          ApiClient.request<AccountItem[]>('/billing/ledger/accounts'),
          ApiClient.request<JournalEntryDetailItem[]>('/billing/ledger/entries?limit=100').catch(() => []),
          ApiClient.request<AdminPaymentIntentItem[]>('/billing/payments/admin?limit=100').catch(() => []),
          ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests'),
          container.billing.billingRepository.getAdminRefunds().catch(() => []),
          container.billing.billingRepository.getAdminPayouts().catch(() => []),
          container.billing.billingRepository.getRiskProfiles().catch(() => []),
        ]);
      setReconData(reconRes);
      setAdminStats(statsRes);
      setAccounts(accsRes || []);
      setEntries(entriesRes || []);
      setIntents(intentsRes || []);
      setRequests(reqsRes || []);
      setRefunds(refundsRes);
      setPayouts(payoutsRes);
      setRiskProfiles(profilesRes);
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
      toast.success('Đối soát sổ cái kép hoàn tất');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Đối soát thất bại');
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-600" />
          {tl('title')}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={activeTab === 'RECON' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('RECON')}>
          {tl('reconTab')}
        </Button>
        <Button
          variant={activeTab === 'TRANSACTIONS' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('TRANSACTIONS')}
        >
          Lịch sử Giao dịch &amp; Sổ cái ({entries.length})
        </Button>
        <Button
          variant={activeTab === 'MAKER_CHECKER' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('MAKER_CHECKER')}
        >
          {tl('makerTab')}
        </Button>
        <Button variant={activeTab === 'RISK' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('RISK')}>
          Kiểm soát rủi ro (FIN-RISK)
        </Button>
        <Button variant={activeTab === 'EXPORT' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('EXPORT')}>
          {tl('exportTab')}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : activeTab === 'RECON' ? (
        <ReconTab
          reconData={reconData}
          adminStats={adminStats}
          isReconciling={isReconciling}
          onRunReconcile={handleRunReconcile}
        />
      ) : activeTab === 'TRANSACTIONS' ? (
        <TransactionsHistoryTab entries={entries} intents={intents} />
      ) : activeTab === 'MAKER_CHECKER' ? (
        <MakerCheckerAndRefundsTab
          accounts={accounts}
          requests={requests}
          refunds={refunds}
          payouts={payouts}
          currentUserId={currentUser?.id}
          onCreateAdjustment={async (payload) => {
            await ApiClient.post('/billing/maker-checker/adjustment', payload);
            const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
            setRequests(reqsRes || []);
            toast.success('Đã tạo yêu cầu điều chỉnh sổ cái (chờ Checker duyệt)');
          }}
          onApprove={async (req) => {
            await ApiClient.post(`/billing/maker-checker/${req.id}/approve`);
            await loadInitialData();
            toast.success('Đã phê duyệt điều chỉnh và hạch toán vào sổ cái');
          }}
          onReject={async (req, reason) => {
            await ApiClient.post(`/billing/maker-checker/${req.id}/reject`, {
              reason: reason || 'Rejected by checker',
            });
            const reqsRes = await ApiClient.request<AdjustmentRequest[]>('/billing/maker-checker/requests');
            setRequests(reqsRes || []);
            toast.success('Đã từ chối yêu cầu điều chỉnh');
          }}
          onApproveRefund={async (id) => {
            const updated = await container.billing.billingRepository.approveRefund(id);
            setRefunds((prev) => prev.map((x) => (x.id === id ? updated : x)));
            await loadInitialData();
            toast.success('Đã phê duyệt hoàn tiền');
          }}
          onRejectRefund={async (id, reason) => {
            const updated = await container.billing.billingRepository.rejectRefund(id, reason);
            setRefunds((prev) => prev.map((x) => (x.id === id ? updated : x)));
            await loadInitialData();
            toast.success('Đã từ chối yêu cầu hoàn tiền');
          }}
          onRetryRefund={async (id) => {
            const updated = await container.billing.billingRepository.retryRefund(id);
            setRefunds((prev) => prev.map((x) => (x.id === id ? updated : x)));
            await loadInitialData();
            toast.success('Đã thử lại giải ngân hoàn tiền');
          }}
          onApprovePayout={async (id) => {
            const updated = await container.billing.billingRepository.approvePayout(id);
            setPayouts((prev) => prev.map((x) => (x.id === id ? updated : x)));
            await loadInitialData();
            toast.success('Phê duyệt yêu cầu rút tiền thành công');
          }}
          onRejectPayout={async (id, reason) => {
            const updated = await container.billing.billingRepository.rejectPayout(id, reason);
            setPayouts((prev) => prev.map((x) => (x.id === id ? updated : x)));
            await loadInitialData();
            toast.success('Từ chối yêu cầu rút tiền thành công');
          }}
        />
      ) : activeTab === 'RISK' ? (
        <RiskTab
          profiles={riskProfiles}
          onFreeze={async (userId, reason) => {
            const updated = await container.billing.billingRepository.freezeUser(userId, reason);
            setRiskProfiles((prev) => {
              const exists = prev.some((p) => p.userId === userId);
              return exists ? prev.map((p) => (p.userId === userId ? updated : p)) : [updated, ...prev];
            });
            toast.success(`Đã phong tỏa tài khoản ${userId}`);
          }}
          onUnfreeze={async (userId) => {
            const updated = await container.billing.billingRepository.unfreezeUser(userId);
            setRiskProfiles((prev) => prev.map((p) => (p.userId === userId ? updated : p)));
            toast.success(`Đã mở khóa tài khoản ${userId}`);
          }}
          onBlacklist={async (userId, reason) => {
            const updated = await container.billing.billingRepository.blacklistUser(userId, reason);
            setRiskProfiles((prev) => {
              const exists = prev.some((p) => p.userId === userId);
              return exists ? prev.map((p) => (p.userId === userId ? updated : p)) : [updated, ...prev];
            });
            toast.success(`Đã đưa tài khoản ${userId} vào Blacklist`);
          }}
          onRefresh={loadInitialData}
        />
      ) : (
        <ExportTab accounts={accounts} />
      )}
    </div>
  );
}
