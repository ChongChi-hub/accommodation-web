import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatVnd, generateIdempotencyKey } from '@/shared/utils/format-vnd';
import { buildAppointmentIcs } from '@/shared/utils/appointment-ics';
import { HttpRentalRequestRepository } from '../http-rental-request.repository';
import { HttpContractRepository } from '../http-contract.repository';
import { HttpBillingRepository } from '../http-billing.repository';
import { ApiClient } from '@/infrastructure/http/api-client';

describe('Sprint 3 Frontend Utilities & Repositories', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats integer VND consistently and generates unique idempotency keys', () => {
    expect(formatVnd(4800000)).toContain('4.800.000');
    expect(formatVnd(null)).toBe('0 đ');
    const k1 = generateIdempotencyKey('rent');
    const k2 = generateIdempotencyKey('rent');
    expect(k1).not.toBe(k2);
    expect(k1.startsWith('rent-')).toBe(true);
  });

  it('routes rental request calls to booking endpoints', async () => {
    const postSpy = vi.spyOn(ApiClient, 'post').mockResolvedValue({ id: 'req-1' });
    const getSpy = vi.spyOn(ApiClient, 'get').mockResolvedValue([]);
    const repo = new HttpRentalRequestRepository();

    await repo.createRequest({
      roomId: '10',
      landlordId: '2',
      proposedMoveInDate: '2026-12-01',
      numOccupants: 1,
      idempotencyKey: 'k-1',
    });
    await repo.getTenantRequests();

    expect(postSpy).toHaveBeenCalledWith('/booking/rental-requests', expect.objectContaining({ roomId: '10' }));
    expect(getSpy).toHaveBeenCalledWith('/booking/rental-requests/tenant');
  });

  it('routes contract OTP signing & occupants to booking contract endpoints', async () => {
    const postSpy = vi.spyOn(ApiClient, 'post').mockResolvedValue({ id: 'c-1' });
    const repo = new HttpContractRepository();

    await repo.signTenant('c-1', '123456', 'Nguyen Van A');
    expect(postSpy).toHaveBeenCalledWith('/booking/contracts/c-1/sign-tenant', {
      otpCode: '123456',
      signatureText: 'Nguyen Van A',
    });

    await repo.signAmendmentTenant('amd-1', '654321', 'Nguyen Van A');
    expect(postSpy).toHaveBeenCalledWith('/booking/contracts/amendments/amd-1/sign-tenant', {
      otpCode: '654321',
      signatureText: 'Nguyen Van A',
    });

    const ics = buildAppointmentIcs({
      id: 'appt-1',
      title: 'CozyNest: Phong 101',
      location: 'Q1, HCMC',
      startIso: '2026-12-01T09:00:00Z',
    });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:CozyNest: Phong 101');
  });

  it('routes billing payment intent, refund, and stats to exact billing endpoints', async () => {
    const postSpy = vi.spyOn(ApiClient, 'post').mockResolvedValue({ id: 'pay-1' });
    const getSpy = vi.spyOn(ApiClient, 'get').mockResolvedValue({});
    const repo = new HttpBillingRepository();

    await repo.createPaymentIntent({ orderType: 'DEPOSIT', orderId: 'c-1', amount: 2000000 });
    await repo.getTenantDashboardStats();

    expect(postSpy).toHaveBeenCalledWith('/billing/payments/intent', {
      orderType: 'DEPOSIT',
      orderId: 'c-1',
      amount: 2000000,
    });
    expect(getSpy).toHaveBeenCalledWith('/billing/dashboard/tenant');

    await repo.simulateSandboxWebhook({ paymentCode: 'PAY-1', amount: 2000000, status: 'PAID', timestamp: 1700000000 });
    expect(postSpy).toHaveBeenCalledWith('/billing/payments/sandbox/simulate-webhook', {
      paymentCode: 'PAY-1',
      amount: 2000000,
      status: 'PAID',
      timestamp: 1700000000,
    });
  });
});

