import { NextRequest, NextResponse } from 'next/server';
import {
  attachAuthCookies,
  clearAuthCookies,
  getGatewayApiBase,
  resolvePrimaryRole,
  verifyCsrfOrigin,
} from '../_helpers';

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrfOrigin(req);
  if (csrfError) return csrfError;

  const body = await req.json().catch(() => ({}));
  const refreshToken = body?.refreshToken || req.cookies.get('cozynest_refresh_token')?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Phien dang nhap da het han', errorCode: 'ERR_NO_REFRESH_TOKEN' },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(`${getGatewayApiBase()}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    const json = await upstream.json().catch(() => ({ message: 'Khong the lam moi phien' }));
    if (!upstream.ok) {
      const errRes = NextResponse.json(json, { status: upstream.status });
      if (upstream.status === 401) clearAuthCookies(errRes);
      return errRes;
    }

    const res = NextResponse.json(json, { status: 200 });
    const data = json?.data;
    if (data?.token) {
      attachAuthCookies(res, data.token, data.refreshToken, resolvePrimaryRole(data.user?.roles));
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

