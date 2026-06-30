-- ==========================================
-- MIGRAÇÕES SUGERIDAS (MELHORIAS FUTURAS)
-- Este arquivo documenta o que deve ser rodado no banco 
-- no futuro, com explicações sobre os impactos
-- ==========================================

/*
  1. ADIÇÃO DE CAMPOS OBRIGATÓRIOS NO PEDIDO (E FORNECEDOR)
  
  * O que muda: Adição das colunas de CPF do cliente, e os dados do fornecedor diretamente no pedido.
  * Por que muda: Cumprimento dos requisitos aprovados no DALLA_IMPORTS_REQUISITOS.md (Checkout precisa salvar CPF, e os dados de fornecedor são exigidos).
  * Risco: Muito baixo. Apenas estamos adicionando novas colunas a uma tabela existente.
  * Impacto: 
    - Backend: O `pedidoController.js` precisará ser atualizado no momento do INSERT para aceitar esses novos campos (o Frontend já está os enviando via formData).
*/

ALTER TABLE pedidos ADD COLUMN cpf_cliente character varying(14);
ALTER TABLE pedidos ADD COLUMN fornecedor_nome character varying(255);
ALTER TABLE pedidos ADD COLUMN fornecedor_telefone character varying(20);
ALTER TABLE pedidos ADD COLUMN fornecedor_cpf character varying(14);
ALTER TABLE pedidos ADD COLUMN fornecedor_estado character varying(2);
ALTER TABLE pedidos ADD COLUMN fornecedor_cidade character varying(100);
ALTER TABLE pedidos ADD COLUMN fornecedor_endereco character varying(255);
ALTER TABLE pedidos ADD COLUMN fornecedor_cep character varying(20);


/*
  2. TABELA DE CUPONS
  
  * O que muda: Criação de uma tabela inteira dedicada ao controle de descontos.
  * Por que muda: Foi exigido nas regras de negócio para a funcionalidade do Administrador.
  * Risco: Zero. É uma entidade nova que não afeta as demais.
  * Impacto:
    - Backend: Novas rotas (ex: /cupons) deverão ser criadas.
    - Frontend: O Checkout precisará criar uma etapa para submeter código de cupom e reagir à resposta calculando desconto.
*/

CREATE TABLE cupons (
  id SERIAL PRIMARY KEY,
  codigo character varying(50) UNIQUE NOT NULL,
  tipo_desconto character varying(20) NOT NULL, -- 'percent' ou 'fixed'
  valor numeric NOT NULL,
  ativo boolean DEFAULT true,
  data_validade timestamp without time zone
);


/*
  3. RENOMEAÇÃO DE CAMISAS PARA PRODUTOS (CUIDADO - MIGRAÇÃO CRÍTICA)
  
  * O que muda: Trocar o nome da tabela "camisas" para "produtos". Consequentemente, trocar chaves estrangeiras "camisa_id" para "produto_id", além do Enum "tipo_venda_enum" (adicionando sob_encomenda se necessário). Adicionar a coluna "categoria".
  * Por que muda: Permitir venda de produtos como moletons, shorts e chuteiras de maneira limpa.
  * Risco: ALTO.
  * Impacto:
    - Banco: Renomear a tabela quebrará Queries antigas (SELECT * FROM camisas). Renomear coluna `camisa_id` em 5 tabelas diferentes (`estoque`, `carrinho_itens`, `pedido_itens`, `camisa_imagens`).
    - Backend: `produtoController.js`, `estoqueController.js`, `pedidoController.js` precisarão ser inteiramente revisados. Todos os JOINs ou INSERTS que citam "camisas" devem mudar.
    - Frontend: Refatorar o modelo/tipo retornado. A API mudará a chave de resposta.
*/

-- (Os comandos abaixo SÃO DESTRUTIVOS e devem ser rodados apenas quando houver tempo para refatoração geral do código)
-- ALTER TABLE camisas RENAME TO produtos;
-- ALTER TABLE estoque RENAME COLUMN camisa_id TO produto_id;
-- ALTER TABLE carrinho_itens RENAME COLUMN camisa_id TO produto_id;
-- ALTER TABLE pedido_itens RENAME COLUMN camisa_id TO produto_id;
-- ALTER TABLE camisa_imagens RENAME COLUMN camisa_id TO produto_id;
-- ALTER TABLE camisa_imagens RENAME TO produto_imagens;
-- ALTER TABLE produtos ADD COLUMN categoria character varying(50) DEFAULT 'camisa';
