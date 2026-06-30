# DIA 1 — ESTABILIZAÇÃO

Data: 24/05/2026

## Objetivo

Corrigir checkout, inclusão de CPF, regra de frete dinâmica e documentar o banco de dados.

## Arquivos alterados

- `src/app/pages/Checkout.tsx`
- `src/app/pages/ProductDetail.tsx`
- `src/services/carrinhoService.ts`
- `src/services/pedidoService.ts`
- `backend/src/controllers/pedidoController.js`
- `database/schema_atual.sql`
- `database/migracoes_sugeridas.sql`
- `database/schema.sql`

## SQL executado no banco local

```sql
-- Inclusão da coluna exigida para o checkout
ALTER TABLE pedidos ADD COLUMN cpf_cliente character varying(14);

-- Criação da tabela de cupons exigida pelas regras de negócio
CREATE TABLE cupons (
  id SERIAL PRIMARY KEY,
  codigo character varying(50) UNIQUE NOT NULL,
  tipo_desconto character varying(20) NOT NULL,
  valor numeric NOT NULL,
  ativo boolean DEFAULT true,
  data_validade timestamp without time zone
);

-- Mock de dados para validação da regra de negócio (Tamanhos e Estoque)
TRUNCATE tamanhos RESTART IDENTITY CASCADE;
INSERT INTO tamanhos (nome) VALUES ('P'), ('M'), ('G'), ('GG'), ('XG');
INSERT INTO estoque (camisa_id, tamanho_id, quantidade) VALUES (1, 1, 10);
```

## Testes realizados

- Inserção e validação de CPF obrigatório no envio do pedido
- Integração da lógica de Frete para Araxá = R$12 (apenas com estoque local)
- Integração da lógica de Frete para outras cidades = R$40
- Teste de fluxo de produtos sem estoque ("Sob Encomenda") no carrinho e checkout
- Salvamento das chaves corretas `tipo_venda` e `estoqueLocal` no cache local (localStorage)
- Criação e aprovação do pedido com todos os dados salvos no PostgreSQL

## Resultado

Todos os testes foram aprovados. O sistema agora consegue trafegar produtos com ou sem estoque até o final sem travar e precificando o frete sob total conformidade.

## Observações

- A interface antiga barrava (via propriedade HTML `disabled`) a seleção de tamanhos caso o estoque do item fosse igual ou menor que zero. Como a regra de negócio exige que a venda de sob encomenda continue ativa, isso foi corrigido.
- O aparente "erro de cálculo de frete" era, na verdade, a correta interpretação do sistema de que **não havia** estoque no banco de dados, configurando a compra inteira como "Sob Encomenda" (forçando a tarifa cheia de 40 reais para a encomenda).
- Após inserir estoque de teste manual via query SQL, a regra reconheceu a integridade e funcionou perfeitamente.
- É estritamente recomendado que a gestão desse estoque seja movida para um painel administrativo o quanto antes, conforme previsto no Roadmap.
