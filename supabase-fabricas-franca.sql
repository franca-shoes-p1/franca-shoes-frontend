-- =====================================================================
-- VITRINE "FÁBRICAS DE FRANCA": guia público com links para os sites das empresas,
-- contagem de cliques, destaque patrocinado (identificado como publicidade)
-- e registro de compras feitas nos sites das empresas (bônus de passe após conferência).
-- Supabase > SQL Editor > New query > cole TUDO > Run. Pode rodar mais de uma vez.
-- Não mexe em nenhuma tabela existente (todas começam com ff_).
-- =====================================================================

-- 1) Empresas listadas. O cliente compra no site da própria empresa (site_url).
create table if not exists public.ff_lojas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  slug text not null unique,                       -- usado no link /api/fabricas/ir?s=slug
  nome text not null,
  cidade text not null default 'Franca, SP',
  segmento text not null default 'calcados' check (segmento in ('calcados','acessorios','bolsas','outros')),
  descricao text,                                  -- até 400 letras, texto SEU (não copie da empresa)
  site_url text not null check (site_url ~* '^https://'),
  cnpj text,                                       -- só números; ajuda a conferir a chave da nota fiscal
  patrocinada boolean not null default false,      -- paga para aparecer em destaque (aparece como "Publicidade")
  patrocinio_ate date,                             -- depois desta data o destaque some sozinho
  patrocinio_obs text,                             -- anotação privada (valor combinado, contato)
  ordem int not null default 100,                  -- menor número aparece primeiro
  ativo boolean not null default true
);
create index if not exists ff_lojas_lista_idx on public.ff_lojas (ativo, ordem);

-- 2) Cliques no botão "Ir para o site da empresa" (sem guardar IP: só uma marca anônima do dia)
create table if not exists public.ff_cliques (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  loja_id uuid not null references public.ff_lojas(id) on delete cascade,
  ref text,                                        -- código de afiliado (?ref), se a pessoa veio por um
  visitante text                                   -- marca anônima (muda todo dia)
);
create index if not exists ff_cliques_loja_idx on public.ff_cliques (loja_id, criado_em desc);

-- 3) Compras registradas pelo cliente (chave da nota fiscal ou número do pedido)
create table if not exists public.ff_comprovantes (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,      -- protocolo que o cliente recebe
  criado_em timestamptz not null default now(),
  loja_id uuid references public.ff_lojas(id) on delete set null,
  nome text not null,
  email text not null,
  whatsapp text not null,
  chave_nfe text,                                  -- 44 números, já conferidos pelo site
  pedido_ref text,                                 -- número do pedido na loja da empresa (opcional)
  status text not null default 'pendente' check (status in ('pendente','aprovado','recusado')),
  verificacao text,                                -- resultado das conferências automáticas
  motivo text,                                     -- motivo da recusa
  bonus_dias int,
  decidido_em timestamptz
);
create unique index if not exists ff_comprovantes_chave_idx on public.ff_comprovantes (chave_nfe) where chave_nfe is not null;
create index if not exists ff_comprovantes_status_idx on public.ff_comprovantes (status, criado_em desc);

-- Trava de segurança: só o servidor (chave de serviço) lê e grava.
alter table public.ff_lojas enable row level security;
alter table public.ff_cliques enable row level security;
alter table public.ff_comprovantes enable row level security;

-- 4) Quantos dias de passe o cliente ganha quando a compra registrada é aprovada (0 desliga o bônus).
--    Usa a tabela cal_config do passe de assinante; se ela ainda não existir, o site usa 30.
do $$ begin
  if to_regclass('public.cal_config') is not null then
    insert into public.cal_config (chave, valor) values ('ff_bonus_dias', '30') on conflict (chave) do nothing;
  end if;
end $$;
