import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, getGatewayApiBase, verifyCsrfOrigin } from '../_helpers';

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrfOrigin(req);
  if (csrfError) return csrfError;

  const token =
    req.cookies.get('cozynest_token')?.value ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (token) {
    await fetch(`${getGatewayApiBase()}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ message: 'Da dang xuat thanh cong', data: null });
  clearAuthCookies(res);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

