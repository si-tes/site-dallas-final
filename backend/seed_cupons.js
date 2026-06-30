const pool = require('./src/config/db');

async function seed() {
  await pool.query(
    "INSERT INTO cupons (codigo, tipo_desconto, valor, ativo) VALUES ('DALLA10', 'percentual', 10, true) ON CONFLICT DO NOTHING"
  );
  await pool.query(
    "INSERT INTO cupons (codigo, tipo_desconto, valor, ativo) VALUES ('FRETE20', 'fixo', 20, true) ON CONFLICT DO NOTHING"
  );
  console.log('Cupons criados: DALLA10 (10% desconto) e FRETE20 (R$20 fixo)');
  await pool.end();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
