const pool = require('./src/config/db');

async function checkAll() {
  try {
    // Check usuarios table columns
    const colsRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios'");
    console.log('Colunas de usuarios:', colsRes.rows.map(x => x.column_name).join(', '));

    // Try login
    const userRes = await pool.query("SELECT id, nome, email, senha, is_admin FROM usuarios WHERE email = 'dallaimports08@gmail.com'");
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      console.log('Usuario admin encontrado:', user.id, user.nome, user.email, 'is_admin:', user.is_admin);
      console.log('Tem senha hash:', user.senha ? 'SIM' : 'NAO');
    } else {
      console.log('Admin NAO encontrado');
    }

    // Check pedidos count
    const pedRes = await pool.query("SELECT COUNT(*) FROM pedidos");
    console.log('Pedidos no banco:', pedRes.rows[0].count);

    // Check estoque count
    const estRes = await pool.query("SELECT COUNT(*) FROM estoque");
    console.log('Itens de estoque:', estRes.rows[0].count);

    // Check tamanhos 
    const tamRes = await pool.query("SELECT id, nome, acrescimo_preco FROM tamanhos");
    console.log('Tamanhos:', JSON.stringify(tamRes.rows));

    // Check produtos with imagem
    const prodRes = await pool.query("SELECT id, nome, imagem, ativo FROM camisas LIMIT 3");
    console.log('Primeiros 3 produtos:', JSON.stringify(prodRes.rows));

    // Check if produto_imagens has data
    const imgRes = await pool.query("SELECT COUNT(*) FROM produto_imagens");
    console.log('Imagens de galeria:', imgRes.rows[0].count);

  } catch(e) {
    console.error('ERRO:', e.message);
  } finally {
    await pool.end();
  }
}

checkAll();
