const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function initialize() {
  console.log('Iniciando conexão com o PostgreSQL...');
  
  // 1. Conectar ao banco postgres padrão para criar o dalla_db
  const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'admin2026',
    port: 5432,
    database: 'postgres'
  });
  
  try {
    await pgClient.connect();
    console.log('Conectado ao PostgreSQL com sucesso.');
    
    // Criar banco dalla_db se não existir
    const checkDb = await pgClient.query("SELECT 1 FROM pg_database WHERE datname = 'dalla_db'");
    if (checkDb.rows.length === 0) {
      await pgClient.query('CREATE DATABASE dalla_db');
      console.log('Banco de dados dalla_db criado.');
    } else {
      console.log('Banco de dados dalla_db já existe.');
    }
  } catch (err) {
    console.error('Erro ao conectar ou criar banco:', err.message);
    process.exit(1);
  } finally {
    await pgClient.end();
  }

  // 2. Conectar ao dalla_db para criar as tabelas
  const dbClient = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'admin2026',
    port: 5432,
    database: 'dalla_db'
  });

  try {
    await dbClient.connect();
    console.log('Conectado ao banco dalla_db.');

    // Criar enum tipo_venda_enum se não existir
    const checkEnum = await dbClient.query("SELECT 1 FROM pg_type WHERE typname = 'tipo_venda_enum'");
    if (checkEnum.rows.length === 0) {
      await dbClient.query("CREATE TYPE tipo_venda_enum AS ENUM ('pronta_entrega', 'drop')");
      console.log('Enum tipo_venda_enum criado.');
    }

    // Carregar e rodar schema_atual.sql
    const schemaPath = path.join(__dirname, '../database/schema_atual.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Executando schema_atual.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Filtrar comandos de criação de tabelas para rodar apenas se não existirem
      // E remover a criação do enum para evitar erro de duplicidade
      const safeSql = schemaSql
        .replace(/CREATE TABLE /gi, 'CREATE TABLE IF NOT EXISTS ')
        .replace(/CREATE TYPE tipo_venda_enum AS ENUM \('pronta_entrega', 'drop'\);/gi, '');
      await dbClient.query(safeSql);
      console.log('Schema básico aplicado com sucesso.');
    } else {
      console.error('Arquivo schema_atual.sql não encontrado.');
    }

    // Aplicar alterações e tabelas adicionais
    console.log('Aplicando tabelas e colunas adicionais...');
    
    // Adicionar colunas em pedidos
    await dbClient.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cpf_cliente character varying(14)');
    await dbClient.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mp_preference_id character varying(255)');
    await dbClient.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mp_payment_id character varying(255)');
    await dbClient.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cupom_id integer');
    await dbClient.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS valor_desconto numeric DEFAULT 0.00');
    await dbClient.query('ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS payment_status character varying(50) DEFAULT \'aguardando_pagamento\'');
    
    // Adicionar colunas em camisas
    await dbClient.query('ALTER TABLE camisas ADD COLUMN IF NOT EXISTS imagem character varying(500)');
    await dbClient.query('ALTER TABLE camisas ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true');

    // Criar tabelas auxiliares
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS cupons (
        id SERIAL PRIMARY KEY,
        codigo character varying(50) UNIQUE NOT NULL,
        tipo_desconto character varying(20) NOT NULL,
        valor numeric NOT NULL,
        ativo boolean DEFAULT true,
        data_validade timestamp without time zone,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS recuperacao_senha (
        id SERIAL PRIMARY KEY,
        usuario_id integer,
        token character varying(255) NOT NULL,
        expires_at timestamp without time zone NOT NULL,
        used boolean DEFAULT false,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS produto_imagens (
        id SERIAL PRIMARY KEY,
        camisa_id integer REFERENCES camisas(id) ON DELETE CASCADE,
        url_imagem text NOT NULL,
        ordem integer DEFAULT 0,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tabelas adicionais e migrações aplicadas.');

    // 3. Executar Seeds (Tamanhos e Admin)
    console.log('Executando seeds iniciais...');

    // Seed de Tamanhos
    const resTamanhos = await dbClient.query('SELECT count(*) FROM tamanhos');
    if (resTamanhos.rows[0].count === '0') {
      await dbClient.query("INSERT INTO tamanhos (nome) VALUES ('P'), ('M'), ('G'), ('GG'), ('XG')");
      console.log('Tamanhos P, M, G, GG, XG inseridos.');
    } else {
      console.log('Tamanhos já estão populados.');
    }

    // Seed de Admin
    const emailAdmin = 'dallaimports08@gmail.com';
    const resAdmin = await dbClient.query('SELECT id FROM usuarios WHERE email = $1', [emailAdmin]);
    if (resAdmin.rows.length === 0) {
      const hash = await bcrypt.hash('12345678', 10);
      await dbClient.query(
        'INSERT INTO usuarios (nome, email, senha, is_admin) VALUES ($1, $2, $3, true)',
        ['Administrador Dalla', emailAdmin, hash]
      );
      console.log('Usuário Administrador criado com sucesso (Email: dallaimports08@gmail.com | Senha: 12345678).');
    } else {
      console.log('Usuário Administrador já existe.');
    }

    console.log('🎉 Banco de dados inicializado com sucesso e pronto para uso!');

  } catch (err) {
    console.error('Erro na inicialização do schema/tabelas:', err.message);
  } finally {
    await dbClient.end();
  }
}

initialize();
