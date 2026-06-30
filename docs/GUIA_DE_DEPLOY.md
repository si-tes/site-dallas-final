# Guia de Deploy e Produção - Dalla Imports

Este guia documenta o processo padrão para colocar o projeto MVP Dalla Imports em um ambiente online de Produção.

## 1. Deploy Frontend (React/Vite)
A plataforma recomendada para o frontend estático é a **Vercel**, **Netlify** ou **Render**.

1. Crie uma conta na plataforma escolhida e vincule ao GitHub.
2. Defina o diretório raiz para a pasta primária do projeto.
3. Insira os comandos de Build:
   - **Comando de Build:** `npm run build`
   - **Diretório de Saída (Publish directory):** `dist`
4. Na seção de **Variáveis de Ambiente**, se houver necessidade no frontend, insira eventuais chaves públicas.
5. Inicie o Deploy. A plataforma cuidará de instalar dependências, rodar o compilador e hospedar os arquivos minificados sob HTTPS.

## 2. Deploy Backend (Node.js)
A API RESTful pode ser hospedada de forma fácil usando serviços PaaS como **Railway.app**, **Render** ou uma instância **VPS (AWS/DigitalOcean/Hostinger)**.

1. Na plataforma PaaS, selecione o repositório e mude o *Root Directory* para `/backend` (ou garanta que os scripts rodem dentro desta subpasta).
2. O **Comando de Build** geralmente é apenas `npm install`.
3. O **Start Command** para produção é `node src/app.js` ou `npm start`.
4. Defina rigorosamente todas as Variáveis de Ambiente requeridas antes de acionar a máquina (veja a seção de Variáveis abaixo).

## 3. Deploy PostgreSQL
1. Se usar Railway, você pode plugar um banco PostgreSQL provisionado com 1 clique.
2. Em produção, anote a variável `DATABASE_URL` (String de Conexão fornecida pelo host).
3. Adapte a configuração `db.js` do backend, se necessário, para extrair essa `DATABASE_URL` em vez do driver puro. (A biblioteca `pg` suporta instanciar Pools diretamente por connection strings).
4. Utilize o `pgAdmin` ou um conector local (ex: DBeaver) apontando para as credenciais da nuvem para despejar o dump SQL das tabelas.

## 4. Variáveis de Ambiente Obrigatórias
No servidor de produção do Node (ex: Settings > Variables no Render):
- `JWT_SECRET`: string longa e segura para assinar tokens.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: e-mail da loja para envios de esqueci a senha.
- `FRONTEND_URL`: domínio oficial de onde o Vercel enviou o app. Ex: `https://dallaimports.com.br`
- `MP_ACCESS_TOKEN` / `MP_PUBLIC_KEY`: Credenciais reais obtidas no painel do Mercado Pago Developers (aba Produção).

## 5. Uploads de Arquivos
Atualmente, o projeto utiliza upload local via `multer` salvo fisicamente na pasta `backend/uploads/produtos`.
> **Aviso Crítico de Deploy:** Em ambientes como Vercel/Railway, o File System (armazenamento local) é efêmero. O que significa que ao reiniciar o servidor, as fotos upadas pelo painel de admin irão sumir.
> **Solução Recomendada:** Altere a rota e o middleware de Multer em `produtoImagemController.js` para integrar diretamente com a AWS S3 ou Cloudinary para armazenamento persistente na nuvem.

## 6. Procedimento de Teste Inicial Pós-Deploy
1. Acesse o URL gerado (ex: `https://seu-front.vercel.app`).
2. Tente navegar até a Home (que solicitará conexão ao URL da API backend).
3. Verifique os logs de inicialização do backend na plataforma para checar se ele se conectou com sucesso ao Banco de Dados remotamente e se ouve na porta `process.env.PORT`.

## 7. Notas sobre Integração de Pagamento (PIX vs Sandbox)
A integração com o Mercado Pago utiliza variáveis diferentes dependendo do ambiente (`NODE_ENV`).
Ao testar localmente (Sandbox Checkout Pro), o **PIX** poderá não ser exibido entre as opções de pagamento. Isso ocorre por uma política de homologação do Mercado Pago, que frequentemente oculta o botão do PIX em Sandbox por não existir transferência bancária real de teste via Banco Central no painel público.
- **Ambiente Local (Desenvolvimento):** O sistema aciona o `sandbox_init_point` do Mercado Pago. Valide o fluxo usando Cartão de Crédito Falso (Sandbox) ou Boleto.
- **Ambiente Produção/Staging:** Apenas quando o sistema é compilado com `NODE_ENV='production'`, o backend aciona o `init_point` (Produção Real). O PIX deve ser validado neste ambiente utilizando transações reais de baixo valor (R$ 1,00). 
- **⚠️ Cuidado:** Nunca teste compras utilizando o mesmo e-mail de comprador que o e-mail cadastrado na sua conta de Lojista do Mercado Pago. O MP bloqueará o PIX automaticamente.
