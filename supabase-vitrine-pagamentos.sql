-- FUNDO DA EQUIPE VITRINE: parte do lucro de cada venda entregue é dividida entre quem ajudou a publicar o produto.
-- Regra da empresa: só se paga depois que o cliente pagou, recebeu e passou o prazo de arrependimento.
-- Supabase -> SQL Editor -> New query -> cole TUDO -> Run. Pode rodar mais de uma vez.
-- Precisa da tabela varejo_pedidos (loja /calcados). Não precisa da Oficina.

do $$ begin
  if to_regclass('public.varejo_pedidos') is null then
    raise exception 'A tabela varejo_pedidos nao existe. Rode antes o supabase-varejo.sql da loja /calcados.';
  end if;
end $$;

-- 1) Dados do pedido usados no cálculo
alter table public.varejo_pedidos add column if not exists entregue_em timestamptz;
alter table public.varejo_pedidos add column if not exists custo_fabrica numeric(10,2);   -- quanto você pagou na fábrica pelo pedido todo
alter table public.varejo_pedidos add column if not exists taxa_pagamento numeric(10,2);  -- taxa do Mercado Pago deste pedido

-- 2) Regras editáveis no painel
create table if not exists public.vit_config (
  chave text primary key,
  valor numeric not null,
  descricao text
);
insert into public.vit_config (chave, valor, descricao) values
  ('fundo_pct', 20, 'Percentual do lucro de cada venda que vai para o fundo da equipe'),
  ('carencia_dias', 7, 'Dias depois da entrega antes de apurar (prazo de arrependimento do cliente)'),
  ('peso_validacao', 50, 'Peso de quem validou o produto com o fornecedor'),
  ('peso_cadastro', 30, 'Peso de quem cadastrou o modelo'),
  ('peso_divulgacao', 20, 'Peso de quem divulgou o produto')
on conflict (chave) do nothing;

-- 3) Quem ajudou em cada produto (você registra no painel)
create table if not exists public.vit_contribuicoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  produto_id uuid not null,
  operario_id uuid,
  nome text not null,
  tipo text not null check (tipo in ('validacao','cadastro','divulgacao')),
  unique (produto_id, nome, tipo)
);

-- 4) Uma apuração por pedido e os pagamentos que saem dela
create table if not exists public.vit_lancamentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  pedido_id uuid not null unique,
  lucro numeric(10,2) not null,
  fundo numeric(10,2) not null,
  distribuido numeric(10,2) not null default 0
);
create table if not exists public.vit_pagamentos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  lancamento_id uuid references public.vit_lancamentos(id) on delete cascade,
  pedido_id uuid not null,
  produto_id uuid not null,
  operario_id uuid,
  nome text not null,
  tipo text not null,
  valor numeric(10,2) not null,
  status text not null default 'a_pagar' check (status in ('a_pagar','pago','cancelado')),
  pago_em timestamptz,
  nota text
);
create index if not exists vit_pagamentos_status_idx on public.vit_pagamentos (status, nome);

alter table public.vit_config enable row level security;
alter table public.vit_contribuicoes enable row level security;
alter table public.vit_lancamentos enable row level security;
alter table public.vit_pagamentos enable row level security;

-- 5) Marca a data da entrega e cancela o que ainda não foi pago se o pedido for reembolsado
create or replace function public.vit_pedido_antes() returns trigger
language plpgsql as $$
begin
  if new.status = 'entregue' and old.status is distinct from 'entregue' then new.entregue_em := now(); end if;
  if new.status <> 'entregue' and old.status = 'entregue' then new.entregue_em := null; end if;
  return new;
end $$;
drop trigger if exists t_vit_pedido_antes on public.varejo_pedidos;
create trigger t_vit_pedido_antes before update of status on public.varejo_pedidos
for each row execute function public.vit_pedido_antes();

create or replace function public.vit_pedido_depois() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('cancelado','reembolsado') and old.status is distinct from new.status then
    update public.vit_pagamentos set status = 'cancelado', nota = 'Pedido ' || new.status
     where pedido_id = new.id and status = 'a_pagar';
  end if;
  return new;
end $$;
drop trigger if exists t_vit_pedido_depois on public.varejo_pedidos;
create trigger t_vit_pedido_depois after update of status on public.varejo_pedidos
for each row execute function public.vit_pedido_depois();

-- 6) Apuração: pedidos entregues, com custo informado e fora do prazo de arrependimento
create or replace function public.vit_apurar() returns table(pedidos int, valor numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_pct numeric; v_car int; r record; it record; v_lucro numeric; v_fundo numeric; v_lanc uuid;
begin
  select c.valor into v_pct from public.vit_config c where c.chave = 'fundo_pct';
  select c.valor::int into v_car from public.vit_config c where c.chave = 'carencia_dias';
  v_pct := coalesce(v_pct, 0); v_car := coalesce(v_car, 7);
  pedidos := 0; valor := 0;
  for r in
    select p.* from public.varejo_pedidos p
     where p.status = 'entregue' and p.entregue_em is not null
       and p.entregue_em <= now() - make_interval(days => v_car)
       and p.custo_fabrica is not null
       and not exists (select 1 from public.vit_lancamentos l where l.pedido_id = p.id)
  loop
    v_lucro := round(r.subtotal - r.custo_fabrica - coalesce(r.taxa_pagamento, 0), 2);
    v_fundo := case when v_lucro > 0 then round(v_lucro * v_pct / 100, 2) else 0 end;
    insert into public.vit_lancamentos (pedido_id, lucro, fundo) values (r.id, v_lucro, v_fundo) returning id into v_lanc;
    if v_fundo > 0 and r.subtotal > 0 then
      for it in
        select (e->>'id')::uuid as produto_id,
               coalesce((e->>'preco')::numeric, 0) * coalesce((e->>'quantidade')::numeric, 0) as linha
          from jsonb_array_elements(r.itens) e
         where (e->>'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      loop
        insert into public.vit_pagamentos (lancamento_id, pedido_id, produto_id, operario_id, nome, tipo, valor)
        select v_lanc, r.id, it.produto_id, x.operario_id, x.nome, x.tipo, x.v
          from (
            select c.operario_id, c.nome, c.tipo,
                   round(v_fundo * (it.linha / r.subtotal) * (c.peso / nullif(sum(c.peso) over (), 0)), 2) as v
              from (
                select c0.*, coalesce((select k.valor from public.vit_config k where k.chave = 'peso_' || c0.tipo), 0) as peso
                  from public.vit_contribuicoes c0 where c0.produto_id = it.produto_id
              ) c
          ) x
         where x.v > 0;
      end loop;
      update public.vit_lancamentos l
         set distribuido = coalesce((select sum(g.valor) from public.vit_pagamentos g where g.lancamento_id = l.id), 0)
       where l.id = v_lanc;
    end if;
    pedidos := pedidos + 1;
    valor := valor + coalesce((select l.distribuido from public.vit_lancamentos l where l.id = v_lanc), 0);
  end loop;
  return next;
end $$;

-- 7) Resumo para o painel: quanto cada pessoa tem a receber
create or replace view public.vit_resumo_pagamentos as
select nome, count(*) as itens, sum(valor) as a_pagar
from public.vit_pagamentos where status = 'a_pagar'
group by nome order by sum(valor) desc;
