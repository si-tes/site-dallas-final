const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const uploadImages = async (req, res) => {
  try {
    const { id } = req.params; // camisa_id
    
    // Verificar se o produto existe
    const produtoQuery = await pool.query('SELECT id FROM camisas WHERE id = $1', [id]);
    if (produtoQuery.rows.length === 0) {
      // Limpar os arquivos que acabaram de ser upados pois o produto nao existe
      if (req.files) {
        req.files.forEach(f => fs.unlinkSync(f.path));
      }
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    const insertedImages = [];
    for (const file of req.files) {
      const urlImagem = `/uploads/produtos/${file.filename}`;
      const insertQuery = await pool.query(
        'INSERT INTO produto_imagens (camisa_id, url_imagem) VALUES ($1, $2) RETURNING *',
        [id, urlImagem]
      );
      insertedImages.push(insertQuery.rows[0]);
    }

    res.status(201).json({ 
      success: true, 
      message: `${insertedImages.length} imagens adicionadas com sucesso.`,
      imagens: insertedImages 
    });

  } catch (err) {
    console.error(err);
    // Limpar os arquivos em caso de falha no banco
    if (req.files) {
      req.files.forEach(f => {
        if(fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    // Tratamento específico para erro do multer de tipo não suportado (enviado via uploadMiddleware)
    if (err.message && err.message.includes('Apenas arquivos de imagem')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao fazer upload das imagens.' });
  }
};

const getImages = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await pool.query(
      'SELECT * FROM produto_imagens WHERE camisa_id = $1 ORDER BY ordem ASC, id ASC',
      [id]
    );
    res.json({ imagens: query.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar imagens.' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id, imagemId } = req.params;

    // Buscar o registro para saber a URL do arquivo
    const queryImagem = await pool.query('SELECT url_imagem FROM produto_imagens WHERE id = $1 AND camisa_id = $2', [imagemId, id]);
    if (queryImagem.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada.' });
    }

    const urlImagem = queryImagem.rows[0].url_imagem;
    
    // Deletar do banco
    await pool.query('DELETE FROM produto_imagens WHERE id = $1', [imagemId]);

    // Deletar o arquivo fisicamente
    const filename = path.basename(urlImagem);
    const filePath = path.join(__dirname, '../../uploads/produtos', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Lógica para se a imagem excluída era a principal
    const produto = await pool.query('SELECT imagem FROM camisas WHERE id = $1', [id]);
    if (produto.rows.length > 0 && produto.rows[0].imagem === urlImagem) {
      // Buscar outra imagem
      const outrasImagens = await pool.query('SELECT url_imagem FROM produto_imagens WHERE camisa_id = $1 ORDER BY ordem ASC, id ASC LIMIT 1', [id]);
      const novaPrincipal = outrasImagens.rows.length > 0 ? outrasImagens.rows[0].url_imagem : null;
      await pool.query('UPDATE camisas SET imagem = $1 WHERE id = $2', [novaPrincipal, id]);
    }

    res.json({ success: true, message: 'Imagem removida com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar imagem.' });
  }
};

const setMainImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imagemId } = req.body;

    if (!imagemId) {
      return res.status(400).json({ error: 'ID da imagem é obrigatório.' });
    }

    // Buscar a URL da imagem na tabela produto_imagens
    const imagemQuery = await pool.query('SELECT url_imagem FROM produto_imagens WHERE id = $1 AND camisa_id = $2', [imagemId, id]);
    if (imagemQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada na galeria deste produto.' });
    }
    
    const url_imagem = imagemQuery.rows[0].url_imagem;

    // Atualiza a coluna imagem (imagem principal)
    await pool.query('UPDATE camisas SET imagem = $1 WHERE id = $2', [url_imagem, id]);

    res.json({ success: true, message: 'Imagem principal atualizada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao definir imagem principal.' });
  }
};

module.exports = {
  uploadImages,
  getImages,
  deleteImage,
  setMainImage
};
