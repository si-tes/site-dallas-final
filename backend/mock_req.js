const pedidoController = require('./src/controllers/pedidoController');
const pool = require('./src/config/db');

const req = {
  body: {
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
  }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('RES.JSON:', data);
    pool.end();
  }
};

pedidoController.criarPedido(req, res).catch(err => {
  console.error("ERRO MOCK:", err);
  pool.end();
});
