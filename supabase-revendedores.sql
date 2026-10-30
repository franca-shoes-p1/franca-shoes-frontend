-- Revendedores: cadastro, assinatura mensal, link/QR próprio, margem própria, dois PIX e repasse.
-- Como usar: Supabase -> SQL Editor -> New query -> cole TUDO isto -> Run. Pode rodar mais de uma vez.
-- Rode ANTES (uma vez) o supabase-fornecedores.sql, se ainda não rodou.

create table if not exists public.rev_revendedores (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  token text not null unique,            -- link secreto do painel do revendedor
  codigo text not null unique,           -- código curto do link de vendas: igreja.eco.br/calcados?rev=CODIGO
  status text not null default 'pendente', -- pendente | ativo | pausado | recusado
  nome text not null,
  whatsapp text not null,
  email text,
  cidade text,
  estado text,
  local_entrega text,                    -- rodoviária ou endereço onde o Ricardo entrega na mão (vai na nota)
  pix_tipo text,
  pix_chave text,
  pix_nome text,                         -- para o Ricardo repassar a margem
  margem_pct numeric(5,2) not null default 40, -- margem do revendedor sobre o preço do fornecedor
  assinatura_ate date,                   -- assinatura paga até esta data
  aceite_termos_em timestamptz,
  observacao_interna text
);

create table if not exists public.rev_assinaturas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  revendedor_id uuid not null references public.rev_revendedores(id),
  valor numeric(10,2) not null,
  dias int not null default 30,
  ate date not null
);

create table if not exists public.rev_loja_pedidos (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  revendedor_id uuid not null references public.rev_revendedores(id),
  pacote text not null,
  mensagem text,
  status text not null default 'novo'    -- novo | em_conversa | fechado | cancelado
);

-- Configurações do dono (ex.: o PIX onde você recebe a comissão e a margem)
create table if not exists public.rev_config (
  chave text primary key,
  valor text
);

-- Pedidos: de qual revendedor veio, quanto é a margem dele, e o controle do PIX 2 e do repasse
alter table public.forn_pedidos add column if not exists revendedor_id uuid;
alter table public.forn_pedidos add column if not exists margem_revendedor_total numeric(10,2) not null default 0;
alter table public.forn_pedidos add column if not exists pix2_pago_em timestamptz;   -- você recebeu o PIX 2 (comissão + margem + frete)
alter table public.forn_pedidos add column if not exists repassado_em timestamptz;   -- você repassou a margem ao revendedor
create index if not exists forn_pedidos_rev_idx on public.forn_pedidos (revendedor_id, criado_em desc);

alter table public.rev_revendedores enable row level security;
alter table public.rev_assinaturas enable row level security;
alter table public.rev_loja_pedidos enable row level security;
alter table public.rev_config enable row level security;
