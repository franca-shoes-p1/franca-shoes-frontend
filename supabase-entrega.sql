-- Parte 3: dia de entrega com hora marcada, aviso ao cliente, registro de avisos e "cliente não apareceu".
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.
alter table public.forn_pedidos add column if not exists entrega_dia timestamptz;        -- dia e hora marcados na rodoviária
alter table public.forn_pedidos add column if not exists entrega_rodoviaria text;        -- rodoviária escolhida
alter table public.forn_pedidos add column if not exists cliente_avisado_em timestamptz; -- o revendedor avisou o cliente
alter table public.forn_pedidos add column if not exists lembrete_em timestamptz;        -- lembrete enviado
alter table public.forn_pedidos add column if not exists nao_compareceu_em timestamptz;  -- cliente não apareceu: segue por Correios

create table if not exists public.entrega_registros (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  pedido_id uuid not null references public.forn_pedidos(id),
  quem text not null,       -- loja | revendedor | sistema
  texto text not null
);
create index if not exists entrega_registros_ped_idx on public.entrega_registros (pedido_id, criado_em);
alter table public.entrega_registros enable row level security;
