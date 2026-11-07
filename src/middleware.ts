import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cleanPath = pathname.replace(/^\/(vi|en)/, '') || '/';
  const role = req.cookies.get('toam_role')?.value;

  // Extract locale if present in URL
  const localeMatch = pathname.match(/^\/(vi|en)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';

  // 1. Protected Dashboard Routes
  if (cleanPath.startsWith('/dashboard')) {
    // If not authenticated, redirect to login with returnUrl
    if (!role) {
      const loginUrl = new URL(`${localePrefix}/login`, req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific route boundaries
    if (cleanPath.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/moderator') && role !== 'MODERATOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/landlord') && role !== 'LANDLORD') {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    if (cleanPath.startsWith('/dashboard/tenant') && role !== 'TENANT') {
      return NextResponse.redirect(new URL(`${localePrefix}/403`, req.url));
    }

    // Default /dashboard redirect to specific role dashboard
    if (cleanPath === '/dashboard' || cleanPath === '/dashboard/') {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
      }
      if (role === 'MODERATOR') {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/moderator`, req.url));
      }
      if (role === 'LANDLORD') {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/landlord`, req.url));
      }
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/tenant`, req.url));
    }
  }

  // 2. Auth routes: If already logged in, redirect to respective dashboard
  if ((cleanPath === '/login' || cleanPath === '/register') && role) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
    }
    if (role === 'MODERATOR') {
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard/moderator`, req.url));
    }
    if (role === 'LANDLORD') {
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
