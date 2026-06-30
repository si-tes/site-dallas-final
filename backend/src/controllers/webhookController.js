const pool = require('../config/db');
const mpService = require('../services/mercadopagoService');

const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const { action, data, type } = req.body;
    
    // MP docs enviam { action: 'payment.created', data: { id: '...' } } ou type === 'payment' (versões antigas de notificação)
    if (action === 'payment.created' || action === 'payment.updated' || type === 'payment') {
      const paymentId = data?.id || req.query['data.id'] || req.query.id;
      if (!paymentId) return res.status(200).send('OK');

      // Obter os dados reais e validados do MP pedindo ativamente a api
      const payment = await mpService.obterPagamento(paymentId);
      
      const pedidoId = payment.external_reference;
      const statusMP = payment.status; // 'approved', 'rejected', 'cancelled', 'refunded', 'pending', 'in_process'

      if (!pedidoId || pedidoId === 'null') return res.status(200).send('OK');

      // Mapear status MP -> Nosso banco
      let statusFinanceiro = 'aguardando_pagamento';
      if (statusMP === 'approved') statusFinanceiro = 'pago';
      else if (statusMP === 'rejected') statusFinanceiro = 'recusado';
      else if (statusMP === 'cancelled') statusFinanceiro = 'cancelado';
      else if (statusMP === 'refunded') statusFinanceiro = 'reembolsado';

      // Idempotência
      const checkResult = await pool.query('SELECT payment_status, mp_payment_id FROM pedidos WHERE id = $1', [pedidoId]);
      if (checkResult.rows.length === 0) return res.status(200).send('OK');

      const dbPedido = checkResult.rows[0];
      
      // Se o pedido já está pago, protegemos contra duplicação/atraso
      if (dbPedido.payment_status === 'pago') {
        return res.status(200).send('OK');
      }

      await pool.query(
        'UPDATE pedidos SET payment_status = $1, mp_payment_id = $2 WHERE id = $3',
        [statusFinanceiro, String(paymentId), pedidoId]
      );

      console.log(`[WEBHOOK] Pedido #${pedidoId} | PaymentID: ${paymentId} | MP Status: ${statusMP} | Novo PaymentStatus: ${statusFinanceiro}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook MP:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  handleMercadoPagoWebhook
};
