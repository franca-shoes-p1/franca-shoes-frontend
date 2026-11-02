-- =====================================================================
-- ASSINATURA (PASSE DE 30 DIAS) + DESCONTO POR RAMO
-- Supabase > SQL Editor > New query > cole TUDO > Run. Pode rodar mais de uma vez.
-- Precisa do supabase-cal-lotes-portal.sql e do supabase-vitrine-pagamentos.sql ja rodados.
-- =====================================================================

-- 1) Ajustes simples (preco do passe e taxa usada no calculo do desconto)
create table if not exists public.cal_config (
  chave text primary key,
  valor text not null
);
insert into public.cal_config (chave, valor) values ('preco_passe', '29.90'), ('taxa_mp_pct', '4.98')
on conflict (chave) do nothing;

-- 2) Criterio do desconto por ramo: "margem" = so o que a margem permite sem mexer no fundo dos operadores;
--    "teto" = percentual fixo do ramo. Em ambos vale o menor entre o que a margem permite e o teto.
create table if not exists public.cal_ramos (
  slug text primary key,
  nome text not null,
  modo text not null default 'teto' check (modo in ('margem','teto')),
  teto_pct numeric(5,2) check (teto_pct is null or (teto_pct >= 0 and teto_pct <= 80)),
  automatico boolean not null default false,   -- true = o site aplica o desconto sozinho; false = combinado pelo WhatsApp
  ordem int not null default 0,
  ativo boolean not null default true
);
insert into public.cal_ramos (slug, nome, modo, teto_pct, automatico, ordem) values
  ('calcados', 'Calçados e acessórios', 'margem', null, true, 1),
  ('ebooks', 'E-books e livros', 'teto', 30, false, 2),
  ('servicos', 'Serviços sob medida (Ateliê, Sites, Oficina, Radar)', 'teto', 15, false, 3),
  ('cursos', 'Cursos e outros', 'teto', 20, false, 4)
on conflict (slug) do nothing;

alter table public.cal_config enable row level security;
alter table public.cal_ramos enable row level security;

-- 3) Colunas novas
alter table public.varejo_pedidos add column if not exists tipo text not null default 'produto';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'varejo_pedidos_tipo_chk') then
    alter table public.varejo_pedidos add constraint varejo_pedidos_tipo_chk check (tipo in ('produto','passe'));
  end if;
end $$;
alter table public.varejo_pedidos add column if not exists subtotal_geral numeric(10,2);  -- soma dos precos GERAIS (base do fundo dos operadores)
alter table public.rf_produtos add column if not exists ramo text not null default 'calcados';

-- 4) Quando um pedido vira 'pago':
--    - passe: soma 30 dias ao acesso (acumula na renovacao) e o pedido ja fica 'entregue' (nao ha o que enviar);
--    - produto: entra no lote da rodoviaria (se for o caso) e libera 30 dias de bonus de boas-vindas.
create or replace function public.cal_pedido_mudou() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_local text; v_lote bigint; v_lote_status text;
begin
  if new.status = 'pago' and (tg_op = 'INSERT' or old.status is distinct from 'pago') then
    if new.tipo = 'passe' then
      if new.email is not null and new.email <> '' then
        insert into public.cal_acessos_portal(chave, nome, whatsapp, expira_em)
        values (lower(new.email), new.cliente_nome, new.whatsapp, now() + interval '30 days')
        on conflict (chave) do update
          set expira_em = greatest(public.cal_acessos_portal.expira_em, now()) + interval '30 days',
              nome = coalesce(excluded.nome, public.cal_acessos_portal.nome),
              whatsapp = coalesce(excluded.whatsapp, public.cal_acessos_portal.whatsapp);
      end if;
      update public.varejo_pedidos set status = 'entregue' where id = new.id;
    else
      if new.entrega = 'rodoviaria' and new.lote_id is null then
        v_local := lower(trim(new.cidade)) || '-' || lower(trim(new.estado));
        select id into v_lote from public.cal_lotes where local = v_local and status = 'aberto';
        if v_lote is null then
          insert into public.cal_lotes(local, cidade, estado) values (v_local, trim(new.cidade), upper(trim(new.estado)))
          on conflict (local) where status = 'aberto' do nothing;
          select id into v_lote from public.cal_lotes where local = v_local and status = 'aberto';
        end if;
        update public.varejo_pedidos set lote_id = v_lote where id = new.id;
        update public.cal_lotes l set status = 'fechado', fechado_em = now()
         where l.id = v_lote and (select count(*) from public.varejo_pedidos where lote_id = v_lote) >= l.minimo;
      end if;
      if new.email is not null and new.email <> '' then
        insert into public.cal_acessos_portal(chave, nome, whatsapp, expira_em)
        values (lower(new.email), new.cliente_nome, new.whatsapp, now() + interval '30 days')
        on conflict (chave) do update
          set expira_em = greatest(public.cal_acessos_portal.expira_em, now() + interval '30 days');
      end if;
    end if;
  elsif tg_op = 'UPDATE' and new.status in ('cancelado','reembolsado') and old.status is distinct from new.status
        and new.lote_id is not null then
    select status into v_lote_status from public.cal_lotes where id = new.lote_id;
    if v_lote_status = 'aberto' then
      update public.varejo_pedidos set lote_id = null where id = new.id;
    end if;
  end if;
  return new;
end $$;

-- 5) Fundo dos operadores: calculado sobre o preco GERAL (o desconto do assinante sai da parte do dono)
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
    v_lucro := round(coalesce(r.subtotal_geral, r.subtotal) - r.custo_fabrica - coalesce(r.taxa_pagamento, 0), 2);
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
