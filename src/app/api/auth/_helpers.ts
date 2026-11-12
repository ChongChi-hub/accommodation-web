import { NextRequest, NextResponse } from 'next/server';

export function getGatewayApiBase(): string {
  const raw =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8080/api/v1';
  const normalized = raw.replace(/\/+$/, '');
  return normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`;
}

export function verifyCsrfOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!host) return null;
  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.host !== host) {
      return NextResponse.json(
        { message: 'Yeu cau khong hop le (CSRF origin mismatch)', errorCode: 'ERR_CSRF_ORIGIN' },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { message: 'Origin khong hop le', errorCode: 'ERR_CSRF_ORIGIN' },
      { status: 403 }
    );
  }
  return null;
}

export function resolvePrimaryRole(roles?: string[] | null): string {
  if (!roles || roles.length === 0) return 'TENANT';
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('MODERATOR')) return 'MODERATOR';
  if (roles.includes('LANDLORD')) return 'LANDLORD';
  return roles[0] || 'TENANT';
}

export function attachAuthCookies(
  res: NextResponse,
  token: string,
  refreshToken?: string | null,
  role?: string | null
) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookies.set('cozynest_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  if (refreshToken) {
    res.cookies.set('cozynest_refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (role) {
    res.cookies.set('cozynest_role', role, {
      httpOnly: false,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export function clearAuthCookies(res: NextResponse) {
  const secure = process.env.NODE_ENV === 'production';
  for (const name of ['cozynest_token', 'cozynest_refresh_token', 'cozynest_role']) {
    res.cookies.set(name, '', {
      httpOnly: name !== 'cozynest_role',
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 0,
    });
  }
}

