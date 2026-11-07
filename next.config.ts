import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiGatewayUrl}/api/v1/:path*`,
      },
      {
        source: '/.well-known/:path*',
        destination: `${apiGatewayUrl}/.well-known/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

