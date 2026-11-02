-- =====================================================================
-- LOTES DE RETIRADA NA RODOVIÁRIA + BÔNUS DO PORTAL (loja /calcados)
-- Supabase > SQL Editor > New query > cole TUDO > Run. Pode rodar mais de uma vez.
-- Usa o prefixo cal_ porque o seu banco já tem as tabelas "pedidos" e "lotes" de outros projetos.
-- Liga-se à tabela real da loja: public.varejo_pedidos
-- =====================================================================

do $$ begin
  if to_regclass('public.varejo_pedidos') is null then
    raise exception 'A tabela varejo_pedidos nao existe. Rode antes o supabase-varejo.sql da loja /calcados.';
  end if;
end $$;

-- 1) Colunas novas no pedido da loja (não mexem no que já existe)
alter table public.varejo_pedidos add column if not exists entrega text not null default 'correios';
alter table public.varejo_pedidos add column if not exists lote_id bigint;
alter table public.varejo_pedidos add column if not exists custo_fabrica numeric(10,2);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'varejo_pedidos_entrega_chk') then
    alter table public.varejo_pedidos add constraint varejo_pedidos_entrega_chk
      check (entrega in ('correios','rodoviaria'));
  end if;
end $$;

-- 2) Lotes de retirada na rodoviária (um lote aberto por cidade)
create table if not exists public.cal_lotes (
  id bigserial primary key,
  local text not null,                 -- ex.: 'belo horizonte-mg'
  cidade text not null,
  estado text not null,
  minimo int not null default 10,      -- pedidos para fechar o lote
  status text not null default 'aberto' check (status in ('aberto','fechado','em_rota','entregue')),
  criado_em timestamptz not null default now(),
  fechado_em timestamptz,
  data_saida date,
  nota_interna text
);
create unique index if not exists cal_lotes_um_aberto on public.cal_lotes (local) where status = 'aberto';

-- 3) Acesso ao portal liberado pela compra (1 mês grátis)
create table if not exists public.cal_acessos_portal (
  id bigserial primary key,
  chave text unique not null,          -- e-mail do cliente
  nome text,
  whatsapp text,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null
);

alter table public.cal_lotes enable row level security;
alter table public.cal_acessos_portal enable row level security;

-- 4) Vagas do lote (público: devolve só números)
create or replace function public.cal_lote_vagas(p_local text)
returns table(pedidos int, minimo int)
language sql security definer set search_path = public as $$
  select (select count(*)::int from public.varejo_pedidos p where p.lote_id = l.id), l.minimo
  from public.cal_lotes l
  where l.local = lower(trim(p_local)) and l.status = 'aberto'
  limit 1;
$$;
grant execute on function public.cal_lote_vagas(text) to anon;

-- 5) Quando o pedido vira 'pago': entra no lote e libera 30 dias de portal.
--    Se for cancelado/reembolsado antes do lote fechar, sai do lote.
create or replace function public.cal_pedido_mudou() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_local text; v_lote bigint; v_lote_status text;
begin
  if new.status = 'pago' and (tg_op = 'INSERT' or old.status is distinct from 'pago') then
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
  elsif tg_op = 'UPDATE' and new.status in ('cancelado','reembolsado') and old.status is distinct from new.status
        and new.lote_id is not null then
    select status into v_lote_status from public.cal_lotes where id = new.lote_id;
    if v_lote_status = 'aberto' then
      update public.varejo_pedidos set lote_id = null where id = new.id;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists t_cal_pedido_mudou on public.varejo_pedidos;
create trigger t_cal_pedido_mudou after insert or update of status on public.varejo_pedidos
for each row execute function public.cal_pedido_mudou();

-- 6) Painel dos lotes (Table Editor > Views)
create or replace view public.cal_painel_lotes as
select l.id, l.cidade, l.estado, l.status, l.minimo, count(p.id) as pedidos,
       sum(p.total) as receita, l.data_saida
from public.cal_lotes l left join public.varejo_pedidos p on p.lote_id = l.id
group by l.id order by l.id desc;

-- 7) Leads e cliques das páginas de venda (o n8n grava aqui pelo webhook)
create table if not exists public.cal_leads (
  id bigserial primary key,
  criado_em timestamptz not null default now(),
  evento text,                 -- visualizou_pagina | clique_comprar | clique_whatsapp | lead
  nome text,
  whatsapp text,
  produto_sku text,
  tamanho int,
  entrega text,
  cidade text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  pagina text
);
alter table public.cal_leads enable row level security;
