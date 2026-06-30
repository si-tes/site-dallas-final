const pool = require('../config/db');
const mpService = require('../services/mercadopagoService');

const criarPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const { dadosCliente, itens, total: totalFrontend, frete, codigo_cupom } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: 'O carrinho está vazio' });
    }

    await client.query('BEGIN');

    // Recalcular subtotal
    const subtotal = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    let valor_desconto = 0;
    let cupom_id = null;
    let cupomDebug = null;
    if (codigo_cupom) {
      const cupomResult = await client.query('SELECT * FROM cupons WHERE codigo = $1', [codigo_cupom.toUpperCase()]);
      if (cupomResult.rows.length > 0) {
        const cupom = cupomResult.rows[0];
        cupomDebug = cupom;
        if (cupom.ativo && (!cupom.data_validade || new Date(cupom.data_validade) >= new Date())) {
          cupom_id = cupom.id;
          if (cupom.tipo_desconto === 'percentual') {
            valor_desconto = subtotal * (Number(cupom.valor) / 100);
          } else if (cupom.tipo_desconto === 'fixo') {
            valor_desconto = Number(cupom.valor);
          }
          // Garante que o desconto não exceda o subtotal dos produtos
          if (valor_desconto > subtotal) {
            valor_desconto = subtotal;
          }
        }
      }
    }

    const valorFreteNum = frete || 0;
    const totalCalculado = subtotal - valor_desconto + valorFreteNum;

    // 1. Inserir na tabela pedidos
    const insertPedidoText = `
      INSERT INTO pedidos (
        usuario_id, nome_cliente, email_cliente, telefone_cliente, cpf_cliente,
        endereco_cep, endereco_rua, endereco_numero, 
        endereco_bairro, endereco_cidade, endereco_estado, endereco_complemento,
        total, valor_frete, status, payment_status, cupom_id, valor_desconto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `;
    const pedidoValues = [
      dadosCliente.usuario_id || null,
      dadosCliente.nome,
      dadosCliente.email,
      dadosCliente.telefone,
      dadosCliente.cpf,
      dadosCliente.cep,
      dadosCliente.rua,
      dadosCliente.numero,
      dadosCliente.bairro,
      dadosCliente.cidade,
      dadosCliente.estado,
      dadosCliente.complemento || null,
      totalCalculado,
      valorFreteNum,
      'pendente',
      'aguardando_pagamento',
      cupom_id,
      valor_desconto
    ];

    const pedidoResult = await client.query(insertPedidoText, pedidoValues);
    const pedidoId = pedidoResult.rows[0].id;

    // 2. Inserir na tabela pedido_itens e decrementar estoque
    const insertItemText = `
      INSERT INTO pedido_itens (pedido_id, camisa_id, tamanho_id, quantidade, preco_unitario)
      VALUES ($1, $2, $3, $4, $5)
    `;
    for (const item of itens) {
      const itemValues = [
        pedidoId,
        item.produtoId,
        item.tamanhoId,
        item.quantidade,
        item.preco
      ];
      await client.query(insertItemText, itemValues);

      // Decrementar estoque automaticamente
      const estoqueCheck = await client.query(
        'SELECT quantidade FROM estoque WHERE camisa_id = $1 AND tamanho_id = $2',
        [item.produtoId, item.tamanhoId]
      );
      if (estoqueCheck.rows.length > 0) {
        const qtdAtual = estoqueCheck.rows[0].quantidade;
        if (qtdAtual < item.quantidade) {
          throw new Error(`Estoque insuficiente para o produto ID ${item.produtoId} no tamanho ID ${item.tamanhoId}`);
        }
        await client.query(
          'UPDATE estoque SET quantidade = quantidade - $1, updated_at = CURRENT_TIMESTAMP WHERE camisa_id = $2 AND tamanho_id = $3',
          [item.quantidade, item.produtoId, item.tamanhoId]
        );
      }
    }

    // 3. Criar preferência no Mercado Pago
    let checkoutUrl = null;
    try {
      const preferencia = await mpService.criarPreferencia(pedidoId, itens, dadosCliente, frete, valor_desconto);
      const mpPreferenceId = preferencia.id;
      checkoutUrl = process.env.NODE_ENV === 'production' ? preferencia.init_point : preferencia.sandbox_init_point || preferencia.init_point;

      // 4. Salvar mp_preference_id
      await client.query('UPDATE pedidos SET mp_preference_id = $1 WHERE id = $2', [mpPreferenceId, pedidoId]);
    } catch (mpError) {
      console.warn('[AVISO] Erro ao criar preferência no Mercado Pago (provavelmente credenciais ausentes ou inválidas):', mpError.message);
      checkoutUrl = `mock-success`;
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      mensagem: 'Pedido criado com sucesso', 
      pedidoId,
      checkoutUrl
    });
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido:', erro);
    if (erro.message && erro.message.startsWith('Estoque insuficiente')) {
      return res.status(400).json({ erro: erro.message });
    }
    res.status(500).json({ erro: 'Erro interno ao processar o pedido' });
  } finally {
    client.release();
  }
};

