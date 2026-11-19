import { describe, expect, it, vi, beforeEach } from 'vitest';
import { formatShortRef } from './WalletVerification';
import { ApiClient } from '@/infrastructure/http/api-client';
import { walletVerificationRepository } from '@/infrastructure/repositories/http-wallet-verification.repository';

describe('WalletVerification domain helpers & repository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats long UUID into short human-readable reference without raw UUID', () => {
    expect(formatShortRef('d8082a0f-c5c9-4d62-9016-1e493f66057c', 'HD')).toBe('HD-3F66057C');
    expect(formatShortRef('9fccca0f-e9f8-44ab-ae58-d8478b771a4f', 'HD')).toBe('HD-8B771A4F');
    expect(formatShortRef('TOAM123456', 'HD')).toBe('TOAM123456');
    expect(formatShortRef(null)).toBe('--');
    expect(formatShortRef(undefined)).toBe('--');
  });

  it('calls wallet summary and ledger endpoints cleanly', async () => {
    const getSpy = vi.spyOn(ApiClient, 'get').mockResolvedValueOnce({
      availableBalance: 1140000,
      pendingBalance: 5000,
      withdrawalHoldBalance: 0,
      escrowRetainedBalance: 5000,
      commissionPercent: 5,
      depositReleasePercent: 50,
      withdrawalHoldDays: 0,
      withdrawalMinAmount: 1000,
    }).mockResolvedValueOnce([]);

    const summary = await walletVerificationRepository.getLandlordWalletSummary();
    const ledger = await walletVerificationRepository.getLandlordWalletLedger(50);

    expect(summary.availableBalance).toBe(1140000);
    expect(summary.commissionPercent).toBe(5);
    expect(summary.depositReleasePercent).toBe(50);
    expect(ledger).toEqual([]);
    expect(getSpy).toHaveBeenNthCalledWith(1, '/billing/wallet/summary');
    expect(getSpy).toHaveBeenNthCalledWith(2, '/billing/wallet/ledger?limit=50');
  });

  it('sends Idempotency-Key header when creating withdrawal request', async () => {
    const reqSpy = vi.spyOn(ApiClient, 'request').mockResolvedValueOnce({
      id: 'payout-1',
      payoutCode: 'PO-2026-0001',
      status: 'REQUESTED',
      amount: 500000,
    });

    const res = await walletVerificationRepository.requestPayoutIdempotent(
      {
        amount: 500000,
        bankCode: 'VCB',
        accountNumber: '1042701900',
        accountHolder: 'LE THANH CUONG',
        otp: '123456',
      },
      'idem-test-001'
    );

    expect(res.status).toBe('REQUESTED');
    expect(reqSpy).toHaveBeenCalledWith(
      '/billing/payouts',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Idempotency-Key': 'idem-test-001' },
      })
    );
  });

  it('posts confirm-paid with unique bankTxCode and cancel payout cleanly', async () => {
    const postSpy = vi.spyOn(ApiClient, 'post')
      .mockResolvedValueOnce({ id: 'p-1', status: 'PAID', bankTxCode: 'FT261119001' })
      .mockResolvedValueOnce({ id: 'p-2', status: 'CANCELLED' });

    const paid = await walletVerificationRepository.confirmPayoutPaid('p-1', {
      bankTxCode: 'FT261119001',
      note: 'Admin transferred',
    });
    const cancelled = await walletVerificationRepository.cancelPayout('p-2');

    expect(paid.status).toBe('PAID');
    expect(cancelled.status).toBe('CANCELLED');
    expect(postSpy).toHaveBeenNthCalledWith(1, '/billing/payouts/p-1/confirm-paid', {
      bankTxCode: 'FT261119001',
      note: 'Admin transferred',
    });
    expect(postSpy).toHaveBeenNthCalledWith(2, '/billing/payouts/p-2/cancel');
  });
});
