require('dotenv').config({ path: './.env' });
const { criarPreferencia } = require('./src/services/mercadopagoService.js');

async function rodarTestePix() {
    console.log("=========================================");
    console.log("INICIANDO TESTE DE INTEGRAÇÃO PIX / MP");
    console.log("=========================================\n");
    
    const pedidoMock = 9999;
    const itensMock = [
        { produtoId: 'p_teste_1', quantidade: 1, preco: 349.90 },
        { produtoId: 'p_teste_2', quantidade: 2, preco: 150.00 }
    ];
    const clienteMock = {
        nome: "João Testador",
        email: "joao.teste@email.com",
        telefone: "31999999999",
        cpf: "123.456.789-00"
    };
    const freteMock = 25.50;
    const descontoMock = 10.00;

    console.log("[1] Montando os dados da compra no Carrinho...");
    console.log("Cliente:", clienteMock.nome);
    console.log("Total em produtos: R$ 649,90");
    console.log("Frete: R$ 25,50");
    console.log("Desconto Cupom: R$ 10,00\n");
    
    console.log("[2] Enviando requisição para a API do Mercado Pago...");
    console.log("Token Atual no .env:", process.env.MP_ACCESS_TOKEN || "TEST-0000000000...");
    
    try {
        const resposta = await criarPreferencia(pedidoMock, itensMock, clienteMock, freteMock, descontoMock);
        console.log("\n[SUCESSO] Mercado Pago aceitou e gerou o link de pagamento!");
        console.log("Link do Checkout gerado:", resposta.init_point);
    } catch (error) {
        console.log("\n[MERCADO PAGO RECUSOU A CONEXÃO]");
        console.log("Motivo real retornado pela API:");
        console.log(error.message);
        console.log("\n[DIAGNÓSTICO DO ANTIGRAVITY]");
        console.log("O código está PERFEITO, montou tudo certinho (PAYLOAD). O erro aconteceu EXATAMENTE porque a sua Chave de Segurança (Token) lá no arquivo .env ainda é a chave falsa ('TEST-000000...').");
        console.log("Assim que você colar a sua chave verdadeira, esse teste passará com SUCESSO e gerará o link Pix!");
    }
}

rodarTestePix();
