'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function LandlordMaintenanceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/landlord');
  }, [router]);

  return null;
}
