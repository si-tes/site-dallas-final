require('dotenv').config();
const cors = require('cors');
const express = require('express');
const pool = require('./config/db');
const produtoRoutes = require('./routes/produtoRoutes');
const tamanhoRoutes = require('./routes/tamanhoRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

const path = require('path');
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/produtos', express.static(path.join(__dirname, '../../produtos')));

// Rota base
app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

// Health check (teste de conexão com banco)
app.get('/hora', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

// Rotas de produtos
app.use('/produtos', produtoRoutes);

// Rotas de tamanhos
app.use('/tamanhos', tamanhoRoutes);

// Rotas de estoque
app.use('/estoque', estoqueRoutes);

// Rotas de pedidos
app.use('/pedidos', pedidoRoutes);

// Rotas de cupons
const cupomRoutes = require('./routes/cupomRoutes');
app.use('/cupons', cupomRoutes);

// Rota de Webhooks do MP
const webhookController = require('./controllers/webhookController');
app.post('/webhooks/mercadopago', express.json(), webhookController.handleMercadoPagoWebhook);

// Rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Rotas de usuário
app.use('/users', userRoutes);

module.exports = app;