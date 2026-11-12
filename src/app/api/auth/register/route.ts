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

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'Thieu du lieu dang ky' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${getGatewayApiBase()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    return NextResponse.json({ message: 'Khong the ket noi den may chu xac thuc' }, { status: 502 });
  }
}

