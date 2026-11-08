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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async rewrites() {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const apiGatewayBase = rawApiUrl.replace(/\/api\/v1\/?$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiGatewayBase}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiGatewayBase}/uploads/:path*`,
      },
      {
        source: '/.well-known/:path*',
        destination: `${apiGatewayBase}/.well-known/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

