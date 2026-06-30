CREATE TABLE carrinho (
  id integer NOT NULL DEFAULT nextval('carrinho_id_seq'::regclass),
  usuario_id integer NOT NULL
);

CREATE TABLE carrinho_itens (
  id integer NOT NULL DEFAULT nextval('carrinho_itens_id_seq'::regclass),
  carrinho_id integer NOT NULL,
  camisa_id integer NOT NULL,
  tamanho_id integer NOT NULL,
  quantidade integer NOT NULL
);

CREATE TABLE camisas (
  id integer NOT NULL DEFAULT nextval('camisas_id_seq'::regclass),
  nome character varying(255) NOT NULL,
  descricao text,
  preco numeric DEFAULT 170.00,
  tipo_venda USER-DEFINED NOT NULL DEFAULT 'pronta_entrega'::tipo_venda_enum,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tamanhos (
  id integer NOT NULL DEFAULT nextval('tamanhos_id_seq'::regclass),
  nome character varying(10) NOT NULL
);

CREATE TABLE estoque (
  id integer NOT NULL DEFAULT nextval('estoque_id_seq'::regclass),
  camisa_id integer NOT NULL,
  tamanho_id integer NOT NULL,
  quantidade integer DEFAULT 0,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE camisa_imagens (
  id integer NOT NULL DEFAULT nextval('camisa_imagens_id_seq'::regclass),
  camisa_id integer NOT NULL,
  caminho_imagem character varying(500) NOT NULL
);

CREATE TABLE usuarios (
  id integer NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
  nome character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  senha character varying(255) NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  cpf character varying(14),
  telefone character varying(20),
  endereco_cep character varying(9),
  endereco_rua character varying(255),
  endereco_numero character varying(20),
  endereco_complemento character varying(255),
  endereco_bairro character varying(100),
  endereco_cidade character varying(100),
  endereco_estado character varying(2)
);

CREATE TABLE pedidos (
  id integer NOT NULL DEFAULT nextval('pedidos_id_seq'::regclass),
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
  status character varying(50) DEFAULT 'pending'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  nome_cliente character varying(255),
  email_cliente character varying(255),
  telefone_cliente character varying(20),
  cpf_cliente character varying(14)
);

CREATE TABLE pedido_itens (
  id integer NOT NULL DEFAULT nextval('pedido_itens_id_seq'::regclass),
  pedido_id integer NOT NULL,
  camisa_id integer NOT NULL,
  tamanho_id integer NOT NULL,
  quantidade integer NOT NULL,
  preco_unitario numeric NOT NULL
);

CREATE TABLE pagamentos (
  id integer NOT NULL DEFAULT nextval('pagamentos_id_seq'::regclass),
  pedido_id integer NOT NULL,
  metodo character varying(50),
  status character varying(50) DEFAULT 'pending'::character varying,
  mercado_pago_id character varying(255),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE config_frete (
  id integer NOT NULL DEFAULT nextval('config_frete_id_seq'::regclass),
  tipo USER-DEFINED NOT NULL,
  valor numeric NOT NULL
);

CREATE TABLE cupons (
  id integer NOT NULL DEFAULT nextval('cupons_id_seq'::regclass),
  codigo character varying(50) NOT NULL,
  tipo_desconto character varying(20) NOT NULL,
  valor numeric NOT NULL,
  ativo boolean DEFAULT true,
  data_validade timestamp without time zone
);

CREATE TABLE recuperacao_senha (
  id integer NOT NULL DEFAULT nextval('recuperacao_senha_id_seq'::regclass),
  usuario_id integer,
  token character varying(255) NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

