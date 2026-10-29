-- Radar de Pontos: semana de captação e painel de tarefas.
-- Rode uma vez no Supabase (SQL Editor). Pode rodar de novo sem problema.

create table if not exists rf_tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  detalhe text,
  cidade text,
  categoria text not null default 'geral',   -- captacao, contato, convite, aprovacao, material, viagem, geral
  data_prevista date not null default current_date,
  status text not null default 'pendente' check (status in ('pendente','feito')),
  origem text not null default 'manual' check (origem in ('manual','plano')),
  chave text unique,                         -- só as tarefas do plano; evita duplicar
  criado_em timestamptz not null default now(),
  feito_em timestamptz
);
create index if not exists rf_tarefas_data_idx on rf_tarefas (data_prevista, status);
alter table rf_tarefas enable row level security;
