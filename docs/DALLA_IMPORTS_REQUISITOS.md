# DALLA IMPORTS — REQUISITOS DE NEGÓCIO E REGRAS APROVADAS

## 1. Categorias
Todos os produtos devem utilizar a mesma estrutura.
Categorias permitidas:
- camisa
- moletom
- short
- chuteira
**NÃO** criar tabelas separadas para categorias de produtos.

## 2. Tipos de Entrega
- **PRONTA_ENTREGA**: Produto disponível em Araxá.
- **SOB_ENCOMENDA**: Produto enviado pelo fornecedor após compra.

## 3. Estoque
- Produto sem estoque local continua vendendo normalmente.
- Deve-se exibir na página:
  - "Produto sob encomenda"
  - "Prazo estimado: 15 a 30 dias úteis"

## 4. Frete
- **Araxá + estoque local**: R$12 (Entrega por motoboy).
- **Qualquer outro caso**: R$40.

**Regra técnica para cálculo do frete:**
SE (cidade = "Araxá" E todos os itens possuem estoque local) ENTÃO { frete = R$12 }
CASO CONTRÁRIO { frete = R$40 }

## 5. Impostos
Qualquer imposto ou taxa de importação é responsabilidade da loja.
O cliente **nunca** deve receber cobrança adicional após a compra.

## 6. Checkout
**Campos obrigatórios:**
- Nome completo
- Telefone
- CPF
- Estado
- Cidade
- Endereço
- Número
- CEP

**Campo opcional:**
- Complemento

## 7. Fornecedor
O sistema deve armazenar os seguintes dados para envio ao fornecedor:
- Nome
- Telefone
- CPF
- Estado
- Cidade
- Endereço
- CEP

## 8. Tela de Pedidos (Admin)
Cada pedido deve mostrar:
- Número
- Status
- Nome do cliente
- Telefone
- CPF
- Estado
- Cidade
- Endereço
- CEP
- Produtos
- Valor total
- Frete

**Ações disponíveis:**
- Copiar dados
- Marcar como enviado
- Concluir pedido

## 9. Status do Pedido
1. Aguardando pagamento
2. Pago
3. Enviado ao fornecedor
4. Enviado
5. Concluído

## 10. Minha Conta
**Implementar:**
- Cadastro
- Login
- Logout
- Editar dados
- Editar endereço principal
- Alterar senha
- Minhas compras

**NÃO implementar:**
- Favoritos
- Cashback
- Múltiplos endereços
- Avaliações
- Recuperação por email
- SMS
- Notificações

## 11. Admin
O administrador deve conseguir:
- Cadastrar produto
- Editar produto
- Alterar preço
- Alterar estoque
- Visualizar pedidos
- Alterar status do pedido
- Criar cupons
- Editar cupons
- Ativar/desativar cupons

## 12. Cupons
Sistema simples. Cada cupom deve possuir:
- Código
- Tipo (% ou valor fixo)
- Valor
- Ativo/Inativo
- Validade

## 13. Menu / Categorias (Navegação)
Preparar estrutura de interface (Menu) para:
- Feminino
- Kit infantil
- Agasalho
- Torcedor
- Short
- Manga longa
- Dri-fit
- Chuteira futsal
- Chuteira campo
