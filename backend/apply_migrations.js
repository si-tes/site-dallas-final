const pool = require('./src/config/db');
async function run() {
  try {
    await pool.query('ALTER TABLE pedidos ADD COLUMN cpf_cliente character varying(14);');
    console.log('Added cpf_cliente to pedidos.');
    
    await pool.query(`
      CREATE TABLE cupons (
        id SERIAL PRIMARY KEY,
        codigo character varying(50) UNIQUE NOT NULL,
        tipo_desconto character varying(20) NOT NULL,
        valor numeric NOT NULL,
        ativo boolean DEFAULT true,
        data_validade timestamp without time zone
      );
    `);
    console.log('Created cupons table.');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    pool.end();
  }
}
run();
