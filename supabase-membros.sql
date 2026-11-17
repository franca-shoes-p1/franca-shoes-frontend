-- Cadastro de membros da igreja (página /seja-membro). Só o servidor acessa.
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.
create table if not exists public.igreja_membros (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  cidade text,
  conheceu text,
  servir text,
  grupos text,
  horario text,
  obs text,
  aceite boolean not null default false,
  maior_18 boolean not null default false,
  responsavel_menor boolean not null default false,
  dados_autorizados boolean not null default false,
  status text not null default 'novo',   -- novo | acolhido | em_grupo | inativo
  nota_interna text,
  acolhido_em timestamptz
);
create index if not exists igreja_membros_status_idx on public.igreja_membros (status, criado_em desc);
alter table public.igreja_membros enable row level security;
