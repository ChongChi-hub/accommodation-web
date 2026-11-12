import { NextRequest, NextResponse } from 'next/server';
import {
  attachAuthCookies,
  getGatewayApiBase,
  resolvePrimaryRole,
  verifyCsrfOrigin,
} from '../_helpers';

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrfOrigin(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const upstream = await fetch(`${getGatewayApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const json = await upstream.json().catch(() => ({ message: 'Loi phan hoi tu may chu' }));
    if (!upstream.ok) {
      return NextResponse.json(json, { status: upstream.status });
    }

    const rawData = json?.data as Record<string, unknown> | undefined;
    const sanitizedJson = rawData
      ? {
          ...json,
          data: {
            user: rawData.user,
            isNewUser: rawData.isNewUser,
            expiresIn: rawData.expiresIn,
          },
        }
      : json;

    const res = NextResponse.json(sanitizedJson, { status: 200 });
    if (typeof rawData?.token === 'string' && rawData.token) {
      const userObj = rawData.user as { roles?: string[] } | undefined;
      attachAuthCookies(
        res,
        rawData.token,
        typeof rawData.refreshToken === 'string' ? rawData.refreshToken : undefined,
        resolvePrimaryRole(userObj?.roles)
      );
    }
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch {
    return NextResponse.json(
      { message: 'Khong the ket noi dich vu xac thuc', errorCode: 'ERR_UPSTREAM' },
      { status: 502 }
    );
  }
}

