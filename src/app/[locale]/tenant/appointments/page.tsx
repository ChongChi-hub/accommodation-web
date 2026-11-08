import { redirect } from 'next/navigation';

export default async function TenantAppointmentsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/tenant/appointments`);
}
