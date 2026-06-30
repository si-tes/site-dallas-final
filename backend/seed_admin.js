const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function seedAdmin() {
  const email = 'dallaimports08@gmail.com';
  const senha = '12345678';
  const nome = 'Administrador Dalla';

  try {
    const res = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    
    if (res.rows.length > 0) {
      console.log('Admin já existe no banco de dados.');
    } else {
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES ($1, $2, $3, true)',
        [nome, email, hash]
      );
      console.log('Admin criado com sucesso!');
    }
  } catch (err) {
    console.error('Erro ao executar seed:', err);
  } finally {
    pool.end();
  }
}

seedAdmin();
