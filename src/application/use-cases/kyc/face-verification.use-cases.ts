import { FaceVerificationRepository } from '@/domain/repositories/FaceVerificationRepository';
import {
  FaceChallenge,
  FaceStatus,
  FaceModerationDetail,
} from '@/domain/entities/FaceVerification';

export class FaceVerificationUseCases {
  constructor(private readonly repository: FaceVerificationRepository) {}

  async createChallenge(consent: boolean): Promise<FaceChallenge> {
    if (!consent) {
      throw new Error('Bạn cần đồng ý với điều khoản thu thập dữ liệu sinh trắc học');
    }
    return await this.repository.createChallenge(consent);
  }

  async submitFrames(formData: FormData): Promise<FaceStatus> {
    return await this.repository.submitFrames(formData);
  }

  async getStatus(): Promise<FaceStatus> {
    return await this.repository.getStatus();
  }

  async revokeConsent(): Promise<void> {
    return await this.repository.revokeConsent();
  }

  async getModerationFaceDetail(kycId: string): Promise<FaceModerationDetail> {
    return await this.repository.getModerationFaceDetail(kycId);
  }

  async getModerationFrameBlob(kycId: string, frameId: string): Promise<Blob> {
    return await this.repository.getModerationFrameBlob(kycId, frameId);
  }

  async decide(
    kycId: string,
    decision: 'PASSED' | 'FAILED',
    reasonCode?: string,
    note?: string,
    version?: number
  ): Promise<void> {
    if (decision === 'FAILED' && !reasonCode) {
      throw new Error('Vui lòng chọn lý do từ chối xác thực khuôn mặt');
    }
    return await this.repository.decideFace(kycId, decision, reasonCode, note, version);
  }
}

