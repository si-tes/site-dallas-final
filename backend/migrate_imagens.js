const pool = require('./src/config/db');

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produto_imagens (
        id SERIAL PRIMARY KEY,
        camisa_id INTEGER REFERENCES camisas(id) ON DELETE CASCADE,
        url_imagem TEXT NOT NULL,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela produto_imagens criada.');
    
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE indexname = 'idx_produto_imagens_camisa_id'
        ) THEN
          CREATE INDEX idx_produto_imagens_camisa_id ON produto_imagens(camisa_id);
        END IF;
      END $$;
    `);
    console.log('Indice criado.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
})();
