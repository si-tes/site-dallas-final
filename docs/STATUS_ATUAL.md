# STATUS ATUAL DO PROJETO: DALLA IMPORTS

## 🟢 Funciona
- **Listagem de Produtos (Home):** Comunicação com o backend está funcionando (`useProdutos` -> `api.ts` -> `/produtos`).
- **Detalhes do Produto:** Tela funcional e consumindo dados do backend.
- **Carrinho de Compras:** Funcional. Os dados são persistidos no `localStorage` corretamente. A manipulação de quantidades funciona.
- **Estrutura Base do Backend:** Servidor Express configurado, endpoints básicos para produtos, estoque, tamanhos e pedidos estão mapeados, além de testes de conectividade (`/hora`).
- **Navegação (Rotas do Frontend):** React Router v7 funcional para as páginas de Home, Checkout, Carrinho e Detalhes de Produto.

## 🟡 Precisa verificar / Corrigir
- **Cálculo de Frete (Checkout):** O cálculo atual no frontend é estático para MG, SP, RJ e está ignorando a regra de negócio correta (Araxá + Estoque local = R$12, Resto = R$40).
- **Campos do Checkout:** Está faltando capturar o campo `CPF` (obrigatório).
- **Schema do Banco de Dados:** O arquivo `database/schema.sql` está **completamente vazio**. Precisaremos mapear as tabelas antes de subir para produção para garantir consistência.
- **Imagens (Mocks):** Estão sendo utilizadas imagens temporárias (`unsplash`) diretamente no código do Frontend. Os produtos reais ainda não estão buscando URLs de imagem dinâmicas apropriadas na Home/Produto.
- **Pagamento / Mercado Pago:** O Checkout apenas simula a tela, criando um pedido diretamente no banco sem realizar comunicação com gateway de pagamento real.
- **Duplicação de Tipos e Definições:** Múltiplas interfaces e tipos podem precisar ser padronizados ao avançar.

## 🔴 Não existe
- **Autenticação (Login / Cadastro):** Não existem rotas de backend nem telas para criação de conta de usuários ou login.
- **Minha Conta:** Tela inexistente para o cliente editar dados ou ver seus pedidos (Minhas Compras).
- **Painel Administrativo (Admin):** Área de gestão inexistente (para criar/editar produtos, cupons, estoques e verificar pedidos).
- **Módulo de Cupons:** Backend e frontend sem implementação para cupons de desconto.
- **Controle Dinâmico de Tipos de Entrega e Fornecedor:** A lógica de diferenciar `PRONTA_ENTREGA` e `SOB_ENCOMENDA` precisa ser expandida no back e frontend para capturar os dados do fornecedor.
