import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import * as jose from 'jose';
import { routing } from './i18n/routing';
import { APP_ROUTES, resolveRoomTypeRedirectPath } from './shared/routes';

const intlMiddleware = createMiddleware(routing);

const DEFAULT_PUBLIC_JWK = {
  kty: 'RSA',
  use: 'sig',
  alg: 'RS256',
  kid: 'cozynest-identity-key-1',
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

function resolveMiddlewareHome(roles: string[], preferredRole?: string): string {
  if (roles.includes('ADMIN')) return APP_ROUTES.adminHome;
  if (roles.includes('MODERATOR')) return APP_ROUTES.moderatorHome;
  if (preferredRole && roles.includes(preferredRole)) {
    if (preferredRole === 'LANDLORD') return APP_ROUTES.landlordHome;
    if (preferredRole === 'TENANT') return APP_ROUTES.tenantHome;
  }
  if (roles.includes('LANDLORD')) return APP_ROUTES.landlordHome;
  return APP_ROUTES.tenantHome;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cleanPath = pathname.replace(/^\/(vi|en)(?=\/|$)/, '') || '/';

  const localeMatch = pathname.match(/^\/(vi|en)(?=\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

  // Legacy /rooms?type=... permanent 308 redirect to SEO category alias
  if (cleanPath === '/rooms' && req.nextUrl.searchParams.has('type')) {
    const rawType = req.nextUrl.searchParams.get('type');
    const targetAlias = resolveRoomTypeRedirectPath(rawType);
    if (targetAlias) {
      const redirectUrl = new URL(`${localePrefix}${targetAlias}`, req.url);
      req.nextUrl.searchParams.forEach((v, k) => {
        if (k !== 'type') redirectUrl.searchParams.set(k, v);
      });
      return NextResponse.redirect(redirectUrl, { status: 308 });
    }
  }

  // Permanent 308 redirects for legacy non-prefixed role paths
  if (
    cleanPath === '/landlord' ||
    cleanPath.startsWith('/landlord/') ||
    cleanPath === '/tenant' ||
    cleanPath.startsWith('/tenant/') ||
    cleanPath === '/admin' ||
    cleanPath.startsWith('/admin/') ||
    cleanPath === '/moderator' ||
    cleanPath.startsWith('/moderator/') ||
    cleanPath === '/account/kyc' ||
    cleanPath.startsWith('/account/kyc/')
  ) {
    const targetDashboard = cleanPath.startsWith('/account/kyc')
      ? cleanPath.replace('/account/kyc', APP_ROUTES.landlordKyc)
      : `/dashboard${cleanPath}`;
    const redirectUrl = new URL(`${localePrefix}${targetDashboard}`, req.url);
    req.nextUrl.searchParams.forEach((v, k) => redirectUrl.searchParams.set(k, v));
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }

  const token = req.cookies.get('cozynest_token')?.value;
  const preferredRole = req.cookies.get('cozynest_role')?.value;
  const auth = token ? await verifyToken(token) : null;
  const roles = auth?.roles || [];

  if (cleanPath.startsWith('/dashboard')) {
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
    const isModOnAllowedRoute =
      hasRole('MODERATOR') && MODERATOR_ALLOWED_ADMIN_ROUTES.some((r) => cleanPath.startsWith(r));

    if (cleanPath.startsWith('/dashboard/admin') && !hasRole('ADMIN') && !isModOnAllowedRoute) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/moderator') && !hasRole('MODERATOR') && !hasRole('ADMIN')) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/landlord') && !hasRole('LANDLORD')) {
      if (hasRole('TENANT') && !cleanPath.startsWith('/dashboard/landlord/kyc')) {
        return NextResponse.redirect(new URL(`${localePrefix}${APP_ROUTES.landlordKyc}`, req.url));
      }
      if (!hasRole('TENANT')) {
        return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
      }
    }

    if (cleanPath.startsWith('/dashboard/tenant') && !hasRole('TENANT')) {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath === '/dashboard' || cleanPath === '/dashboard/') {
      const home = resolveMiddlewareHome(roles, preferredRole);
      return NextResponse.redirect(new URL(`${localePrefix}${home}`, req.url));
    }
  }

  if ((cleanPath === '/login' || cleanPath === '/register') && auth) {
    const home = resolveMiddlewareHome(roles, preferredRole);
    return NextResponse.redirect(new URL(`${localePrefix}${home}`, req.url));
  }

  const response = intlMiddleware(req);
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  if (authPaths.some((p) => cleanPath === p || cleanPath.startsWith(p + '/'))) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
