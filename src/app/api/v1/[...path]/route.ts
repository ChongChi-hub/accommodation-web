import { NextRequest, NextResponse } from 'next/server';
import { getGatewayApiBase, verifyCsrfOrigin } from '@/app/api/auth/_helpers';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function sanitizePathSegments(segments: string[]): string | null {
  if (!segments || segments.length === 0) return '';
  for (const seg of segments) {
    if (!seg || seg === '.' || seg === '..' || seg.includes('..') || seg.includes('\\')) {
      return null;
    }
  }
  return segments.map((s) => encodeURIComponent(s)).join('/');
}

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  if (MUTATING_METHODS.has(req.method.toUpperCase())) {
    const csrfError = verifyCsrfOrigin(req);
    if (csrfError) return csrfError;
  }

  const { path } = await context.params;
  const sanitizedPath = sanitizePathSegments(path);
  if (sanitizedPath === null) {
    return NextResponse.json({ message: 'Invalid API path' }, { status: 400 });
  }

  const upstreamUrl = `${getGatewayApiBase()}/${sanitizedPath}${req.nextUrl.search}`;
  const headers = new Headers();

  const forwardHeaderNames = [
    'content-type',
    'accept',
    'accept-language',
    'idempotency-key',
    'x-request-id',
  ];
  for (const name of forwardHeaderNames) {
    const val = req.headers.get(name);
    if (val) headers.set(name, val);
  }

  const cookieToken = req.cookies.get('cozynest_token')?.value;
  if (cookieToken) {
    headers.set('authorization', `Bearer ${cookieToken}`);
  } else {
    const incomingAuth = req.headers.get('authorization');
    if (incomingAuth) headers.set('authorization', incomingAuth);
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Khong the ket noi den may chu API Gateway' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const responseHeaders = new Headers();
  const passthroughHeaders = ['content-type', 'content-disposition'];
  for (const name of passthroughHeaders) {
    const val = upstream.headers.get(name);
    if (val) responseHeaders.set(name, val);
  }
  responseHeaders.set('Cache-Control', 'no-store');

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, context);
}

