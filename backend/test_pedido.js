// Utilizando fetch nativo do Node 24
async function testar() {
  try {
    const response = await fetch('http://localhost:3000/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dadosCliente: {
          nome: "Teste",
          email: "teste@teste.com",
          telefone: "11999999999",
          cpf: "12345678901",
          cep: "01000000",
          rua: "Rua Teste",
          numero: "123",
          bairro: "Bairro Teste",
          cidade: "Cidade Teste",
          estado: "SP",
          complemento: ""
        },
        itens: [
          { produtoId: 1, tamanhoId: 1, quantidade: 1, preco: 249.90 }
        ],
        total: 161.90,
        frete: 12.00,
        codigo_cupom: 'GANHE100'
      })
    });
    
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Body:', text);
  } catch (err) {
    console.error(err);
  }
}

testar();
