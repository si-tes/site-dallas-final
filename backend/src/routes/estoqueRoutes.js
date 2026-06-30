const express = require('express');
const router = express.Router();
const estoqueController = require('../controllers/estoqueController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// GET /estoque → listar estoque completo
router.get('/', estoqueController.listarEstoque);

// POST /estoque → criar estoque
router.post('/', authMiddleware, adminMiddleware, estoqueController.criarEstoque);

// PUT /estoque/:id → atualizar quantidade
router.put('/:id', authMiddleware, adminMiddleware, estoqueController.atualizarEstoque);

// DELETE /estoque/:id → deletar estoque
router.delete('/:id', authMiddleware, adminMiddleware, estoqueController.deletarEstoque);

module.exports = router;