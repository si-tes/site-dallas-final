# Guia de Backup e Persistência

Garantir a retenção dos dados e catálogos da loja Dalla Imports é crítico para o negócio. Siga essas diretrizes de backup sistêmico.

## 1. Backup do PostgreSQL (Dados, Pedidos, Usuários)
Recomenda-se realizar despejos (Dumps) automáticos semanais ou diários de sua base de dados, prevenindo perda de catálogos e cupons ativos.

### Como gerar um Dump (via CLI/Terminal):
```bash
pg_dump -U nome_usuario -h host_do_banco -d nome_banco > backup_dalla_28052026.sql
```
Se estiver usando interface gráfica (como DBeaver ou pgAdmin):
1. Clique com o direito no Banco de Dados em Produção.
2. Acesse Tools > Backup.
3. Exporte a estrutura e os dados para um arquivo `.sql` ou arquivo binário compactado.

### Como restaurar o Dump:
```bash
psql -U nome_usuario -h host_do_banco -d novo_banco < backup_dalla_28052026.sql
```

## 2. Backup de Uploads (Imagens)
No modelo atual, as imagens enviadas via Painel Admin estão isoladas na pasta `backend/uploads/produtos/`.
**Este diretório é ignorado pelo Git (devido ao `.gitignore`), o que significa que o código-fonte hospedado não os contém.**

### Como reter:
- Em ambiente de VPS ou CPanel local, compacte a pasta `/uploads` com ZIP via terminal (`zip -r uploads_backup.zip uploads/`) e baixe para um cofre local ou GDrive periodicamente.
- Se realizar migração de servidor, a nova pasta `backend/uploads/produtos` deve receber todos os arquivos originais descompactados nela com suas exatas extensões originais, pois o banco de dados armazenou as URLs amigáveis com base nesses nomes de arquivos gerados pelo multer.

## 3. Migrations (Controle de Versão de Banco)
Neste MVP, as estruturas de banco de dados foram inseridas através de SQL Puro (`CREATE TABLE`) nos inícios dos ciclos de sprint, sem uso de ORMs como Prisma/Sequelize.
- O backup estrutural (as queries DDL) devem ser mantidas se um programador futuro for assumir.
- Alterações de tabelas na produção precisam ser executadas manualmente via `ALTER TABLE` diretamente no painel do Postgre, não havendo automação de versionamento no momento.
