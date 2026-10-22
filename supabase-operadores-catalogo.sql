-- Acesso de operador só para cadastro de modelos. Rode DEPOIS de supabase-operadores.sql.
-- Supabase: SQL Editor -> New query -> Run.
alter table public.op_operarios add column if not exists pode_catalogo boolean not null default false;

-- Quais modelos foram cadastrados por qual operador (não mexe na tabela rf_produtos).
create table if not exists public.op_catalogo_registros (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  produto_id uuid not null unique,
  operario_id uuid not null references public.op_operarios(id)
);
create index if not exists op_catalogo_registros_operario on public.op_catalogo_registros (operario_id, criado_em desc);
alter table public.op_catalogo_registros enable row level security;
