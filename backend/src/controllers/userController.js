const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    console.log('--- LOG: GET /users/profile ---');
    console.log('req.user completo:', req.user);
    console.log('req.userId do middleware:', req.userId);
    
    const userId = req.user ? req.user.id : req.userId;
    const query = `
      SELECT id, nome, email, cpf, telefone, 
             endereco_cep, endereco_rua, endereco_numero, 
             endereco_complemento, endereco_bairro, 
             endereco_cidade, endereco_estado
      FROM usuarios WHERE id = $1
    `;
    const values = [userId];
    
    console.log('Query SQL:', query);
    console.log('Parametros:', values);

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('--- LOG ERROR: GET /users/profile ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erro interno ao buscar perfil.', details: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log('--- LOG: PUT /users/profile ---');
    console.log('req.user completo:', req.user);
    console.log('req.userId do middleware:', req.userId);

    const userId = req.user ? req.user.id : req.userId;
    const { 
      nome, cpf, telefone, 
      endereco_cep, endereco_rua, endereco_numero, 
      endereco_complemento, endereco_bairro, 
      endereco_cidade, endereco_estado 
    } = req.body;

    const query = `
      UPDATE usuarios 
      SET 
        nome = COALESCE($1, nome),
        cpf = COALESCE($2, cpf),
        telefone = COALESCE($3, telefone),
        endereco_cep = COALESCE($4, endereco_cep),
        endereco_rua = COALESCE($5, endereco_rua),
        endereco_numero = COALESCE($6, endereco_numero),
        endereco_complemento = COALESCE($7, endereco_complemento),
        endereco_bairro = COALESCE($8, endereco_bairro),
        endereco_cidade = COALESCE($9, endereco_cidade),
        endereco_estado = COALESCE($10, endereco_estado)
      WHERE id = $11
      RETURNING id, nome, email, cpf, telefone, endereco_cep, endereco_rua, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado
    `;

    const values = [
      nome, cpf, telefone, 
      endereco_cep, endereco_rua, endereco_numero, 
      endereco_complemento, endereco_bairro, 
      endereco_cidade, endereco_estado,
      userId
    ];

    console.log('Query SQL:', query);
    console.log('Parametros:', values);

    const result = await pool.query(query, values);
    
    res.json({ message: 'Perfil atualizado com sucesso.', user: result.rows[0] });
  } catch (error) {
    console.error('--- LOG ERROR: PUT /users/profile ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erro interno ao atualizar perfil.', details: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
