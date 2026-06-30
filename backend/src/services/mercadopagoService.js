const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-0000-0000-0000-000000000000', 
  options: { timeout: 5000 } 
});

const criarPreferencia = async (pedidoId, itens, dadosCliente, frete, desconto = 0) => {
  try {
    const preference = new Preference(client);

    const items = itens.map(item => ({
      id: String(item.produtoId),
      title: `Produto ID ${item.produtoId}`,
      quantity: item.quantidade,
      unit_price: Number(item.preco)
    }));

    if (frete && Number(frete) > 0) {
      items.push({
        id: 'FRETE',
        title: 'Custo de Entrega',
        quantity: 1,
        unit_price: Number(frete)
      });
    }

    if (desconto && Number(desconto) > 0) {
      items.push({
        id: 'DESCONTO',
        title: 'Cupom de Desconto',
        quantity: 1,
        unit_price: -Number(desconto)
      });
    }

    // Mercado Pago exige https em back_urls, se for localhost convertemos apenas para passar na validação
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const safeUrl = baseUrl.startsWith('http://localhost') ? baseUrl.replace('http://', 'https://') : baseUrl;

    const body = {
      items,
      payer: {
        name: dadosCliente.nome,
        email: dadosCliente.email,
        phone: {
          number: dadosCliente.telefone
        },
        identification: {
          type: 'CPF',
          number: dadosCliente.cpf ? dadosCliente.cpf.replace(/\D/g, '') : ''
        }
      },
      back_urls: {
        success: `${safeUrl}/minha-conta`,
        failure: `${safeUrl}/minha-conta`,
        pending: `${safeUrl}/minha-conta`
      },
      auto_return: 'approved',
      external_reference: String(pedidoId),
    };

    console.log('PAYLOAD MP:', JSON.stringify(body, null, 2));

    const response = await preference.create({ body });
    return response;
  } catch (error) {
    console.error('--- ERRO MERCADO PAGO ---');
    console.error('Detalhes do erro:', error.message || error);
    console.error('Verifique se a variável MP_ACCESS_TOKEN está correta no arquivo .env');
    throw new Error('Falha ao conectar com o Mercado Pago. Verifique o Access Token.');
  }
};

const obterPagamento = async (paymentId) => {
  const payment = new Payment(client);
  const response = await payment.get({ id: paymentId });
  return response;
};

module.exports = {
  criarPreferencia,
  obterPagamento
};
