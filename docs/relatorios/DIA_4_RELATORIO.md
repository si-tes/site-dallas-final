# DIA 4 — ADMIN, PRODUTOS E GALERIA DE IMAGENS

## Objetivo do Dia 4
Desenvolver e consolidar a infraestrutura de administração do e-commerce. O objetivo principal foi criar um ambiente seguro (AdminRoute) para gestão de catálogo (criação, edição e exclusão lógica de produtos), gerenciar a grade estendida de tamanhos (incluindo tamanhos plus size com acréscimos dinâmicos de preço) e implementar um sistema completo de Galeria de Múltiplas Imagens por produto suportado via upload local seguro (Multer).

---

## Funcionalidades implementadas

### Painel Administrativo
* **AdminRoute**: Nova camada de rota protegida que intercepta usuários normais, barrando o acesso de contas não autorizadas.
* **Proteção por `is_admin`**: Middleware e checagens contextuais para isolar endpoints e visões de administração.
* **Layout administrativo separado da loja**: Remoção do Header/Footer tradicionais no ambiente interno para oferecer uma experiência focada na gestão (`AdminLayout`).

### Produtos
* **Cadastro**: Formulário de criação permitindo configurar nome, descrição, preço base e tipo de venda (pronta_entrega ou encomenda).
* **Edição**: Recuperação e atualização parcial/total dos dados do produto em modal customizado.
* **Listagem**: Tabela de fácil leitura listando todos os itens, inclusive os indisponíveis.
* **Inativação**: Produtos excluídos sofrem um *Soft Delete* (ativo = false) ao invés de exclusão física, impedindo a quebra de pedidos antigos.
* **Reativação**: Habilidade de retornar produtos desativados à vitrine principal.

### Estoque
* **Controle por tamanho**: Interface isolada no Admin mapeando as quantidades de cada tamanho (do P ao 4GG) de forma independente por camisa.
* **Atualização de quantidades**: Endpoints específicos para reabastecimento logístico.
* **Responsividade da tela**: Ajustes CSS via Tailwind para acomodar as colunas adicionais e manter a visualização fluida em dispositivos móveis.

### Grade de Tamanhos
Expansão profunda da grade de vendas tradicional:
* Inclusão oficial de **2GG**
* Inclusão oficial de **3GG**
* Inclusão oficial de **4GG**

### Acréscimo por tamanho
Cálculo dinâmico automatizado refletindo na página do produto, carrinho e finalização de compra:
* **2GG** = +R$ 15,00
* **3GG** = +R$ 25,00
* **4GG** = +R$ 25,00

### Galeria de Imagens
* **Upload múltiplo**: Seleção e submissão simultânea de variadas imagens para um único produto.
* **Multer**: Middleware no backend limitando transferências a 5MB e formatos aceitos (JPEG, PNG, WEBP), salvando fisicamente em `/uploads`.
* **Imagem principal**: Sistema de destaque isolando a imagem "capa" de forma interativa.
* **Exclusão de imagem**: Exclusão sincronizada (deleta do banco e remove fisicamente o arquivo via `fs.unlinkSync`).
* **Miniaturas na página do produto**: Componente `GaleriaProduto` injetado na loja com efeito visual para troca instantânea de capas sem requisição HTTP extra.
* **Integração com Home, Carrinho e Checkout**: Preservação de retrocompatibilidade utilizando a tabela original (`camisas.imagem`) como fonte primária para as rotas que não expõem detalhes do produto.

---

## SQL executado
```sql
-- Inclusão retroativa do suporte para a capa base se a coluna era inexistente
ALTER TABLE camisas ADD COLUMN IF NOT EXISTS imagem TEXT;

-- Criação da tabela independente de galeria para suporte a upload múltiplo
CREATE TABLE IF NOT EXISTS produto_imagens (
  id SERIAL PRIMARY KEY,
  camisa_id INTEGER REFERENCES camisas(id) ON DELETE CASCADE,
  url_imagem TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance para mitigar lentidão no JOIN na página do Produto
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_produto_imagens_camisa_id'
  ) THEN
    CREATE INDEX idx_produto_imagens_camisa_id ON produto_imagens(camisa_id);
  END IF;
END $$;
```

---

## Bibliotecas instaladas
* **multer** (Backend) - Gerenciamento escalável e stream seguro de pacotes via `multipart/form-data`.

---

## Arquivos criados
* `backend/uploads/produtos/` (Diretório estrutural)
* `backend/src/middlewares/uploadMiddleware.js`
* `backend/src/controllers/produtoImagemController.js`
* `src/app/pages/admin/AdminGaleriaProduto.tsx`
* `src/app/components/GaleriaProduto.tsx`

