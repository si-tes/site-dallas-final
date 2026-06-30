const http = require('http');

function makeRequest(path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', error => reject(error));
    if (data) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('--- TESTE 1: LOGIN ADMIN PADAO ---');
    let res = await makeRequest('/auth/login', 'POST', { email: 'dallaimports08@gmail.com', senha: '12345678' });
    console.log('Status:', res.status);
    console.log('Body:', res.body.user);
    const adminToken = res.body.token;
    
    console.log('\n--- TESTE 2: CADASTRAR NOVO USUARIO COMUM ---');
    res = await makeRequest('/auth/register', 'POST', {
      nome: 'Teste Comum',
      email: `teste${Date.now()}@teste.com`,
      senha: 'password',
      telefone: '11999999999',
      cpf: '12345678900'
    });
    console.log('Status:', res.status);
    console.log('Body:', res.body.user);
    const commonEmail = res.body.user.email;
    
    console.log('\n--- TESTE 3: LOGIN USUARIO COMUM ---');
    res = await makeRequest('/auth/login', 'POST', { email: commonEmail, senha: 'password' });
    console.log('Status:', res.status);
    console.log('Body:', res.body.user);
    const commonToken = res.body.token;
    
    console.log('\n--- TESTE 4: /me COMUM (Telefone/CPF) ---');
    res = await makeRequest('/auth/me', 'GET', null, commonToken);
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    
    console.log('\n--- TESTE 5: ESQUECI MINHA SENHA ---');
    res = await makeRequest('/auth/forgot-password', 'POST', { email: commonEmail });
    console.log('Status:', res.status);
    console.log('Body:', res.body);

  } catch (err) {
    console.error('Erro nos testes:', err);
  }
}

runTests();
