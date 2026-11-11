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

