const pool = require('./src/config/db');

const sql = `
  ALTER TABLE pedidos 
    ADD COLUMN IF NOT EXISTS cupom_id INT REFERENCES cupons(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS valor_desconto DECIMAL(10,2) DEFAULT 0.00;

  ALTER TABLE cupons
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`;

pool.query(sql)
  .then(() => { console.log("DB atualizado com sucesso!"); pool.end(); })
  .catch(e => { console.error("Erro:", e); pool.end(); });
