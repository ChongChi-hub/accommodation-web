import {
  FaceChallenge,
  FaceStatus,
  FaceModerationDetail,
} from '../entities/FaceVerification';

export interface FaceVerificationRepository {
  createChallenge(consent: boolean): Promise<FaceChallenge>;
  submitFrames(formData: FormData): Promise<FaceStatus>;
  getStatus(): Promise<FaceStatus>;
  revokeConsent(): Promise<void>;
  getModerationFaceDetail(kycId: string): Promise<FaceModerationDetail>;
  getModerationFrameBlob(kycId: string, frameId: string): Promise<Blob>;
  decideFace(
    kycId: string,
    decision: 'PASSED' | 'FAILED',
    reasonCode?: string,
    note?: string,
    version?: number
  ): Promise<void>;
}

