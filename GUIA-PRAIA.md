# Parceiros da Praia — manual do que foi feito (03/11/2026)

Parceria de venda de comida na praia: o dono entra com kit e estoque, o sócio local com o trabalho, lucro do dia dividido 50/50.

## Páginas públicas
- Capa na home (`lib/PraiaHomeBanner.jsx`, após a Oficina) e card no menu de projetos.
- `/praia` (conteúdo e vagas), `/praia/cadastro`, `/praia/obrigado`, `/praia/privacidade`.
- Textos e regras em `lib/praia.js`.

## Área do sócio
- `/praia/socio`: login por código pessoal (cookie `prsess`), abas Início, Meu dia, Minha conta, Regras, Legal, Avisos, Ajuda.
- Regras no servidor (`pages/api/praia/socio/acao.js`): kit só com ambulante + curso + contrato; sem fechamento do dia anterior não há nova retirada; dia fechado não aceita novos registros.

## Painel do dono
- `/admin/praia` (mesma senha do painel): visão geral, Meu papel (7 etapas com checklist), candidatos, sócios, fechamentos (alerta acima de 10%), produtos, vagas, avisos.
- Aprovar candidato gera o código de acesso, mostrado uma única vez.

## Banco (Supabase)
1. Tabelas `praia_` do projeto (já criadas em 03/11/2026).
2. `supabase-praia-extra.sql`: `praia_vagas`, `praia_avisos`, `praia_etapas`, `praia_checklists` e colunas `codigo_hash`, `origem`, `aceito_em`.
Sem policies de propósito: só o servidor lê e grava (chave de serviço da Vercel).

## Variáveis necessárias na Vercel
`SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`), `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (já usadas pelo site).

## Pendências
Revisão do contrato e da privacidade por advogado/contador; foto de conferência; avisos no Telegram via n8n.
