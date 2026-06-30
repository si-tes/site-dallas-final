const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendEmail } = require('../services/emailService');

const generateToken = (params = {}) => {
  return jwt.sign(params, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const register = async (req, res) => {
  try {
    const { nome, email, senha, telefone, cpf } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios: nome, email e senha.' });
    }

    // Verificar se email já existe
    const emailExists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const newUser = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone, cpf, is_admin) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, nome, email, is_admin, telefone, cpf',
      [nome, email, hash, telefone || null, cpf || null]
    );

    const user = newUser.rows[0];
    const token = generateToken({ id: user.id, is_admin: user.is_admin });

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const validPass = await bcrypt.compare(senha, user.senha);
    if (!validPass) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // Removendo a senha da resposta
    delete user.senha;

    res.json({
      user,
      token: generateToken({ id: user.id, is_admin: user.is_admin }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
};

const me = async (req, res) => {
  try {
    const userQuery = await pool.query('SELECT id, nome, email, is_admin, telefone, cpf FROM usuarios WHERE id = $1', [req.userId]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { senhaAntiga, novaSenha } = req.body;

    if (!senhaAntiga || !novaSenha) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const userQuery = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.userId]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const validPass = await bcrypt.compare(senhaAntiga, user.senha);
    if (!validPass) {
      return res.status(401).json({ error: 'Senha antiga incorreta.' });
    }

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hash, req.userId]);

    res.json({ success: true, message: 'Senha atualizada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar a senha.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail obrigatório.' });
    }

    // A regra diz para não revelar se o email existe ou não. Retornaremos sucesso de qualquer forma depois.
    const userQuery = await pool.query('SELECT id, nome FROM usuarios WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      await pool.query(
        'INSERT INTO recuperacao_senha (usuario_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expiresAt]
      );

      const resetUrl = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;
      const html = `
        <h3>Olá, ${user.nome}!</h3>
        <p>Você solicitou a redefinição de sua senha na Dalla Imports.</p>
        <p>Clique no link abaixo para criar uma nova senha. Este link expira em 30 minutos.</p>
        <a href="${resetUrl}" style="padding:10px 20px; background-color:#dc2626; color:#fff; text-decoration:none; border-radius:5px;">Redefinir Senha</a>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
      `;

      await sendEmail(email, 'Redefinição de Senha - Dalla Imports', html);
    }

    // Mesmo se não existir o usuário, retorna sucesso genérico por segurança
    res.json({ success: true, message: 'Se esse e-mail estiver cadastrado, enviaremos um link de recuperação.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao processar recuperação de senha.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }

    const tokenQuery = await pool.query(
      'SELECT usuario_id FROM recuperacao_senha WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );

    const tokenRecord = tokenQuery.rows[0];

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    const hash = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha
    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hash, tokenRecord.usuario_id]);

    // Marca o token como usado
    await pool.query('UPDATE recuperacao_senha SET used = true WHERE token = $1', [token]);

    res.json({ success: true, message: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
  }
};

module.exports = {
  register,
  login,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
};
