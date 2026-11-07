import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KycModerationUseCases } from './kyc-moderation.use-cases';
import { KycRepository } from '@/domain/repositories/KycRepository';
import { KycModerationDetail } from '@/domain/entities/LandlordKyc';

describe('KycModerationUseCases', () => {
  let mockKycRepo: Partial<KycRepository>;
  let useCases: KycModerationUseCases;

  const sampleDetail: KycModerationDetail = {
    id: 'kyc-mod-1',
    userId: 'u-landlord-02',
    userEmail: 'landlord2@toam.vn',
    userPhone: '0900000002',
    fullNameOnId: 'Tran Thi B',
    idNumberMasked: '********0002',
    dateOfBirth: '1990-02-20',
    issueDate: '2020-03-15',
    issuePlace: 'CA Ha Noi',
    status: 'PENDING',
    attemptCount: 1,
    submittedAt: '2026-03-01T10:00:00Z',
    version: 1,
    hasFrontImage: true,
    hasBackImage: true,
  };

  beforeEach(() => {
    mockKycRepo = {
      getModerationKycList: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'kyc-mod-1',
            userId: 'u-landlord-02',
            userEmail: 'landlord2@toam.vn',
            userPhone: '0900000002',
            fullNameOnId: 'Tran Thi B',
            idNumberMasked: '********0002',
            status: 'PENDING',
            attemptCount: 1,
            submittedAt: '2026-03-01T10:00:00Z',
          },
        ],
        total: 1,
        page: 0,
        totalPages: 1,
      }),
      getModerationKycDetail: vi.fn().mockResolvedValue(sampleDetail),
      approveKyc: vi.fn().mockResolvedValue(undefined),
      rejectKyc: vi.fn().mockResolvedValue(undefined),
      getModerationKycImage: vi.fn().mockResolvedValue(new Blob(['mock'])),
    };
    useCases = new KycModerationUseCases(mockKycRepo as KycRepository);
  });

  it('should list moderation requests', async () => {
    const list = await useCases.getModerationList({ status: 'PENDING' });
    expect(list.total).toBe(1);
    expect(list.items[0].fullNameOnId).toBe('Tran Thi B');
  });

  it('should get detail of KYC request', async () => {
    const detail = await useCases.getModerationDetail('kyc-mod-1');
    expect(detail.id).toBe('kyc-mod-1');
    expect(detail.idNumberMasked).toBe('********0002');
  });

  it('should approve KYC request with optimistic locking version', async () => {
    await useCases.approve('kyc-mod-1', 1);
    expect(mockKycRepo.approveKyc).toHaveBeenCalledWith('kyc-mod-1', 1);
  });

  it('should reject KYC request with reason code and version', async () => {
    await useCases.reject('kyc-mod-1', 'BLURRY_IMAGE', 'Anh bi mo', 1);
    expect(mockKycRepo.rejectKyc).toHaveBeenCalledWith('kyc-mod-1', 'BLURRY_IMAGE', 'Anh bi mo', 1);
  });

  it('should reject if reason code is missing', async () => {
    await expect(useCases.reject('kyc-mod-1', '', '', 1)).rejects.toThrow('Vui lòng chọn lý do từ chối');
  });
});

