const pool = require('../config/db');

// Listar tamanhos
const listarTamanhos = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, acrescimo_preco FROM tamanhos ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tamanhos');
  }
};

module.exports = {
  listarTamanhos,
};