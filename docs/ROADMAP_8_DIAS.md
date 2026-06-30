# ROADMAP 8 DIAS — DALLA IMPORTS

Este cronograma foi desenhado focando em estabilidade, organização, finalização das regras essenciais de negócio e preparação para o lançamento sem refatorações excessivas ou arquiteturas mirabolantes.

## DIA 1: Fundação, Banco de Dados e Correções Críticas
- Preencher o arquivo `database/schema.sql` mapeando tabelas de `usuarios`, `produtos`, `tamanhos`, `estoque`, `pedidos`, `itens_pedido` e `cupons` (Complexidade: Baixa | Tempo: 2h).
- Ajustar a tela de **Checkout** (`Checkout.tsx`): incluir campo `CPF` e ajustar cálculo do frete com a regra (Araxá + Estoque local = R$ 12, Senão = R$ 40) (Complexidade: Média | Tempo: 3h).
- Adaptar as queries do backend caso falte colunas mapeadas no passo acima.

## DIA 2: Autenticação Base (Backend e Frontend)
- Criar tabelas e rotas de usuário (`/auth/register`, `/auth/login`). Utilizar JWT básico. (Complexidade: Média | Tempo: 3h)
- Criar Telas: **Cadastro** e **Login**. (Complexidade: Baixa | Tempo: 3h)
- Ajustar armazenamento do token.

## DIA 3: Área "Minha Conta"
- Criar a página de **Minha Conta** com abas/visões para: 
  - Editar dados.
  - Editar endereço principal.
  - Alterar senha.
- Rota e tela de **Minhas Compras** (Histórico de pedidos do usuário logado). (Complexidade: Média | Tempo: 6h)

## DIA 4: Início do Admin e Gerenciamento de Produtos
- Criar middleware de verificação de admin.
- Telas base de painel administrativo.
- Módulos para administrador:
  - Cadastrar produto.
  - Editar produto.
  - Alterar preço.
  - Alterar estoque.
(Complexidade: Alta | Tempo: 8h)

## DIA 5: Gestão de Pedidos e Cupons (Admin)
- Admin - Visualização e edição de Pedidos:
  - Botões para alterar status (Aguardando pagamento -> Pago -> Enviado fornecedor -> Enviado -> Concluído).
  - Listagem dos dados de Fornecedor / Exportar dados.
- Módulo de Cupons (Admin e Banco):
  - CRUD de cupons. (Código, Tipo, Valor, Status, Validade).
(Complexidade: Alta | Tempo: 8h)

## DIA 6: Finalização do Checkout (Cupons, Pagamento e Estoque sob Encomenda)
- Integrar a aplicação dos cupons de desconto na tela de **Checkout**.
- Integrar os alertas e fluxos de "Produto sob encomenda" x "Pronta Entrega" visualmente na Home e Detalhes do Produto.
- Simular/preparar a integração final de pagamento (Ex: SDK do Mercado Pago ou mock validado de PIX para MVP).
(Complexidade: Alta | Tempo: 8h)

## DIA 7: Menu de Navegação e Revisão
- Desenvolver os links de Menu Estrutural / Categorias solicitados (Feminino, Kit infantil, etc) de forma dinâmica ou estática se necessário para o MVP.
- Substituir as imagens Mocks (Placeholder) por imagens fornecidas no banco/banco local, ou permitir upload do admin.
- Realizar teste de ponta a ponta (E2E Manual) fazendo fluxo de usuário.
(Complexidade: Média | Tempo: 6h)

## DIA 8: Deploy, Testes Finais e Estabilização
- Corrigir bugs levantados no dia 7.
- Subir banco de dados de produção (Render/Supabase/etc).
- Subir Backend (Render/Railway).
- Subir Frontend (Vercel/Netlify).
- Aprovação Final P0/P1.
(Complexidade: Alta | Tempo: 8h)
