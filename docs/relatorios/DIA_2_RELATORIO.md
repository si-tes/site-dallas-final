# DIA 2 — AUTENTICAÇÃO E RECUPERAÇÃO DE SENHA

Data: 24/05/2026

## Objetivo do Dia 2

O objetivo central desta etapa foi estruturar toda a base de Autenticação e Segurança do e-commerce. A prioridade era garantir que visitantes pudessem navegar livremente pelo catálogo sem bloqueios, forçando a criação de conta ou login estritamente no momento de intenção de compra. Adicionalmente, foi implementada a funcionalidade segura de Recuperação de Senha por e-mail utilizando SMTP.

## Funcionalidades Implementadas

* Cadastro
* Login
* Logout
* JWT (JSON Web Token para autorização)
* bcrypt (Hash seguro de senhas)
* AuthContext (Provedor global de estado de sessão do React)
* ProtectedRoute (Defesa de rotas exclusivas)
* auth/me (Validação do token ativo e recuperação dos dados do usuário)
* Alteração de senha
* Recuperação de sessão persistente no `localStorage`
* Recuperação de senha completa
* SMTP Gmail / Mailtrap
* Nodemailer
* Token de recuperação gerado de forma criptográfica (32 bytes em hexadecimal)
* Token com expiração rígida de 30 minutos
* Token de uso único (queima automática após a alteração da senha)
* Sistema inteligente de `?redirect=` (devolve o cliente para a página de onde foi expulso após o login)

## Arquivos Criados

**Backend:**
* `backend/src/controllers/authController.js`
* `backend/src/routes/authRoutes.js`
* `backend/src/middlewares/authMiddleware.js`
* `backend/src/services/emailService.js`
* `backend/.env.example`

**Raiz:**
* `.gitignore`

**Frontend:**
* `src/services/authService.ts`
* `src/contexts/AuthContext.tsx`
* `src/components/ProtectedRoute.tsx`
* `src/app/pages/Login.tsx`
* `src/app/pages/Register.tsx`
* `src/app/pages/ForgotPassword.tsx`
* `src/app/pages/ResetPassword.tsx`

## Arquivos Alterados

**Backend:**
* `backend/src/app.js` (Injeção das rotas de Auth)
* `backend/.env` (Configurações e secrets)

**Frontend:**
* `src/app/App.tsx` (Envelopamento do aplicativo com `<AuthProvider>`)
* `src/app/routes.ts` (Mapeamento das 4 novas telas de acesso)
* `src/app/components/Header.tsx` (Refatoração para menu dropdown responsivo baseado em estado, adaptado a logado/deslogado)
* `src/app/pages/ProductDetail.tsx` (Bloqueio do "Adicionar ao Carrinho" com redirect para login)
* `src/app/pages/Carrinho.tsx` (Bloqueio do "Finalizar Compra" para visitantes)
* `src/app/pages/Checkout.tsx` (Defesa total da página)

## SQL Executado

```sql
-- Garantiu unicidade de e-mail na tabela de usuários
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);

-- Criou a tabela para armazenamento temporário de tokens de reset
CREATE TABLE recuperacao_senha (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  token character varying(255) UNIQUE NOT NULL,
  expires_at timestamp without time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

## Variáveis de Ambiente

No backend, foi estabelecido o uso destas variáveis (sempre via `process.env` e documentadas no `.env.example`):

* `JWT_SECRET`
* `SMTP_HOST`
* `SMTP_PORT`
* `SMTP_USER`
* `SMTP_PASS`
* `FRONTEND_URL`

## Testes Realizados

1. **Cadastro e Login:** Tentativa de criar conta com email duplicado (bloqueado). Criação com sucesso gerou Hash no banco e devolveu o token JWT.
2. **Ux de Visitante x Comprador:** Visita a produtos ok. Ao clicar em comprar, usuário foi remetido a `/login?redirect=...`.
3. **Menu Responsivo:** Teste de usabilidade no mobile. Botão User abre menu com React state, fugindo da limitação de hover do CSS.
4. **Recuperação de Senha (Segurança):** Requisição com e-mail inválido devolve mesma resposta da de e-mail válido (previne varredura de hackers).
5. **SMTP:** Envio de mensagem com link formatado injetando token via NodeMailer.
6. **Token:** Testado clique com URL de token, validação de compatibilidade das duas senhas novas. Reuso de token usado foi devidamente bloqueado.

## Resultado dos Testes

**Todos os testes passaram com êxito.** O fluxo ponta a ponta (de visitante a usuário logado comprando um produto) está contínuo e com excelente resposta visual. As senhas e resets estão seguros por hash e expiração.

## Problemas Encontrados

* **UX Mobile do Dropdown:** Usar a pseudo-classe `group-hover` no Tailwind é problemático em mobile Safari. **Solução:** O componente de cabeçalho foi refatorado para utilizar estados nativos do React (`isDropdownOpen`) acionados via evento nativo de `onClick`, assegurando responsividade perfeita.
* **Redirecionamento Pós-Login:** Inicialmente, o redirecionamento poderia quebrar a jornada do usuário. **Solução:** Aplicação tática do `useSearchParams` com a query `?redirect=` no Auth para fazê-lo voltar magicamente para a tela onde estava.
* **Caching de Rotas (Vite 404):** Ao inserir as rotas dinamicamente, o HMR (Hot Reload) do Vite reteve cache quebrando a leitura do `/esqueci-senha`. **Solução:** Ação provocada de `touch` ou *reload* manual resolve o mapeamento instantaneamente.
* **Segurança de Credentials:** **Solução:** Implementação emergencial de `.gitignore` raiz e criação de `.env.example` para mascarar as senhas do Mailtrap.

## Validação Local

**Passo a passo para validar o MVP nesta fase:**
1. Clone / Atualize o repositório.
2. Certifique-se de preencher o arquivo `backend/.env` guiando-se pelo `backend/.env.example`.
3. Garanta que o banco PostgreSQL rodou a Query de tabela de senhas.
4. Rode `npm start` no `/backend` e `npm run dev` na raiz.
5. Pelo navegador (`localhost:5173`), tente colocar um item no carrinho sem estar logado, cadastre-se, verifique o dropdown de "Minha Conta".
6. Faça Logout e teste a aba "Esqueci minha senha" acompanhando a caixa do Mailtrap/Gmail.

## Situação Atual do Projeto

**Concluído:** O *core* de consumo (Dia 1: Carrinho e Frete) e a blindagem de usuários (Dia 2: JWT e Redefinições) estão finalizados, estáveis e não carecem de modificação estrutural.
**Pendente para MVP:** Faltam agora as amarrações do fluxo final, como a página completa de "Minha Conta/Pedidos", o sistema do dono da loja ("Painel Admin" para gerir Estoque e Cupons) e a integração do checkout com uma API financeira (Mercado Pago).
