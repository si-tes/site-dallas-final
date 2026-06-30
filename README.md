# Dalla Imports - MVP E-commerce

Bem-vindo ao repositório oficial do MVP da **Dalla Imports**, uma plataforma moderna de e-commerce desenvolvida com foco em alta performance, usabilidade extrema e segurança.

## 🚀 Visão Geral do Projeto
O sistema engloba uma Loja Pública focada em conversão, um Painel do Cliente (Minha Conta) para rastreio e gestão de endereços, e um Painel Administrativo blindado para controle granular de estoque, cupons, mídias e fluxo logístico dos pedidos. 

O checkout é estruturado para se integrar ao Mercado Pago e protege o estoque de ponta a ponta.

## 🛠 Stack Tecnológica
**Frontend:**
- React (Vite)
- TypeScript
- TailwindCSS (Estilização via Utility Classes)
- Motion (Animações ricas e fluidas)
- Lucide React (Ícones)
- Context API (Gestão de Estado/Autenticação)
- React Router DOM

**Backend:**
- Node.js & Express
- Banco de Dados PostgreSQL (via biblioteca `pg`)
- Autenticação JWT (JSON Web Tokens)
- Criptografia bcrypt
- Multer (Upload local seguro de imagens)
- SDK do Mercado Pago (Preferências de Checkout)

## 📁 Estrutura de Pastas
O monorepo está dividido de forma clássica para simplificar o deploy:

```text
/
├── backend/                # Servidor Node.js (API REST)
│   ├── src/
│   │   ├── config/         # Configurações do Banco (db.js)
│   │   ├── controllers/    # Lógica de Negócio (Auth, Produtos, Estoque, Pedidos)
│   │   ├── middlewares/    # Travas de segurança (admin, auth, uploads)
│   │   ├── routes/         # Rotas divididas por domínio
│   │   ├── services/       # Email (Nodemailer), Integração externa (Mercado Pago)
│   │   └── app.js          # Entrada do Backend (Server Setup)
│   ├── uploads/            # Armazenamento físico de imagens (Ignorado no Git)
│   └── package.json
├── src/                    # Frontend React
│   ├── app/
│   │   ├── components/     # UI Compartilhada (Galeria, Alertas, Cards)
│   │   ├── pages/          # Telas de visualização, Admin e Cliente
│   │   ├── routes.tsx      # Roteamento central
│   │   └── App.tsx         # Raiz com Context Providers
│   ├── contexts/           # AuthContext
│   ├── services/           # Fetch clients (carrinhoService, cupomService, etc)
│   └── main.tsx            
├── docs/                   # Relatórios, Manuais e Checklists
└── package.json
```

## ⚙️ Como Configurar o PostgreSQL Local
1. Instale o [PostgreSQL](https://www.postgresql.org/download/).
2. Crie um banco de dados vazio (ex: `dalla_db`).
3. O Backend possui configurações baseadas na variável `DB_URL` ou conexões locais default (postgres:senha).
4. O DDL para criar as tabelas encontra-se em anotações passadas ou pode ser gerado a partir do espelho de migrações da API.
5. Tabelas cruciais que devem existir: `usuarios`, `camisas`, `tamanhos`, `estoque`, `produto_imagens`, `pedidos`, `pedido_itens`, `cupons`, `recuperacao_senha`.

## 📦 Como Subir o Ambiente Local (Desenvolvimento)

### 1. Clonar e Instalar
```bash
git clone <url-do-repo>
cd dalla-imports
npm install           # Instala dependências do Frontend
cd backend
npm install           # Instala dependências do Backend
```

### 2. Variáveis de Ambiente
Na pasta `backend/`, copie ou renomeie o arquivo `.env.example` para `.env` e preencha as chaves:
Consulte o arquivo `.env.example` para referências.

### 3. Rodar os Servidores
**Iniciando o Backend (Terminal 1):**
```bash
cd backend
npm start
# O servidor iniciará na porta 3000 por padrão.
```

**Iniciando o Frontend (Terminal 2):**
```bash
cd raiz-do-projeto
npm run dev
# O Vite iniciará na porta 5173 por padrão.
```
Acesse `http://localhost:5173` em seu navegador.

## 🧭 Principais Rotas e Navegação
- `/` - Home e Vitrine Dinâmica
- `/product/:id` - Página de Detalhes com seleção de tamanhos/estoque.
- `/carrinho` - Carrinho de Compras.
- `/checkout` - Formulário protegido de conclusão.
- `/admin` - Dashboard Gerencial (Restrito).
- `/minha-conta` - Área do Cliente e Rastreamento.

## ⚠️ Observação Importante (Mercado Pago Pendente)
A infraestrutura transacional (Boleto/Pix/Cartão) e descontos (`pedidoController.js` e `mercadopagoService.js`) está construída. No entanto, o fluxo permanece bloqueado propositalmente até que o arquivo `.env` receba credenciais oficiais do Mercado Pago (`MP_ACCESS_TOKEN`). Sem o token válido, a API emitirá uma rejeição elegante ao usuário ("Pagamento temporariamente indisponível") para impedir a formação de Pedidos Fantasma/Órfãos no banco de dados.
