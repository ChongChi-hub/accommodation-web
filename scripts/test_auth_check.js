(async () => {
  const res = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'landlord@cozynest.vn', password: 'password123' })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('User:', data.data?.user?.email, data.data?.user?.roles);
})().catch(console.error);
