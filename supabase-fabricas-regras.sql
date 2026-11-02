-- =====================================================================
-- REGRAS POR FÁBRICA (lote mínimo, prazo, troca) + vínculo com os modelos da loja
-- Supabase > SQL Editor > New query > cole TUDO > Run. Pode rodar mais de uma vez.
-- O nome da fábrica (nome_interno) NUNCA aparece para o cliente: só você vê no painel.
-- =====================================================================

create table if not exists public.cal_fabricas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome_interno text not null unique,
  lote_minimo_pares int not null default 1 check (lote_minimo_pares between 1 and 500),
  prazo_preparo text,                                   -- ex.: '3 a 5 dias úteis depois que a fábrica entregar'
  troca_defeito_dias int not null default 30 check (troca_defeito_dias between 30 and 365),
  troca_numeracao boolean not null default true,        -- a fábrica aceita troca de numeração?
  troca_obs text,                                       -- observação mostrada ao cliente (sem nome da fábrica)
  ativo boolean not null default true
);
alter table public.cal_fabricas enable row level security;

alter table public.rf_produtos add column if not exists fabrica_id uuid references public.cal_fabricas(id) on delete set null;

-- Primeira fábrica: lote mínimo de 12 pares para retirar. Os dois sapatos cadastrados ficam ligados a ela.
insert into public.cal_fabricas (nome_interno, lote_minimo_pares) values ('Di Franca', 12)
on conflict (nome_interno) do nothing;

update public.rf_produtos
   set fabrica_id = (select id from public.cal_fabricas where nome_interno = 'Di Franca')
 where fabrica_id is null and fornecedor_id is null
   and nome in ('Sapato Social Marrom 935', 'Sapato Social Preto 934');
