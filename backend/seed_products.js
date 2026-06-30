const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    const productsJsPath = path.join(__dirname, '../products.js');
    if (!fs.existsSync(productsJsPath)) {
      console.error('products.js não encontrado na raiz!');
      process.exit(1);
    }

    const content = fs.readFileSync(productsJsPath, 'utf8');
    // Encontrar o início do array de produtos
    const startIdx = content.indexOf('[');
    const endIdx = content.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1) {
      console.error('Não foi possível extrair o array de produtos de products.js');
      process.exit(1);
    }

    const jsonText = content.substring(startIdx, endIdx + 1);
    const products = JSON.parse(jsonText);

    console.log(`Encontrados ${products.length} produtos em products.js.`);

    // Importar TODOS os produtos
    const sliceProducts = products;

    for (let p of sliceProducts) {
      // Remover formatação brasileira do preço para converter em float
      const priceStr = p.price.replace('.', '').replace(',', '.');
      const priceVal = parseFloat(priceStr) || 170.00;

      // Detectar tipo de venda (pronta_entrega ou drop)
      let tipoVenda = 'pronta_entrega';
      if (p.cat && p.cat.toLowerCase().includes('jogador')) {
        tipoVenda = 'drop'; // Exemplo de mapeamento
      }

      // Inserir camisa
      const res = await pool.query(
        `INSERT INTO camisas (nome, descricao, preco, tipo_venda, imagem, ativo) 
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [p.name, `Camisa modelo ${p.cat || 'Torcedor'} de alta qualidade.`, priceVal, tipoVenda, p.img1]
      );

      if (res.rows.length > 0) {
        const camisaId = res.rows[0].id;
        console.log(`Camisa inserida: ${p.name} (ID: ${camisaId})`);

        // Adicionar estoque inicial para cada tamanho (P, M, G, GG, XG, 2GG, 3GG, 4GG)
        const tamanhosRes = await pool.query('SELECT id FROM tamanhos');
        for (let t of tamanhosRes.rows) {
          await pool.query(
            `INSERT INTO estoque (camisa_id, tamanho_id, quantidade) 
             VALUES ($1, $2, 10)
             ON CONFLICT DO NOTHING`,
            [camisaId, t.id]
          );
        }

        // Adicionar galeria de imagens
        if (p.gallery && Array.isArray(p.gallery)) {
          for (let imgUrl of p.gallery) {
            await pool.query(
              `INSERT INTO produto_imagens (camisa_id, url_imagem) 
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [camisaId, imgUrl]
            );
          }
        }
      } else {
        console.log(`Camisa já existente ou conflito: ${p.name}`);
      }
    }

    console.log('Seed de produtos e estoque concluído com sucesso! 🎉');
  } catch (error) {
    console.error('Erro ao executar seed de produtos:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
