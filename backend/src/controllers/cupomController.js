const pool = require('../config/db');

const listarCupons = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cupons ORDER BY created_at DESC, id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar cupons:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

const criarCupom = async (req, res) => {
  try {
    const { codigo, tipo_desconto, valor, ativo, data_validade } = req.body;
    
    if (!codigo || !tipo_desconto || valor === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios: codigo, tipo_desconto, valor' });
    }

    const query = `
      INSERT INTO cupons (codigo, tipo_desconto, valor, ativo, data_validade)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [codigo.toUpperCase(), tipo_desconto, valor, ativo !== undefined ? ativo : true, data_validade || null];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }
    console.error('Erro ao criar cupom:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

const atualizarCupom = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, tipo_desconto, valor, ativo, data_validade } = req.body;
    
    const query = `
      UPDATE cupons
      SET codigo = $1, tipo_desconto = $2, valor = $3, ativo = $4, data_validade = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [codigo.toUpperCase(), tipo_desconto, valor, ativo, data_validade || null, id];
    
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cupom não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }
    console.error('Erro ao atualizar cupom:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

const validarCupom = async (req, res) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Código não fornecido' });

    const result = await pool.query('SELECT * FROM cupons WHERE codigo = $1', [codigo.toUpperCase()]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cupom não encontrado' });

    const cupom = result.rows[0];

    if (!cupom.ativo) {
      return res.status(400).json({ error: 'Este cupom está inativo' });
    }

    if (cupom.data_validade && new Date(cupom.data_validade) < new Date()) {
      return res.status(400).json({ error: 'Este cupom está expirado' });
    }

    res.json(cupom);
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    res.status(500).json({ error: 'Erro interno ao validar cupom' });
  }
};

const validarCupomGet = async (req, res) => {
  try {
    const { codigo } = req.params;
    if (!codigo) return res.status(400).json({ error: 'Código não fornecido' });

    const result = await pool.query('SELECT * FROM cupons WHERE codigo = $1', [codigo.toUpperCase()]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cupom não encontrado' });

    const cupom = result.rows[0];
    if (!cupom.ativo) return res.status(400).json({ error: 'Este cupom está inativo' });
    if (cupom.data_validade && new Date(cupom.data_validade) < new Date()) {
      return res.status(400).json({ error: 'Este cupom está expirado' });
    }

    res.json(cupom);
  } catch (error) {
    console.error('Erro ao validar cupom (GET):', error);
    res.status(500).json({ error: 'Erro interno ao validar cupom' });
  }
};

module.exports = {
  listarCupons,
  criarCupom,
  atualizarCupom,
  validarCupom,
  validarCupomGet
};
