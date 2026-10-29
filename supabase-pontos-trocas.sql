-- Radar de Pontos: divulgação digital semanal e troca entre parceiros.
-- Rode uma vez no Supabase (SQL Editor). Pode rodar de novo sem problema.
-- Antes, o supabase-pontos.sql e o supabase-pontos-perfil.sql precisam ter sido rodados.

alter table rf_pontos add column if not exists ramo text;
alter table rf_pontos add column if not exists troca_aberta boolean not null default false;

create table if not exists rf_divulgacoes (
  id uuid primary key default gen_random_uuid(),
  ponto_id uuid not null references rf_pontos(id) on delete cascade,
  semana text not null,                    -- ex.: 2026-S44
  canal text not null,                     -- whatsapp, instagram, facebook, grupo, outro
  link text,
  obs text,
  status text not null default 'pendente' check (status in ('pendente','aprovado','reprovado')),
  criado_em timestamptz not null default now(),
  unique (ponto_id, semana, canal)
);
create index if not exists rf_divulgacoes_status_idx on rf_divulgacoes (status, criado_em);

create table if not exists rf_trocas (
  id uuid primary key default gen_random_uuid(),
  de_id uuid not null references rf_pontos(id) on delete cascade,
  para_id uuid not null references rf_pontos(id) on delete cascade,
  status text not null default 'proposta' check (status in ('proposta','aceita','recusada')),
  criado_em timestamptz not null default now(),
  unique (de_id, para_id)
);

alter table rf_divulgacoes enable row level security;
alter table rf_trocas enable row level security;
