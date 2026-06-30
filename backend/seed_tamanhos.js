const pool = require('./src/config/db');
async function run() {
  try {
    const res = await pool.query('SELECT count(*) FROM tamanhos');
    if (res.rows[0].count === '0' || res.rows[0].count === '1') {
      await pool.query('TRUNCATE tamanhos RESTART IDENTITY CASCADE');
      await pool.query("INSERT INTO tamanhos (nome) VALUES ('P'), ('M'), ('G'), ('GG'), ('XG')");
      console.log('Tamanhos inseridos com sucesso.');
    } else {
      console.log('Tamanhos ja existem.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
