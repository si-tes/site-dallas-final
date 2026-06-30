const pool = require('./src/config/db');

async function addAtivo() {
  try {
    await pool.query('ALTER TABLE camisas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;');
    console.log('Coluna ativo adicionada com sucesso!');
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    pool.end();
  }
}

addAtivo();
