const express = require('express');
const router = express.Router();
const tamanhoController = require('../controllers/tamanhoController');

// GET /tamanhos → listar tamanhos
router.get('/', tamanhoController.listarTamanhos);

module.exports = router;