const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', pedidoController.criarPedido);
router.get('/meus-pedidos', authMiddleware, pedidoController.meusPedidos);
router.get('/rastreio/:id', pedidoController.obterRastreioPublico);

// Rotas Administrativas
router.get('/admin', authMiddleware, adminMiddleware, pedidoController.listarPedidosAdmin);
router.get('/admin/:id', authMiddleware, adminMiddleware, pedidoController.obterPedidoDetalhadoAdmin);
router.put('/admin/:id/status', authMiddleware, adminMiddleware, pedidoController.atualizarStatusPedido);

module.exports = router;
