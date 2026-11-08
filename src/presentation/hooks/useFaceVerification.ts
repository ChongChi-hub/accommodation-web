'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaceChallenge, FaceStatus } from '@/domain/entities/FaceVerification';
import { container } from '@/infrastructure/di/container';

export function useFaceVerification() {
  const [faceStatus, setFaceStatus] = useState<FaceStatus | null>(null);
  const [challenge, setChallenge] = useState<FaceChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await container.kyc.faceVerificationUseCases.getStatus();
      setFaceStatus(status);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải trạng thái xác thực khuôn mặt');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestChallenge = useCallback(async (consent: boolean): Promise<FaceChallenge> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await container.kyc.faceVerificationUseCases.createChallenge(consent);
      setChallenge(res);
      return res;
    } catch (err: any) {
      const msg = err?.message || 'Không thể khởi tạo thử thách';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitFrames = useCallback(
    async (
      nonce: string,
      livenessClientFlag: boolean,
      neutralBlob: Blob,
      actionBlobs: Blob[]
    ): Promise<FaceStatus> => {
      setIsLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('nonce', nonce);
        formData.append('livenessClientFlag', String(livenessClientFlag));
        formData.append('neutralFrame', neutralBlob, 'neutral.jpg');
        actionBlobs.forEach((b, idx) => {
          formData.append('actionFrames', b, `action_${idx}.jpg`);
        });

        const status = await container.kyc.faceVerificationUseCases.submitFrames(formData);
        setFaceStatus(status);
        setChallenge(null);
        return status;
      } catch (err: any) {
        const msg = err?.message || 'Không thể nộp ảnh xác thực';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const revokeConsent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await container.kyc.faceVerificationUseCases.revokeConsent();
      await loadStatus();
    } catch (err: any) {
      setError(err?.message || 'Không thể rút lại đồng ý');
    } finally {
      setIsLoading(false);
    }
  }, [loadStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return {
    faceStatus,
    challenge,
    isLoading,
    error,
    loadStatus,
    requestChallenge,
    submitFrames,
    revokeConsent,
  };
}

