# DIA 5 — ADMINISTRAÇÃO DE PEDIDOS

## Objetivo do Dia 5
Prover à gestão da loja uma ferramenta centralizada para acompanhamento, detalhamento logístico e mutação de status de vendas realizadas, retroalimentando as informações em tempo real para a interface de consumo do cliente sem exigir integrações pesadas no primeiro momento (MVP).

---

## Funcionalidades implementadas

### Admin de Pedidos
* **Listagem:** Construção de tabela mestra robusta (com rolagem transversal / responsividade horizontal via `overflow-x-auto`) permitindo a leitura e organização de todos os registros de venda.
* **Filtros:** Busca inteligente combinada via banco de dados sem sobrecarregar a memória do navegador.
* **Detalhamento:** Implementação de Modal expansivo ("Detalhes") contendo:
  - Dados pessoais do comprador (Nome, E-mail, CPF, Telefone).
  - Endereço de correspondência com complementos aplicados.
  - Grade dissecada de produtos transacionados (Camisa, Tamanho, Quantidade, Valor Unitário com subtotal em linha).
  - Cálculos financeiros transparentes (Subtotal dos produtos isolados vs Custo Frete vs Valor Final Cobrado).
* **Alteração de Status:** Habilidade de intervenção de ciclo de vida atrelado a um estado padronizado e fechado (`pendente`, `pago`, `em_separacao`, `enviado`, `entregue`, `cancelado`).

### Integração com Minhas Compras
* **Atualização em tempo real:** A tela privada do usuário reage proativamente à mutação aplicada pelo backend, apresentando imediatamente as novas disposições do pacote.
* **Crachás de Identificação:** As "Badges" estáticas pretas evoluíram para semáforos lógicos textuais coloridos via TailwindCSS, amadurecendo a sensação de "rastreamento logístico" para o cliente leigo.

### Filtros
* **Por status:** Possibilidade nativa de segregação isolada utilizando uma tag HTML Select acoplada ao repositório Node.js.
* **Por período:** Implementação de campos nativos de `date` isolados sob `Data Inicial` e `Data Final` injetando restrições (`WHERE created_at >= $X AND created_at <= $Y`) diretamente no PostgreSQL com exatidão intra-diária.

### Auditoria
* **Logs de alteração:** A função de mutação loga silenciosamente para o console (Node.js backend) uma auditoria técnica de intervenção temporal. 
  Ex: `[AUDITORIA] Pedido #12 | Status Anterior: pendente | Novo Status: enviado | Data/Hora: 2026-05-27T08:15:30.000Z`

---

## Endpoints criados/alterados
1. `GET /pedidos/admin` 
   - Parâmetros extraídos da rota (Query Strings): `?status=...&dataInicio=...&dataFim=...`
   - Retorno: `Array<Pedidos>` ordenado em *descending order*.
2. `GET /pedidos/admin/:id`
   - Realiza mapeamento completo e `JOIN` das tabelas de sub-dependência `pedido_itens`, `camisas` e `tamanhos` aglutinando as chaves estrangeiras como propriedades nomeadas (`tamanho_nome`, `camisa_nome`).
3. `PUT /pedidos/admin/:id/status`
   - Requer `adminMiddleware`. Aceita e sanitiza o payload JSON `{ "status": "entregue" }`, executando atualização na coluna alvo e engatilhando o console logger.

---

## Arquivos criados
* `src/services/adminPedidoService.ts` (Serviço frontend com `Fetch API` para acoplamento administrativo de listagem, detalhe e status mutator).

---

## Arquivos alterados
* `backend/src/routes/pedidoRoutes.js` (Vinculação das 3 novas rotas do Backoffice).
* `backend/src/controllers/pedidoController.js` (Desenvolvimento da lógica transacional e das queries do Painel).
* `src/app/pages/admin/PedidosAdmin.tsx` (Substituição radical do componente obsoleto "Módulo Em Breve" por um ecossistema complexo de listagem interativa).
* `src/app/pages/minha-conta/PedidosList.tsx` (Regra de padronização CSS vinculada).

---

## SQL utilizado
*Nenhum SQL DDL (Create/Alter/Drop) foi disparado contra a estrutura. Para o dia 5, bastou apenas inteligência em Queries DML nativas Node. A query matriz desenvolvida para o multi-filtro do List foi:*
```sql
SELECT * FROM pedidos 
WHERE 1=1 
  AND status = $1 
  AND created_at >= $2 
  AND created_at <= $3 
ORDER BY created_at DESC
```

---

## Testes realizados
* Resiliência Multi-Filtro (Variação empírica de campos preenchidos e não preenchidos).
* Responsividade Móvel (Verificação de barras de rolagem `overflow-x` em aparelhos limitados e quebra do FlexBox via `flex-col md:flex-row`).
* Autenticação e Autorização (Garantia formal do bloqueio do PUT à perfis desprovidos do carimbo `is_admin`).
* Matemática Transacional (Teste de Subtotais do Array versus as informações nativas de banco).

---

## Problemas encontrados
1. **Quebra de Tela do Admin (UI Overflow):** Uma tabela com inúmeras colunas superou os limites do *viewport* num monitor normal/mobile e não rolava.
2. **Cegueira nos Custos Individuais:** O componente original detalhava o pacote total do Pedido, mas não explicitava se os produtos base cobriam efetivamente o preço final cobrado do cliente.

---

## Correções aplicadas
1. Envelopamento do HTML `<table>` em uma div container com a tríade `overflow-x-auto min-w-[800px]`, impedindo a flexão da interface.
2. Inserção paramétrica de função embutida no JSX calculando o `(quantidade * preco_unitario)` com fixação limitadora de `.toFixed(2)` e injeção do `reduce` para providenciar transparência de Subtotal da fatura isolada.

---

## Como validar localmente
O seu servidor Backend ExpressJS necessita ser paralisado (Ctrl+C no Terminal) e religado pelo comando `npm start` se porventura não constatar o recurso de filtro de data imediatamente (para expurgar a memória cache local de Rotas Node antigas). No painel Administrativo Front-end (rodando via Vite), acesse o submenu *Pedidos* no NavBar. Explore detalhamentos, mude os status livremente e inspecione simultaneamente a conta Cliente nas rotas públicas. 

---

## Situação atual do projeto
O escopo logístico básico foi perfeitamente finalizado. Sem uso excessivo de recursos ou integrações terceirizadas engessantes, atingiu-se controle transacional de ponta-a-ponta nativo e transparente com auditoria básica.

## Próximos passos recomendados
* **Dashboard e Relatórios Analytics:** Com as datas criadas, habilitar no futuro os blocos de Chart.js para mensurar "Vendas do Mês" vs "Estorno do Mês".
* **Transbordo Físico-Financeiro:** Adoção de gateway em nível de produção (Mercado Pago), trocando transição manual por subscrição Webhook de PIX / Credit.
* **Cuponagem:** Interceptar a linha de "Frete/Total" e imputar um descontínuo transacional no dia da finalização da compra (Desconto à vista ou Códigos Promocionais).