const meusPedidos = async (req, res) => {
  try {
    console.log('--- LOG: GET /pedidos/meus-pedidos ---');
    console.log('req.user completo:', req.user);
    console.log('req.userId do middleware:', req.userId);

    const userId = req.user ? req.user.id : req.userId;
    const query = 'SELECT id, total, valor_frete, status, payment_status, created_at FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC';
    const values = [userId];

    console.log('Query SQL:', query);
    console.log('Parametros:', values);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('--- LOG ERROR: GET /pedidos/meus-pedidos ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erro interno ao buscar pedidos', details: error.message });
  }
};

const listarPedidosAdmin = async (req, res) => {
  try {
    const { status, dataInicio, dataFim } = req.query;
    let query = 'SELECT * FROM pedidos WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (status && status !== 'Todos') {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (dataInicio) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(`${dataInicio} 00:00:00`);
      paramIndex++;
    }

    if (dataFim) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(`${dataFim} 23:59:59`);
      paramIndex++;
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos admin:', error);
    res.status(500).json({ error: 'Erro interno ao listar pedidos' });
  }
};

const obterPedidoDetalhadoAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obter dados básicos do pedido
    const pedidoResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (pedidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    const pedido = pedidoResult.rows[0];

    // Obter itens detalhados com JOIN
    const itensQuery = `
      SELECT pi.*, c.nome as camisa_nome, t.nome as tamanho_nome
      FROM pedido_itens pi
      JOIN camisas c ON pi.camisa_id = c.id
      JOIN tamanhos t ON pi.tamanho_id = t.id
      WHERE pi.pedido_id = $1
    `;
    const itensResult = await pool.query(itensQuery, [id]);
    
    res.json({
      ...pedido,
      itens: itensResult.rows
    });
  } catch (error) {
    console.error('Erro ao detalhar pedido admin:', error);
    res.status(500).json({ error: 'Erro interno ao detalhar pedido' });
  }
};

const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    // Busca status anterior para log
    const oldStatusResult = await pool.query('SELECT status FROM pedidos WHERE id = $1', [id]);
    if (oldStatusResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    const oldStatus = oldStatusResult.rows[0].status;

    // Atualiza status
    await pool.query('UPDATE pedidos SET status = $1 WHERE id = $2', [status, id]);

    // Rastreabilidade mínima solicitada
    console.log(`[AUDITORIA] Pedido #${id} | Status Anterior: ${oldStatus} | Novo Status: ${status} | Data/Hora: ${new Date().toISOString()}`);

    res.json({ success: true, message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar status' });
  }
};

const obterRastreioPublico = async (req, res) => {
  try {
    const { id } = req.params;
    const pedidoId = parseInt(id.replace(/\D/g, ''), 10);
    if (isNaN(pedidoId)) {
      return res.status(400).json({ error: 'Código de pedido inválido' });
    }

    const result = await pool.query(
      'SELECT id, status, payment_status, created_at FROM pedidos WHERE id = $1',
      [pedidoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar rastreio público:', error);
    res.status(500).json({ error: 'Erro interno ao buscar status' });
  }
};

module.exports = {
  criarPedido,
  meusPedidos,
  listarPedidosAdmin,
  obterPedidoDetalhadoAdmin,
  atualizarStatusPedido,
  obterRastreioPublico
};
