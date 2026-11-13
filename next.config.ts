import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://*.google.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com",
              "frame-src 'self' https://accounts.google.com https://*.google.com https://*.openstreetmap.org https://www.openstreetmap.org",
              "connect-src 'self' http://localhost:8080 http://localhost:3000 ws://localhost:3000 https://accounts.google.com https://*.googleapis.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://accounts.google.com https://*.googleusercontent.com https://images.unsplash.com https://placehold.co https://img.vietqr.io https://*.vietqr.io",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() {
    const rawApiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8080';
    const apiGatewayBase = rawApiUrl.replace(/\/api\/v1\/?$/, '');
    return [
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

