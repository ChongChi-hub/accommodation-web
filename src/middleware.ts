import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import * as jose from 'jose';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const DEFAULT_PUBLIC_JWK = {
  kty: 'RSA',
  use: 'sig',
  alg: 'RS256',
  kid: 'toam-identity-key-1',
  n: '56BlqpTtCQBNqpLJwhL50U6pMMxUukLlckNBBfnci7TAmYDY9Bs_f9LEAGUY3wCch-cN-dz-ofo3E_AO-AX7xEbyVw-4z9m3K5GJgUQ2jmIMUBkAuwPiCTmW_HaTccp4Sbh5ou7WYLVaQuswIwCKa1Wo8giycy0UnLWBzvKickT-9FGjHz4fQDScFnGxp1tWhqfAzJUGAh7F1WT3qRtb-HG6rZxMCjNHRGlbvyxTOWMF_0zap-CrDiHwluCWYmHJ5Rta8nxCDx8biNLiThvLp4Dh6rkmw2Kfv_ZnCDXifGVMVyZlrKwVNFvFTq13DiCYV81MXUMJoL6ZiKZ9rkHbgw',
  e: 'AQAB',
};

let cachedPublicKey: CryptoKey | Uint8Array | null = null;

async function getPublicKey() {
  if (!cachedPublicKey) {
    cachedPublicKey = (await jose.importJWK(DEFAULT_PUBLIC_JWK, 'RS256')) as CryptoKey | Uint8Array;
  }
  return cachedPublicKey;
}

interface VerifiedAuth {
  userId: string;
  email: string;
  roles: string[];
}

async function verifyToken(token: string): Promise<VerifiedAuth | null> {
  try {
    const key = await getPublicKey();
    const { payload } = await jose.jwtVerify(token, key, {
      algorithms: ['RS256'],
    });

    let roles: string[] = [];
    if (typeof payload.roles === 'string') {
      roles = payload.roles.split(',').map((r) => r.trim());
    } else if (Array.isArray(payload.roles)) {
      roles = payload.roles.map(String);
    }

    return {
      userId: payload.sub || '',
      email: (payload.email as string) || '',
      roles,
    };
  } catch {
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cleanPath = pathname.replace(/^\/(vi|en)/, '') || '/';

  // Read cryptographically signed session token from httpOnly cookie
  const token = req.cookies.get('toam_token')?.value;
  const auth = token ? await verifyToken(token) : null;
  const roles = auth?.roles || [];

  // Extract locale if present in URL
  const localeMatch = pathname.match(/^\/(vi|en)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

  // 1. Protected Dashboard Routes
  if (cleanPath.startsWith('/dashboard')) {
    // If not authenticated or token invalid/expired, redirect to login
    if (!auth) {
      const loginUrl = new URL(`${localePrefix}/login`, req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const hasRole = (role: string) => roles.includes(role);

    const MODERATOR_ALLOWED_ADMIN_ROUTES = [
      '/dashboard/admin/rooms',
      '/dashboard/admin/kyc',
      '/dashboard/admin/reports',
      '/dashboard/admin/reviews',
      '/dashboard/admin/disputes',
      '/dashboard/admin/support',
    ];
    const isModOnAllowedRoute = hasRole('MODERATOR') && MODERATOR_ALLOWED_ADMIN_ROUTES.some((r) => cleanPath.startsWith(r));

    // Cryptographically verified role-based access control
    if (cleanPath.startsWith('/dashboard/admin') && !hasRole('ADMIN') && !isModOnAllowedRoute) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/moderator') && !hasRole('MODERATOR') && !hasRole('ADMIN')) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/landlord') && !hasRole('LANDLORD')) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/tenant') && !hasRole('TENANT')) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    // Default /dashboard redirect to specific role dashboard
    if (cleanPath === '/dashboard' || cleanPath === '/dashboard/') {
      if (hasRole('ADMIN')) {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
      }
      if (hasRole('MODERATOR')) {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/moderator`, req.url));
      }
      if (hasRole('LANDLORD')) {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/landlord`, req.url));
      }
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/tenant`, req.url));
    }
  }

  // 2. Auth routes: If already logged in with valid token, redirect to respective dashboard
  if ((cleanPath === '/login' || cleanPath === '/register') && auth) {
    if (roles.includes('ADMIN')) {
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
    }
    if (roles.includes('MODERATOR')) {
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/moderator`, req.url));
    }
    if (roles.includes('LANDLORD')) {
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/landlord`, req.url));
    }
    return NextResponse.redirect(new URL(`${localePrefix}/dashboard/tenant`, req.url));
  }

  // 3. Delegate localization routing
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
