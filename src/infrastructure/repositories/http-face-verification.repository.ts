import { FaceVerificationRepository } from '@/domain/repositories/FaceVerificationRepository';
import {
  FaceChallenge,
  FaceStatus,
  FaceModerationDetail,
} from '@/domain/entities/FaceVerification';
import { ApiClient } from '../http/api-client';

export class HttpFaceVerificationRepository implements FaceVerificationRepository {
  async createChallenge(consent: boolean): Promise<FaceChallenge> {
    return await ApiClient.post<FaceChallenge>('/me/kyc/face/challenges', { consent });
  }

  async submitFrames(formData: FormData): Promise<FaceStatus> {
    return await ApiClient.post<FaceStatus>('/me/kyc/face/submissions', formData);
  }

  async getStatus(): Promise<FaceStatus> {
    return await ApiClient.get<FaceStatus>('/me/kyc/face');
  }

  async revokeConsent(): Promise<void> {
    await ApiClient.delete<void>('/me/kyc/face/consent');
  }

  async getModerationFaceDetail(kycId: string): Promise<FaceModerationDetail> {
    return await ApiClient.get<FaceModerationDetail>(`/admin/kyc/${kycId}/face`);
  }

  async getModerationFrameBlob(kycId: string, frameId: string): Promise<Blob> {
    return await ApiClient.getBlob(`/admin/kyc/${kycId}/face/frames/${frameId}`);
  }

  async decideFace(
    kycId: string,
    decision: 'PASSED' | 'FAILED',
    reasonCode?: string,
    note?: string,
    version?: number
  ): Promise<void> {
    const qs = version !== undefined ? `?version=${version}` : '';
    await ApiClient.post<void>(`/admin/kyc/${kycId}/face/decision${qs}`, {
      decision,
      reasonCode,
      note,
    });
  }
}

