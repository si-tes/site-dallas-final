const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const produtoImagemController = require('../controllers/produtoImagemController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

// GET /produtos → listar camisas
router.get('/', produtoController.listarProdutos);

// GET /produtos/:id → obter camisa por ID
router.get('/:id', produtoController.obterProduto);

// POST /produtos → criar camisa
router.post('/', authMiddleware, adminMiddleware, produtoController.criarProduto);

// PUT /produtos/:id → editar camisa
router.put('/:id', authMiddleware, adminMiddleware, produtoController.editarProduto);

// DELETE /produtos/:id → deletar camisa (agora inativa o produto)
router.delete('/:id', authMiddleware, adminMiddleware, produtoController.deletarProduto);

// --- Rotas de Galeria de Imagens ---
// GET /produtos/:id/imagens → Listar imagens do produto
router.get('/:id/imagens', produtoImagemController.getImages);

// POST /produtos/:id/imagens → Upload de múltiplas imagens
// Usa uploadMiddleware.array('imagens') para aceitar múltiplas imagens no campo 'imagens'
router.post('/:id/imagens', authMiddleware, adminMiddleware, uploadMiddleware.array('imagens', 10), produtoImagemController.uploadImages);

// DELETE /produtos/:id/imagens/:imagemId → Remover imagem
router.delete('/:id/imagens/:imagemId', authMiddleware, adminMiddleware, produtoImagemController.deleteImage);

// PUT /produtos/:id/imagem-principal → Definir imagem principal (update em camisas.imagem)
router.put('/:id/imagem-principal', authMiddleware, adminMiddleware, produtoImagemController.setMainImage);

module.exports = router;