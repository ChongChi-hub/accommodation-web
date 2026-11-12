import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, verifyCsrfOrigin } from '../_helpers';

export async function GET(req: NextRequest) {
  const hasToken = Boolean(req.cookies.get('cozynest_token')?.value);
  const role = req.cookies.get('cozynest_role')?.value || null;
  return NextResponse.json({ authenticated: hasToken, role }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(req: NextRequest) {
  const csrfError = verifyCsrfOrigin(req);
  if (csrfError) return csrfError;

  const res = NextResponse.json({ cleared: true });
  clearAuthCookies(res);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

