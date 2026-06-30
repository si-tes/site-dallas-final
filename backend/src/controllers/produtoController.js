const pool = require('../config/db');

// Listar produtos
const listarProdutos = async (req, res) => {
  try {
    const { all } = req.query;
    let query = `
      SELECT c.*, 
        (SELECT url_imagem FROM produto_imagens pi WHERE pi.camisa_id = c.id ORDER BY id ASC OFFSET 1 LIMIT 1) as imagem2
      FROM camisas c
    `;
    if (all !== 'true') {
      query += ' WHERE c.ativo = true';
    }
    query += ' ORDER BY c.id ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar produtos');
  }
};

// Obter produto por ID
const obterProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM camisas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }
    
    if (result.rows[0].ativo === false) {
      return res.status(404).json({ erro: 'Produto indisponível ou inativo' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar produto');
  }
};

// Criar produto
const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, tipo_venda } = req.body;

    // validação básica
    if (!nome || !preco || !tipo_venda) {
      return res.status(400).send('Campos obrigatórios: nome, preco, tipo_venda');
    }

    const result = await pool.query(
      'INSERT INTO camisas (nome, descricao, preco, tipo_venda) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, preco, tipo_venda]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar produto');
  }
};

// Editar produto (atualização parcial)
const editarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, tipo_venda, ativo } = req.body;

    // Validar se o produto existe
    const checkResult = await pool.query('SELECT * FROM camisas WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    // Validar se pelo menos um campo válido foi enviado
    if (nome === undefined && descricao === undefined && preco === undefined && tipo_venda === undefined && ativo === undefined) {
      return res.status(400).json({ erro: 'Nenhum campo válido para atualização' });
    }

    // Construir UPDATE dinâmico
    const campos = [];
    const valores = [];
    let contador = 1;

    if (nome !== undefined) {
      campos.push(`nome = $${contador}`);
      valores.push(nome);
      contador++;
    }
    if (descricao !== undefined) {
      campos.push(`descricao = $${contador}`);
      valores.push(descricao);
      contador++;
    }
    if (preco !== undefined) {
      campos.push(`preco = $${contador}`);
      valores.push(preco);
      contador++;
    }
    if (tipo_venda !== undefined) {
      campos.push(`tipo_venda = $${contador}`);
      valores.push(tipo_venda);
      contador++;
    }
    if (ativo !== undefined) {
      campos.push(`ativo = $${contador}`);
      valores.push(ativo);
      contador++;
    }

    valores.push(id); // adiciona id como último parâmetro

    const query = `UPDATE camisas SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;
    const result = await pool.query(query, valores);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar produto');
  }
};

// Deletar produto (Soft Delete / Inativar)
const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar se o produto existe
    const checkResult = await pool.query('SELECT * FROM camisas WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    // Desativar produto
    await pool.query('UPDATE camisas SET ativo = false WHERE id = $1', [id]);

    res.json({ mensagem: 'Produto desativado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao desativar produto');
  }
};

module.exports = {
  listarProdutos,
  obterProduto,
  criarProduto,
  editarProduto,
  deletarProduto,
};