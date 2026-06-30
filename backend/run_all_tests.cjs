require('dotenv').config({ path: './.env' });
const { Pool } = require('pg');
const fs = require('fs');

async function runSuite() {
    console.log("=== INICIANDO SUÍTE DE TESTES DALLA IMPORTS ===");
    let passCount = 0;
    let failCount = 0;

    function assertTest(name, condition) {
        if (condition) {
            console.log(`[PASS] ${name}`);
            passCount++;
        } else {
            console.error(`[FAIL] ${name}`);
            failCount++;
        }
    }

    // 1. DATABASE TESTS
    console.log("\n--- TESTES DE BANCO DE DADOS E ESTOQUE ---");
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'dalla_db',
        password: 'admin2026',
        port: 5432,
    });

    try {
        const client = await pool.connect();
        assertTest("Conexão com PostgreSQL bem-sucedida", true);
        
        // Count products
        const results = await client.query('SELECT COUNT(*) as total FROM camisas');
        const total = parseInt(results.rows[0].total);
        assertTest(`Tabela Produtos contém os itens raspados (${total} itens)`, total >= 1200);

        client.release();
    } catch (e) {
        assertTest("Conexão com PostgreSQL bem-sucedida (Erro: " + e.message + ")", false);
    }

    // 2. FRONTEND TESTS
    console.log("\n--- TESTES DE INTEGRIDADE DO FRONTEND ---");
    try {
        const html = fs.readFileSync('../teste_1.html', 'utf8');
        assertTest("O arquivo teste_1.html existe e pode ser lido", html.length > 0);
        
        const openDivs = (html.match(/<div\b/g) || []).length;
        const closeDivs = (html.match(/<\/div>/g) || []).length;
        // Minor discrepancies are okay in rough regex, but they should be close
        const divDiff = Math.abs(openDivs - closeDivs);
        assertTest(`Estrutura de divs HTML parece íntegra (Diferença: ${divDiff})`, divDiff < 10);
        
        assertTest("O script do carrinho (addToCart) está presente no HTML", html.includes('addToCart'));
        assertTest("O componente do Hero Carousel está presente", html.includes('id="hero-slider"'));
        assertTest("A integração com ViaCEP está presente", html.includes('viacep.com.br'));
        assertTest("A biblioteca de UI (Lucide) está configurada", html.includes('lucide'));
        assertTest("O banco de dados de produtos do frontend (products.js) existe", fs.existsSync('../products.js'));

    } catch (e) {
        console.log("Erro ao testar frontend:", e);
    }

    // 3. MERCADO PAGO INTEGRATION
    console.log("\n--- TESTES DE CHECKOUT / MERCADO PAGO ---");
    try {
        const token = process.env.MP_ACCESS_TOKEN;
        assertTest(`Token do MP está configurado no .env (${token.substring(0,10)}...)`, token && token.startsWith('APP_USR-'));
        // We already tested MP generation, so we just verify the env structure
    } catch(e) {
         assertTest("Teste do token MP falhou", false);
    }

    console.log("\n==================================================");
    console.log(`RESULTADO FINAL: ${passCount} Passaram | ${failCount} Falharam`);
    console.log("==================================================");
    
    await pool.end();
}

runSuite();
