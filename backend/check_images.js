const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function checkImages() {
  try {
    const result = await pool.query('SELECT id, nome, imagem FROM camisas ORDER BY id');
    const products = result.rows;

    console.log(`\nTotal de produtos no banco: ${products.length}\n`);

    let semImagem = 0;
    let imagemOk = 0;
    let imagemQuebrada = 0;
    const quebradas = [];

    for (const p of products) {
      if (!p.imagem) {
        semImagem++;
        console.log(`[SEM IMAGEM] ID ${p.id}: ${p.nome}`);
        continue;
      }

      const fullPath = path.join(ROOT, p.imagem);
      if (fs.existsSync(fullPath)) {
        imagemOk++;
      } else {
        imagemQuebrada++;
        quebradas.push({ id: p.id, nome: p.nome, caminho: p.imagem });
      }
    }

    console.log(`\n===== RESULTADO =====`);
    console.log(`✅ Com imagem no disco: ${imagemOk}`);
    console.log(`⚠️  Sem imagem cadastrada: ${semImagem}`);
    console.log(`❌ Caminho quebrado (arquivo não existe): ${imagemQuebrada}`);

    if (quebradas.length > 0) {
      console.log(`\n--- Produtos com caminho de imagem errado ---`);
      quebradas.forEach(q => console.log(`  ID ${q.id}: ${q.nome}\n  Caminho: ${q.caminho}`));
    }

    // Verificar galeria também
    const galRes = await pool.query(`
      SELECT pi.camisa_id, pi.url_imagem, c.nome 
      FROM produto_imagens pi 
      JOIN camisas c ON pi.camisa_id = c.id
      ORDER BY pi.camisa_id, pi.id
    `);
    
    let galeriaOk = 0;
    let galeriaQuebrada = 0;
    const galeriaQuebradas = [];

    for (const img of galRes.rows) {
      const fullPath = path.join(ROOT, img.url_imagem);
      if (fs.existsSync(fullPath)) {
        galeriaOk++;
      } else {
        galeriaQuebrada++;
        if (galeriaQuebradas.length < 5) {
          galeriaQuebradas.push(`Camisa ${img.camisa_id} (${img.nome}): ${img.url_imagem}`);
        }
      }
    }

    console.log(`\n===== GALERIA =====`);
    console.log(`✅ Fotos de galeria no disco: ${galeriaOk}`);
    console.log(`❌ Fotos de galeria com caminho quebrado: ${galeriaQuebrada}`);
    if (galeriaQuebradas.length > 0) {
      console.log(`Exemplos de caminhos quebrados:`);
      galeriaQuebradas.forEach(g => console.log(`  ${g}`));
    }

  } catch(e) {
    console.error('ERRO:', e.message);
  } finally {
    await pool.end();
  }
}

checkImages();
