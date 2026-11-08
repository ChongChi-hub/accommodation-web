import {
  KycRepository,
  KycModerationListParams,
  KycModerationPageResult,
} from '@/domain/repositories/KycRepository';
import { KycModerationDetail } from '@/domain/entities/LandlordKyc';

export class KycModerationUseCases {
  constructor(private readonly kycRepo: KycRepository) {}

  async getModerationList(params?: KycModerationListParams): Promise<KycModerationPageResult> {
    return this.kycRepo.getModerationKycList(params);
  }

  async getModerationDetail(id: string): Promise<KycModerationDetail> {
    if (!id) throw new Error('Mã hồ sơ KYC không hợp lệ');
    return this.kycRepo.getModerationKycDetail(id);
  }

  async approve(id: string, version: number): Promise<void> {
    if (!id) throw new Error('Mã hồ sơ KYC không hợp lệ');
    return this.kycRepo.approveKyc(id, version);
  }

  async reject(id: string, reasonCode: string, reasonNote: string, version: number): Promise<void> {
    if (!id) throw new Error('Mã hồ sơ KYC không hợp lệ');
    if (!reasonCode) throw new Error('Vui lòng chọn lý do từ chối');
    return this.kycRepo.rejectKyc(id, reasonCode, reasonNote || '', version);
  }

  async getImage(id: string, side: 'front' | 'back'): Promise<Blob> {
    return this.kycRepo.getModerationKycImage(id, side);
  }
}

