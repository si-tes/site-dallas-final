const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dalla_db',
  password: 'admin2026',
  port: 5432,
});

module.exports = pool;