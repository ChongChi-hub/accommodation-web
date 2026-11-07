'use client';

import React from 'react';
import { DashboardLayout } from '@/presentation/components/layout/DashboardLayout';

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

