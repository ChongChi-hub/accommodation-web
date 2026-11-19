'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function TenantMaintenanceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/tenant');
  }, [router]);

  return null;
}
