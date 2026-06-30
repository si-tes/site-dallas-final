-- ==========================================
-- SCHEMA ATUAL DO BANCO DE DADOS (REAL)
-- Este arquivo representa exatamente a estrutura extraída
-- ==========================================

-- ENUMS
CREATE TYPE tipo_venda_enum AS ENUM ('pronta_entrega', 'drop');

-- TABELAS
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  senha character varying(255) NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carrinho (
  id SERIAL PRIMARY KEY,
  usuario_id integer NOT NULL
);

CREATE TABLE carrinho_itens (
  id SERIAL PRIMARY KEY,
  carrinho_id integer NOT NULL,
  camisa_id integer NOT NULL,
  tamanho_id integer NOT NULL,
  quantidade integer NOT NULL
);

CREATE TABLE camisas (
  id SERIAL PRIMARY KEY,
  nome character varying(255) NOT NULL,
  descricao text,
  preco numeric DEFAULT 170.00,
  tipo_venda tipo_venda_enum NOT NULL DEFAULT 'pronta_entrega',
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tamanhos (
  id SERIAL PRIMARY KEY,
  nome character varying(10) NOT NULL
);

CREATE TABLE estoque (
  id SERIAL PRIMARY KEY,
  camisa_id integer NOT NULL,
  tamanho_id integer NOT NULL,
  quantidade integer DEFAULT 0,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE camisa_imagens (
  id SERIAL PRIMARY KEY,
  camisa_id integer NOT NULL,
  caminho_imagem character varying(500) NOT NULL
);

CREATE TABLE pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id integer NOT NULL,
  camisa_id integer NOT NULL,
  tamanho_id integer NOT NULL,
  quantidade integer NOT NULL,
  preco_unitario numeric NOT NULL
);

CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  pedido_id integer NOT NULL,
  metodo character varying(50),
  status character varying(50) DEFAULT 'pending',
  mercado_pago_id character varying(255),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE config_frete (
  id SERIAL PRIMARY KEY,
  tipo character varying(50) NOT NULL,
  valor numeric NOT NULL
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id integer,
  total numeric NOT NULL,
  valor_frete numeric NOT NULL DEFAULT 0.00,
  endereco_cep character varying(20) NOT NULL,
  endereco_rua character varying(255) NOT NULL,
  endereco_numero character varying(50) NOT NULL,
  endereco_complemento character varying(255),
  endereco_bairro character varying(100) NOT NULL,
  endereco_cidade character varying(100) NOT NULL,
  endereco_estado character varying(2) NOT NULL,
  status character varying(50) DEFAULT 'pending',
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  nome_cliente character varying(255),
  email_cliente character varying(255),
  telefone_cliente character varying(20)
);