---

## Arquivos alterados
* `backend/src/app.js` (Hospedagem estática da pasta `/uploads` configurada)
* `backend/src/routes/produtoRoutes.js` (Novos verbos de manipulação de galeria acoplados a `/:id/imagens`)
* `src/app/pages/admin/ProdutosAdmin.tsx` (Injeção limpa de formulário externo de imagem)
* `src/app/pages/ProductDetail.tsx` (Transformação da renderização de vitrine singular para array de componentes)
* `src/services/produtoService.ts` (Saneamento e mapeamento das propriedades `imagem` e `ativo` na interface Typescript principal)

---

## Endpoints criados ou modificados
* `GET /produtos/:id/imagens` - Busca o Array de arquivos de uma camisa associada
* `POST /produtos/:id/imagens` - Processa e despacha array para escrita local e insere registros
* `DELETE /produtos/:id/imagens/:imagemId` - Invalida arquivo via Node.JS (`fs`) e apaga do BD. (Regra de transbordo: Se for a foto principal atual, designa a segunda foto válida).
* `PUT /produtos/:id/imagem-principal` - Sobrescreve `camisas.imagem` promovendo o ID solicitado à capa global.

---

## Testes realizados
* **Autenticação:** Validação da segurança impedindo chamadas externas de efetuarem PUT de fotos baseadas no token JWT do `is_admin`.
* **Segurança de Carga (Multer):** Submissões intencionais de SVGs e PDFs rejeitadas por tipagem. Testes com arquivos além de 5MB rejeitados por sobrecarga.
* **Integridade de Frontend:** Verificação intensiva pelo Vite/ESBuild (`npm run build`) chancelando toda ausência de undefined e colisões de Typescript no Checkout, garantindo deploy viável.
* **Regressão Funcional (Galeria):** Navegação entre imagens unificadas, garantindo fusão e eliminação de imagens clonadas no render do browser via `Set`.

---

## Problemas encontrados durante a implementação
1. **Divergências Tipográficas Frontend:** Uso nativo de tipagem falha (`Produto.imagem` estourando Exception porque não possuía declaração do React para a chave).
2. **Duplicação Visual da Capa:** O array na listagem pública da galeria duplicava a imagem por ela estar salva em `camisas` E `produto_imagens`.
3. **Ausência Histórica de Coluna:** A tabela global `camisas` operava sobre URLs hardcoded (unsplash) e sequer continha o registro textual `imagem` alocado.
4. **Visibilidade Crítica no UX:** Ações destrutivas na galeria administrativa encontravam-se escondidas por efeito `Hover`, dificultando uso mobile e testabilidade orgânica.

---

## Correções aplicadas
1. Declarada nativamente a injeção da tipagem de `Produto` no `produtoService.ts`.
2. Empregado construtor JS `Set` alinhado ao array unificado (no Componente), mitigando instâncias clonadas e preservando a foto principal forçosamente na extremidade inicial do índice visual.
3. Comandos SQL de Migration interpostos criaram retroativamente a tabela `imagem` text.
4. O `hover` foi desativado no Admin, oferecendo barra estática clara e perene de "Estrela" e "Exclusão" fixada em `flex justify-between`.

---

## Como validar localmente
1. Certifique-se de restartar a task do Backend (`npm start`) em caso de travamento persistente no endpoint `imagem-principal`.
2. Acesse `/admin/produtos`, clique em Editar e insira novas fotos de arquivos locais num produto.
3. Assuma controle das fotos (Clique na estrela / Lixeira). As transições refletirão de modo imediato.
4. Navegue à interface cliente. Produtos devem renderizar o carrossel, Carrinhos e Chekcout devem refletir isoladamente a capa original mantendo compatibilidade nativa da release de produção.

---

## Situação atual do projeto
O projeto atingiu maturação administrativa satisfatória para operação MVP. Há autonomia plena para inserção, valoração especial da grade plus-size, gestão e exibição visual dos itens por administradores. As APIs se mostraram estáveis sob testes de carga local (Vite/Node). 

## Pendências futuras
* **Armazenamento Escalonável:** Alteração de upload local (Multer em pasta estática) para nuvens especializadas como **AWS S3** ou **Cloudinary**, poupando IOPS e facilitando backup futuro do Banco.
* **Mercado Pago:** A API real de finalização de transações no Cart permanece pendente e é o bloqueio primário final antes de disponibilizar vendas.
* **Edição Avançada de Imagens:** Permitir arrastar miniaturas (Drag and drop) e recorte nativo no Admin antes do Upload (Crop).
* **Controle de Cupons:** Módulo administrativo em fila para aplicação escalonada no carrinho.
