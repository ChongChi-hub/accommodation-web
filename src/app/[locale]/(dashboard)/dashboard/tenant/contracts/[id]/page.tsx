'use client';

import React, { use } from 'react';
import { ContractDetailWorkspace } from '@/presentation/components/contracts/ContractDetailWorkspace';

export default function TenantContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ContractDetailWorkspace
      contractId={id}
      role="TENANT"
      backHref="/dashboard/tenant/contracts"
    />
  );
}
