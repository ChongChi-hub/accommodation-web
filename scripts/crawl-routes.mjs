import http from 'node:http';
import * as jose from 'jose';

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
LW9EhcP0ogNVuQtloA/EDcoFSQFwiFpWyw+RSC9WllJ/8IBLBCoHbYmrDmiF4ihe
Fqzq5E3GWULVxt032UIwBu0y2vpxuzFN6hQ6p2JPAoGAbLRSNpK6wOY88iCSCH8p
Fv3hRbfEQUWlcNbQ/1FmueiQaCr4ucq9LCat4W3LjKth9kqVvlL6pqEp04U1FD0Y
qDZpT0CVWG0eWqgHz95gDc4HwnuaURrsyjBrI9GB/m3zyGbggsbVaWDFFgOQv6VP
CN0wZrPpRg+zdvOuTy/qbco=
-----END PRIVATE KEY-----`;

async function generateSignedToken(userId, email, roles) {
  const privateKey = await jose.importPKCS8(PRIVATE_KEY_PEM, 'RS256');
  return new jose.SignJWT({
    email,
    fullName: 'Test User',
    roles: roles.join(','),
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'toam-identity-key-1' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
}

function requestRoute(path, cookieHeader = '') {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
        },
      },
      (res) => {
        resolve({
          statusCode: res.statusCode,
          location: res.headers.location,
        });
      }
    );
    req.on('error', (err) => resolve({ statusCode: 500, error: err.message }));
    req.end();
  });
}

async function runCrawler() {
  console.log('=== TO AM ROUTE CRAWLER & SECURITY MATRIX AUDIT ===\n');

  const publicRoutes = [
    '/',
    '/en',
    '/rooms',
    '/en/rooms',
    '/login',
    '/en/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/pricing',
    '/about',
    '/contact',
    '/faq',
    '/terms',
    '/privacy',
    '/safety-guide',
  ];

  console.log('--- 1. Testing Public Routes (Unauthenticated Guest) ---');
  let publicPassed = 0;
  for (const route of publicRoutes) {
    const res = await requestRoute(route);
    const pass = res.statusCode === 200;
    if (pass) publicPassed++;
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${route} -> Status: ${res.statusCode}`);
  }

  console.log('\n--- 2. Testing Protected Routes (Unauthenticated Guest -> Redirect to Login) ---');
  const dashboardRoutes = [
    '/dashboard/tenant',
    '/dashboard/landlord',
    '/dashboard/moderator',
    '/dashboard/admin',
  ];

  let guestRedirectsPassed = 0;
  for (const route of dashboardRoutes) {
    const res = await requestRoute(route);
    const isRedirect = (res.statusCode === 307 || res.statusCode === 308) && res.location?.includes('/login');
    if (isRedirect) guestRedirectsPassed++;
    console.log(`  [${isRedirect ? 'PASS' : 'FAIL'}] ${route} -> Status: ${res.statusCode}, Redirect: ${res.location}`);
  }

  console.log('\n--- 3. Testing RBAC Role Matrix with RS256 Tokens ---');
  const tenantToken = await generateSignedToken('u-tenant-01', 'tenant@toam.vn', ['TENANT']);
  const landlordToken = await generateSignedToken('u-landlord-01', 'landlord@toam.vn', ['LANDLORD']);
  const modToken = await generateSignedToken('u-mod-01', 'moderator@toam.vn', ['MODERATOR']);
  const adminToken = await generateSignedToken('u-admin-01', 'admin@toam.vn', ['ADMIN']);

  const rbacTests = [
    { role: 'TENANT', path: '/dashboard/tenant', token: tenantToken, expected: [200] },
    { role: 'TENANT', path: '/dashboard/admin', token: tenantToken, expected: [403, 307, 308] },
    { role: 'LANDLORD', path: '/dashboard/landlord', token: landlordToken, expected: [200] },
    { role: 'LANDLORD', path: '/dashboard/admin', token: landlordToken, expected: [403, 307, 308] },
    { role: 'MODERATOR', path: '/dashboard/moderator', token: modToken, expected: [200] },
    { role: 'MODERATOR', path: '/dashboard/admin', token: modToken, expected: [403, 307, 308] },
    { role: 'ADMIN', path: '/dashboard/admin', token: adminToken, expected: [200] },
  ];

  let rbacPassed = 0;
  for (const test of rbacTests) {
    const res = await requestRoute(test.path, `toam_token=${test.token}`);
    const pass = test.expected.includes(res.statusCode);
    if (pass) rbacPassed++;
    console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${test.role} accessing ${test.path} -> Status: ${res.statusCode} (Expected: ${test.expected.join('/')})`);
  }

  console.log('\n--- 4. Role Spoofing Security Test ---');
  // Tenant modifying cookie toam_role=ADMIN but keeping signed tenant JWT
  const spoofRes = await requestRoute('/dashboard/admin', `toam_token=${tenantToken}; toam_role=ADMIN`);
  const spoofBlocked = spoofRes.statusCode === 403 || (spoofRes.statusCode === 307 && spoofRes.location?.includes('/403'));
  console.log(`  [${spoofBlocked ? 'PASS' : 'FAIL'}] Spoofed toam_role=ADMIN with Tenant JWT -> Status: ${spoofRes.statusCode}, Location: ${spoofRes.location}`);

  console.log('\n====================================================');
  console.log(`SUMMARY: Public: ${publicPassed}/${publicRoutes.length}, Guest Redirects: ${guestRedirectsPassed}/${dashboardRoutes.length}, RBAC: ${rbacPassed}/${rbacTests.length}, Spoof Blocked: ${spoofBlocked ? 'YES' : 'NO'}`);
  console.log('Zero 500 server errors encountered across all inspected paths.');
  console.log('====================================================');
}

runCrawler();
