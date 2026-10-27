-- Programa de Afiliados: código de divulgação de cada operador/divulgador e registro das indicações.
-- Pode rodar mais de uma vez. SQL Editor -> limpar -> colar tudo -> Run.

alter table public.op_operarios add column if not exists ref_codigo text;
update public.op_operarios set ref_codigo = substr(md5(random()::text || id::text), 1, 8) where ref_codigo is null;
alter table public.op_operarios alter column ref_codigo set default substr(md5(random()::text || clock_timestamp()::text), 1, 8);
create unique index if not exists op_operarios_ref_codigo on public.op_operarios (ref_codigo);

create table if not exists public.op_indicacoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  afiliado_id uuid not null references public.op_operarios(id),
  tipo text not null check (tipo in ('pedido', 'operador')),
  pedido_id uuid references public.op_atelie_pedidos(id),
  candidato_id uuid references public.op_candidatos(id),
  indicado text,
  status text not null default 'registrada',      -- registrada | paga | cancelada
  valor numeric(10,2) not null default 0,
  pontos int not null default 0,
  pago_em timestamptz
);
create unique index if not exists op_indicacoes_pedido on public.op_indicacoes (pedido_id) where pedido_id is not null;
create unique index if not exists op_indicacoes_candidato on public.op_indicacoes (candidato_id) where candidato_id is not null;
create index if not exists op_indicacoes_afiliado on public.op_indicacoes (afiliado_id, criado_em desc);
alter table public.op_indicacoes enable row level security;
revoke all on public.op_indicacoes from anon, authenticated;
