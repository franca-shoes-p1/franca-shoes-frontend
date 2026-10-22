-- Tabela de pedidos da loja de varejo (calçados e acessórios para o consumidor final).
-- Como usar: Supabase -> SQL Editor -> New query -> cole TUDO isto -> Run.
-- Pode rodar mais de uma vez sem problema.

create table if not exists public.varejo_pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  pago_em timestamptz,

  -- aguardando_pagamento | pago | pagamento_recusado | valor_divergente
  -- em_compra_fabrica | enviado | entregue | cancelado | reembolsado
  status text not null default 'aguardando_pagamento',

  cliente_nome text not null,
  email text not null,
  whatsapp text not null,

  cep text not null,
  rua text not null,
  numero_casa text not null,
  complemento text,
  bairro text not null,
  cidade text not null,
  estado text not null,
  observacao text,

  itens jsonb not null,
  subtotal numeric(10,2) not null,
  frete numeric(10,2) not null default 0,
  total numeric(10,2) not null,

  mp_preference_id text,
  mp_payment_id text,
  mp_status text,

  codigo_rastreio text,
  nota_interna text
);

create index if not exists varejo_pedidos_status_idx on public.varejo_pedidos (status, criado_em desc);
create index if not exists varejo_pedidos_pagamento_idx on public.varejo_pedidos (mp_payment_id);

-- Trava de segurança: ninguém de fora lê ou grava a tabela. Só o servidor (chave de serviço).
alter table public.varejo_pedidos enable row level security;
