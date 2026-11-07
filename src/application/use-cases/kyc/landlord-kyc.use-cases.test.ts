import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LandlordKycUseCases } from './landlord-kyc.use-cases';
import { KycRepository } from '@/domain/repositories/KycRepository';
import { LandlordKycStatus } from '@/domain/entities/LandlordKyc';

describe('LandlordKycUseCases', () => {
  let mockKycRepo: Partial<KycRepository>;
  let useCases: LandlordKycUseCases;

  const sampleStatus: LandlordKycStatus = {
    id: 'kyc-1',
    status: 'APPROVED',
    fullNameOnId: 'Nguyen Van Toan',
    idNumberMasked: '********0001',
    attemptCount: 1,
    remainingAttempts: 3,
    hasFrontImage: true,
    hasBackImage: true,
    canResubmit: false,
  };

  beforeEach(() => {
    mockKycRepo = {
      getLandlordKyc: vi.fn().mockResolvedValue(sampleStatus),
      submitLandlordKyc: vi.fn().mockResolvedValue({ ...sampleStatus, status: 'PENDING' }),
      getKycImage: vi.fn().mockResolvedValue(new Blob(['mock'])),
    };
    useCases = new LandlordKycUseCases(mockKycRepo as KycRepository);
  });

  it('should get current landlord KYC status', async () => {
    const status = await useCases.getKycStatus();
    expect(status.status).toBe('APPROVED');
    expect(status.idNumberMasked).toBe('********0001');
  });

  it('should validate consent before submitting KYC', async () => {
    const file = new File([''], 'id.jpg', { type: 'image/jpeg' });
    await expect(
      useCases.submitKyc({
        fullNameOnId: 'Test',
        idNumber: '001085000001',
        dateOfBirth: '1985-05-15',
        issueDate: '2021-06-10',
        issuePlace: 'CA TP HCM',
        frontImage: file,
        backImage: file,
        consent: false,
      })
    ).rejects.toThrow('Bạn cần đồng ý với điều khoản xử lý dữ liệu cá nhân');
  });

  it('should validate 12-digit CCCD format', async () => {
    const file = new File([''], 'id.jpg', { type: 'image/jpeg' });
    await expect(
      useCases.submitKyc({
        fullNameOnId: 'Test',
        idNumber: '12345',
        dateOfBirth: '1985-05-15',
        issueDate: '2021-06-10',
        issuePlace: 'CA TP HCM',
        frontImage: file,
        backImage: file,
        consent: true,
      })
    ).rejects.toThrow('Số Căn cước công dân phải đúng 12 chữ số');
  });

  it('should submit valid KYC request via FormData', async () => {
    const file = new File(['image-bytes'], 'id.jpg', { type: 'image/jpeg' });
    const res = await useCases.submitKyc({
      fullNameOnId: 'Nguyen Van Toan',
      idNumber: '001085000001',
      dateOfBirth: '1985-05-15',
      issueDate: '2021-06-10',
      issuePlace: 'CA TP HCM',
      frontImage: file,
      backImage: file,
      consent: true,
    });
    expect(res.status).toBe('PENDING');
    expect(mockKycRepo.submitLandlordKyc).toHaveBeenCalledOnce();
  });
});

