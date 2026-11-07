'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/infrastructure/http/api-client';

export function useAuthenticatedKycImage(endpoint: string | null) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) {
      setImageUrl(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const blob = await ApiClient.getBlob(endpoint);
        if (active) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Error loading image');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [endpoint]);

  return { imageUrl, isLoading, error };
}

