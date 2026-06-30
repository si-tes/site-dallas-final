const pool = require('./src/config/db');
pool.query("SELECT * FROM cupons WHERE codigo = 'GANHE100'")
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(e => { console.error(e); pool.end(); });
