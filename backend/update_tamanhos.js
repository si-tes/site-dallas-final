const pool = require('./src/config/db');

async function updateTamanhos() {
  try {
    // 1. Add column if not exists and set default to 0
    await pool.query('ALTER TABLE tamanhos ADD COLUMN IF NOT EXISTS acrescimo_preco DECIMAL(10,2) DEFAULT 0;');
    console.log('Coluna acrescimo_preco verificada/adicionada com sucesso.');

    // 2. Ensure existing sizes have acrescimo_preco = 0 if null
    await pool.query('UPDATE tamanhos SET acrescimo_preco = 0 WHERE acrescimo_preco IS NULL;');
    console.log('Tamanhos antigos atualizados para acréscimo 0.');

    // 3. Insert new sizes avoiding duplicates
    const queries = [
      `INSERT INTO tamanhos (nome, acrescimo_preco) 
       SELECT '2GG', 15.00 
       WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '2GG');`,

      `INSERT INTO tamanhos (nome, acrescimo_preco) 
       SELECT '3GG', 25.00 
       WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '3GG');`,

      `INSERT INTO tamanhos (nome, acrescimo_preco) 
       SELECT '4GG', 25.00 
       WHERE NOT EXISTS (SELECT 1 FROM tamanhos WHERE nome = '4GG');`
    ];

    for (let q of queries) {
      await pool.query(q);
    }
    console.log('Tamanhos especiais verificados/inseridos com sucesso.');

  } catch (error) {
    console.error('Erro na atualização:', error);
  } finally {
    process.exit(0);
  }
}

updateTamanhos();
