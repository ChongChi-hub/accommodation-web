(async () => {
  // 1. Login
  const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'landlord@cozynest.vn', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  console.log('Got token:', token ? token.slice(0, 30) + '...' : 'NONE');

  // 2. Fetch /landlord/rooms
  const roomsRes = await fetch('http://localhost:8080/api/v1/landlord/rooms', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('GET /landlord/rooms status:', roomsRes.status);
  const roomsText = await roomsRes.text();
  console.log('Response body:', roomsText.slice(0, 500));
})().catch(console.error);

