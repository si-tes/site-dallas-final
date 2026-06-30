const pool = require('./src/config/db');
async function run() {
  await pool.query("INSERT INTO camisas (id, nome) VALUES (1, 'Camisa Mock') ON CONFLICT DO NOTHING;");
  await pool.query("INSERT INTO tamanhos (id, nome) VALUES (1, 'M') ON CONFLICT DO NOTHING;");
  console.log("Mock data inserted.");
  pool.end();
}
run();
