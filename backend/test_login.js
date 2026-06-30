async function testLogin() {
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dallaimports08@gmail.com', senha: '12345678' })
    });
    console.log('Login Status:', res.status);
    const data = await res.json();
    console.log('Login Body:', JSON.stringify(data));
    
    if (data.token) {
      // Test authenticated endpoint
      const meRes = await fetch('http://localhost:3000/auth/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      console.log('Auth/Me Status:', meRes.status);
      const meData = await meRes.json();
      console.log('Auth/Me Body:', JSON.stringify(meData));

      // Test admin orders
      const admRes = await fetch('http://localhost:3000/pedidos/admin', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      console.log('Pedidos Admin Status:', admRes.status);
      const admData = await admRes.json();
      console.log('Pedidos Admin Count:', Array.isArray(admData) ? admData.length : admData);
    }
  } catch(e) {
    console.error('Erro:', e.message);
  }
}
testLogin();
