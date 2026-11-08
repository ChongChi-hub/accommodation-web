import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ToastContainer } from '@/presentation/components/ui/Toast';
import '@/styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Tổ Ấm - Nền tảng thuê trọ minh bạch & an tâm',
  description: 'Tìm kiếm phòng trọ, căn hộ, nhà nguyên căn và ký hợp đồng điện tử an toàn tại Việt Nam.',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-mark.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
          <ToastContainer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
