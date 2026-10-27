-- Painel de Postagens do operador (divulgação diária). Rode UMA vez no Supabase:
-- SQL Editor -> New query -> cole tudo -> Run. Rode DEPOIS de supabase-operadores.sql.
-- Não mexe em nenhuma tabela que já existe, só acrescenta uma coluna e uma tabela nova.

-- Permissão do operador para trabalhar com postagens (o dono libera em /admin/operadores).
alter table public.op_operarios add column if not exists pode_postagens boolean not null default false;

create table if not exists public.op_postagens (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),

  chave_externa text unique,                 -- evita duplicar quando o n8n roda duas vezes (ex.: 2026-10-28-facebook-1)
  projeto text not null default 'igreja.eco.br',
  lote text,                                 -- ex.: 2026-10-28 (o dia em que a IA gerou)
  origem text not null default 'ia',         -- ia | lote | manual

  rede text not null check (rede in ('facebook', 'instagram', 'telegram', 'email')),
  titulo text not null,                      -- nome interno, só para identificar na fila
  texto text not null,                       -- legenda / mensagem / corpo do e-mail
  hashtags text,
  link_destino text,                         -- link que vai na postagem (https)
  imagem_url text,                           -- arte pronta (https). Se vazio, o painel desenha a arte com arte_titulo/arte_subtitulo
  arte_titulo text,
  arte_subtitulo text,
  arte_tema text not null default 'azul',    -- azul | verde | terra | noite
  email_assunto text,                        -- só para rede = email

  agendada_para timestamptz not null,
  status text not null default 'agendada' check (status in ('agendada', 'em_andamento', 'postada', 'pulada', 'cancelada')),

  operario_id uuid references public.op_operarios(id),
  assumida_em timestamptz,
  postada_em timestamptz,
  link_postagem text,
  observacao_operador text
);

create index if not exists op_postagens_fila on public.op_postagens (status, agendada_para);
create index if not exists op_postagens_operario on public.op_postagens (operario_id, status);

-- Só o servidor (chave de serviço) acessa esta tabela.
alter table public.op_postagens enable row level security;
