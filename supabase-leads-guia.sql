-- Guia de captação de fornecedores + fila de fábricas para abordar.
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.
create table if not exists public.forn_leads (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text not null,
  contato text,                       -- nome da pessoa, se souber
  whatsapp text,                      -- só números, com DDD
  email text,
  instagram text,
  site text,
  endereco text,
  origem text not null default 'manual',  -- manual | mapa | indicacao | n8n
  nota int not null default 0,        -- 0 a 10: quanto parece uma boa fábrica
  status text not null default 'novo',    -- novo | abordado | respondeu | interessado | cadastrado | frio | descartado
  abordagens int not null default 0,
  ultima_abordagem timestamptz,
  proximo_contato date,
  obs text
);
create unique index if not exists forn_leads_nome_idx on public.forn_leads (lower(nome));
create index if not exists forn_leads_status_idx on public.forn_leads (status, proximo_contato);
alter table public.forn_leads enable row level security;

create table if not exists public.guia_tarefas (
  guia text not null,
  passo text not null,
  feita_em timestamptz not null default now(),
  primary key (guia, passo)
);
alter table public.guia_tarefas enable row level security;
