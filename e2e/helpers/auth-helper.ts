import * as jose from 'jose';
import { Page } from '@playwright/test';

const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnoGWqlO0JAE2q
ksnCEvnRTqkwzFS6QuVyQ0EF+dyLtMCZgNj0Gz9/0sQAZRjfAJyH5w353P6h+jcT
8A74BfvERvJXD7jP2bcrkYmBRDaOYgxQGQC7A+IJOZb8dpNxynhJuHmi7tZgtVpC
6zAjAIprVajyCLJzLRSctYHO8qJyRP70UaMfPh9ANJwWcbGnW1aGp8DMlQYCHsXV
ZPepG1v4cbqtnEwKM0dEaVu/LFM5YwX/TNqn4KsOIfCW4JZiYcnlG1ryfEIPHxuI
0uJOG8ungOHquSbDYp+/9mcINeJ8ZUxXJmWsrBU0W8VOrXcOIJhXzUxdQwmgvpmI
pn2uQduDAgMBAAECggEAIAq2RbS4XahnFhOcSXaqjGPfT9rUVbfvWbEoC5WXBtSI
WDPUz1/9lscnSg6yNBc3kC1MZ6ZEq0+b0uxAhdr+Cxbta1HHdSlfB23oobM4ANZb
cbEjwrs0x6Xp1x7oIrOplDkqynlTuqkbxWoXjKAEhfihmGnPldNEqLELNf+mrTvO
wiR3vLKNPkIbhoPWU0Or7t0XmkwZ9ku02EfisqT+nAgZufOiLU+AXEcrfEcVK0Tu
MKT7B4UcQw8tjDQtgBKsC4+/vxgPk1O3aMru720fSx8MntToLvAkq2nFZ/t5okRO
ij7VBnIQeGXp84Bdmpzu7Ac+ji9Ls4omW0zQ25S5QQKBgQD+JW0QH8if+lXX2M7/
ECiylCyLcze+lv3LYp3tqV3wrwUS4vACZJWau7PmHM/wyauXDrTyUn90pFoSkTRj
3kr4QyMc6dGdM0fgFmp+ztrDlqM6XRqaVpsW2hhm+2umDtaonBCrYRXlvTDePi6e
kbniZ+oQDNt8iMz2nWj78HXMkQKBgQDpUOtpOusxM7QiXdgZV/I5s/3Dy613Pcn5
mgG+wnk3+pDOXMqN9GhCFdo7Ms6mBtcTEUJbhyFKD8abkZ/zXsEks1AxaorxV8Qt
72Bu84iteTiy9ubOuwtQxkkNnGFfkAIqAxufJrv/ZHaujLshJCwo1gR7lPgSvuMu
ij1yJKZA0wKBgFYh0wOq8fCeA+fiV80D6fcT1sDwLI1QWPVMF+ALDYZbmqma9eKp
ujY1tTOgwiyF/Lx2RIb3xLCAXvJ5+bp7BQd8oXLUH7FaRtrAXhlZ+7Rb4jgOg8yY
23j0M177iLE/yCpeshuTDLvO0bgQdPZSxx/fPelwohZjuqs+D+2KwjGxAoGBAIYG
nOSbGuXtrImdXPjaA2RQV/L0epYn4XFHnb8GGfolLq/Mr/Kxtn5X7T/aZMkM3tmu
LW9EhcP0ogNVuQtloA/EDcoFSQFwiFwWyw+RSC9WllJ/8IBLBCoHbYmrDmiF4ihe
Fqzq5E3GWULVxt032UIwBu0y2vpxuzFN6hQ6p2JPAoGAbLRSNpK6wOY88iCSCH8p
Fv3hRbfEQUWlcNbQ/1FmueiQaCr4ucq9LCat4W3LjKth9kqVvlL6pqEp04U1FD0Y
qDZpT0CVWG0eWqgHz95gDc4HwnuaURrsyjBrI9GB/m3zyGbggsbVaWDFFgOQv6VP
CN0wZrPpRg+zdvOuTy/qbco=
-----END PRIVATE KEY-----`;

export interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'tenant@cozynest.vn': {
    id: 'u-tenant-01',
    email: 'tenant@cozynest.vn',
    fullName: 'Nguyễn Văn Thuê',
    roles: ['TENANT'],
  },
  'landlord@cozynest.vn': {
    id: 'u-landlord-01',
    email: 'landlord@cozynest.vn',
    fullName: 'Trần Thị Chủ Trọ',
    roles: ['LANDLORD'],
  },
  'moderator@cozynest.vn': {
    id: 'u-mod-01',
    email: 'moderator@cozynest.vn',
    fullName: 'Phạm Minh Kiểm Duyệt',
    roles: ['MODERATOR'],
  },
  'admin@cozynest.vn': {
    id: 'u-admin-01',
    email: 'admin@cozynest.vn',
    fullName: 'Lê Hoàng Quản Trị',
    roles: ['ADMIN'],
  },
};

export async function createRealSignedToken(user: DemoUser): Promise<string> {
  const privateKey = await jose.importPKCS8(PRIVATE_KEY_PEM, 'RS256');
  return new jose.SignJWT({
    email: user.email,
    fullName: user.fullName,
    roles: user.roles.join(','),
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'cozynest-identity-key-1' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
}

const cachedSessions = new Map<string, Promise<{ token: string; user: DemoUser }>>();

async function resolveSession(email: keyof typeof DEMO_USERS): Promise<{ token: string; user: DemoUser }> {
  const existing = cachedSessions.get(email);
  if (existing) return existing;

  const p = (async () => {
    const fallbackUser = DEMO_USERS[email];
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.token && json?.data?.user) {
          return {
            token: json.data.token as string,
            user: json.data.user as DemoUser,
          };
        }
      }
    } catch {
      // Fallback to local RS256 demo token if gateway is offline
    }
    const token = await createRealSignedToken(fallbackUser);
    return { token, user: fallbackUser };
  })();

  cachedSessions.set(email, p);
  return p;
}

export async function authenticateAs(context: any, page: any, email: keyof typeof DEMO_USERS) {
  const { token, user } = await resolveSession(email);
  const primaryRole = user.roles?.[0] || DEMO_USERS[email].roles[0];
  await context.addCookies([
    {
      name: 'cozynest_token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'cozynest_role',
      value: primaryRole,
      domain: 'localhost',
      path: '/',
    },
  ]);
  await page.addInitScript(
    ({ t, u }: { t: string; u: any }) => {
      localStorage.setItem('cozynest_access_token', t);
      localStorage.setItem('cozynest_refresh_token', 'mock_refresh_token');
      localStorage.setItem('cozynest_user', JSON.stringify(u));
    },
    { t: token, u: user }
  );
  await page.route('**/api/v1/auth/refresh-token', async (route: any) => {
    let body: any = null;
    try {
      body = route.request().postDataJSON();
    } catch {
      body = null;
    }
    if (body?.refreshToken === 'mock_refresh_token') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'OK',
          data: {
            token,
            refreshToken: 'mock_refresh_token',
            user,
          },
        }),
      });
    }
    return route.fallback();
  });
}

export async function addAuthCookieForUser(context: any, email: keyof typeof DEMO_USERS = 'landlord@cozynest.vn') {
  const user = DEMO_USERS[email];
  const token = await createRealSignedToken(user);
  await context.addCookies([
    {
      name: 'cozynest_token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'cozynest_role',
      value: user.roles[0],
      domain: 'localhost',
      path: '/',
    },
  ]);
  return token;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
};

export async function setupAuthMockRoutes(page: Page) {
  await page.route('**/api/v1/auth/login', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }
    let postData: any = null;
    try {
      postData = route.request().postDataJSON();
    } catch {
      postData = null;
    }
    const user = DEMO_USERS[postData?.email];
    if (!user || postData?.password !== 'password123') {
      return route.fulfill({
        status: 401,
        headers: CORS_HEADERS,
        json: { success: false, message: 'Sai email hoặc mật khẩu' },
      });
    }

    const token = await createRealSignedToken(user);
    return route.fulfill({
      status: 200,
      headers: CORS_HEADERS,
      json: {
        success: true,
        data: {
          token,
          refreshToken: `mock-refresh-token:${user.email}`,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles,
          },
        },
      },
    });
  });

  await page.route('**/api/v1/auth/refresh-token', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }
    let body: any = null;
    try {
      body = route.request().postDataJSON();
    } catch {
      body = null;
    }
    const rt = String(body?.refreshToken || '');
    if (rt.startsWith('mock-refresh-token:')) {
      const email = rt.slice('mock-refresh-token:'.length);
      const user = DEMO_USERS[email];
      if (user) {
        const token = await createRealSignedToken(user);
        return route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
          json: {
            success: true,
            data: {
              token,
              refreshToken: rt,
              user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles,
              },
            },
          },
        });
      }
    }
    return route.fallback();
  });

  await page.route('**/api/v1/me', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }
    const auth = route.request().headers()['authorization'] || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (jwt) {
      try {
        const decoded = jose.decodeJwt(jwt);
        const user = DEMO_USERS[String(decoded.email || '')];
        if (user && decoded.sub === user.id) {
          return route.fulfill({
            status: 200,
            headers: CORS_HEADERS,
            json: {
              success: true,
              data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles,
              },
            },
          });
        }
      } catch {
        // fallback to real BE
      }
    }
    return route.fallback();
  });
}

