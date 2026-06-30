const pool = require('../config/db');

// Listar estoque completo (com filtro opcional por camisa_id)
const listarEstoque = async (req, res) => {
  try {
    const { camisa_id } = req.query;
    let query = `
      SELECT 
        e.id,
        c.nome as camisa,
        t.nome as tamanho,
        e.quantidade,
        e.updated_at
      FROM estoque e
      INNER JOIN camisas c ON e.camisa_id = c.id
      INNER JOIN tamanhos t ON e.tamanho_id = t.id
    `;
    const params = [];

    if (camisa_id) {
      query += ` WHERE e.camisa_id = $1`;
      params.push(camisa_id);
    }

    query += ` ORDER BY c.nome, t.nome`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar estoque');
  }
};

// Criar estoque
const criarEstoque = async (req, res) => {
  try {
    const { camisa_id, tamanho_id, quantidade } = req.body;

    // Validações básicas
    if (camisa_id === undefined || tamanho_id === undefined || quantidade === undefined) {
      return res.status(400).json({ erro: 'Campos obrigatórios: camisa_id, tamanho_id, quantidade' });
    }

    // Validar quantidade
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      return res.status(400).json({ erro: 'Quantidade deve ser um número inteiro maior ou igual a 0' });
    }

    // Validar se camisa_id existe
    const camisaResult = await pool.query('SELECT id FROM camisas WHERE id = $1', [camisa_id]);
    if (camisaResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Camisa não encontrada' });
    }

    // Validar se tamanho_id existe
    const tamanhoResult = await pool.query('SELECT id FROM tamanhos WHERE id = $1', [tamanho_id]);
    if (tamanhoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Tamanho não encontrado' });
    }

    // Validar unicidade (camisa_id, tamanho_id)
    const duplicataResult = await pool.query(
      'SELECT id FROM estoque WHERE camisa_id = $1 AND tamanho_id = $2',
      [camisa_id, tamanho_id]
    );
    if (duplicataResult.rows.length > 0) {
      return res.status(409).json({ erro: 'Este estoque (camisa + tamanho) já existe' });
    }

    // Inserir estoque
    const result = await pool.query(
      `INSERT INTO estoque (camisa_id, tamanho_id, quantidade) 
       VALUES ($1, $2, $3) 
       RETURNING id, camisa_id, tamanho_id, quantidade, updated_at`,
      [camisa_id, tamanho_id, quantidade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar estoque');
  }
};

// Atualizar estoque (quantidade)
const atualizarEstoque = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;

    // Validar se estoque existe
    const checkResult = await pool.query('SELECT * FROM estoque WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Estoque não encontrado' });
    }

    // Validar quantidade
    if (quantidade === undefined) {
      return res.status(400).json({ erro: 'Campo obrigatório: quantidade' });
    }

    if (!Number.isInteger(quantidade) || quantidade < 0) {
      return res.status(400).json({ erro: 'Quantidade deve ser um número inteiro maior ou igual a 0' });
    }

    // Atualizar quantidade
    const result = await pool.query(
      `UPDATE estoque SET quantidade = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, camisa_id, tamanho_id, quantidade, updated_at`,
      [quantidade, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar estoque');
  }
};

// Deletar estoque
const deletarEstoque = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar se estoque existe
    const checkResult = await pool.query('SELECT * FROM estoque WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Estoque não encontrado' });
    }

    // Deletar estoque
    await pool.query('DELETE FROM estoque WHERE id = $1', [id]);

    res.json({ mensagem: 'Estoque deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar estoque');
  }
};

module.exports = {
  listarEstoque,
  criarEstoque,
  atualizarEstoque,
  deletarEstoque,
};