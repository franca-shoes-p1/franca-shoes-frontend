-- Atendimento: mensagens do formulário "Fale conosco" (/contato).
-- Rode uma vez no Supabase: SQL Editor -> New query -> cole tudo -> Run.
-- Não altera nenhuma tabela que já existe (só cria a tabela abaixo).

create table if not exists public.op_contatos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  nome text not null,
  whatsapp text,                                -- pelo menos um entre whatsapp e email é obrigatório (conferido na API)
  email text,
  assunto text not null,                        -- lista fixa definida em /api/contato
  mensagem text not null,
  pagina text,                                  -- de qual página do site a pessoa escreveu
  canal text not null default 'site',           -- site | (futuro) chat | whatsapp | instagram ...
  status text not null default 'novo',          -- novo | em_atendimento | respondido | resolvido | spam
  nota_interna text
);

create index if not exists op_contatos_status on public.op_contatos (status, criado_em desc);

-- Só o servidor (chave de serviço) lê e grava. O navegador nunca acessa esta tabela.
alter table public.op_contatos enable row level security;
