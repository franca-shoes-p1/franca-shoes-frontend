-- Fornecedores de Franca: cadastro, catálogo próprio, pedidos pagos direto ao fornecedor e acerto da comissão.
-- Como usar: Supabase -> SQL Editor -> New query -> cole TUDO isto -> Run.
-- Pode rodar mais de uma vez sem problema (os nomes começam com forn_ para não bater com tabelas antigas).

-- 1) Empresas fornecedoras
create table if not exists public.forn_empresas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  token text not null unique,                 -- link secreto do painel do fornecedor (24 letras/números)
  -- pendente | ativo | pausado | recusado
  status text not null default 'pendente',
  nome_fantasia text not null,
  responsavel text not null,
  documento text,                             -- CNPJ (14 dígitos) ou CPF (11), só números
  whatsapp text not null,                     -- só números, com DDD
  email text,
  endereco_coleta text,                       -- onde o Ricardo busca os pedidos
  pix_tipo text,                              -- cpf | cnpj | email | celular | aleatoria
  pix_chave text,
  pix_nome text,                              -- nome do recebedor, como no banco (para o PIX copia e cola)
  emite_nota boolean not null default false,
  comissao_pct numeric(5,2) not null default 15,
  aceite_termos_em timestamptz,
  observacao_interna text
);

-- 2) Cada modelo de fornecedor continua na tabela de produtos que o site já usa (rf_produtos).
alter table public.rf_produtos add column if not exists fornecedor_id uuid;
alter table public.rf_produtos add column if not exists preco_fornecedor numeric(10,2);   -- o que o fornecedor quer receber
alter table public.rf_produtos add column if not exists estoque_status text default 'disponivel'; -- disponivel | sob_consulta | esgotado
alter table public.rf_produtos add column if not exists prazo_postagem_dias int;
-- pendente | aprovado | reprovado (modelos de fornecedor só aparecem no site depois de aprovados)
alter table public.rf_produtos add column if not exists revisao text default 'aprovado';
create index if not exists rf_produtos_fornecedor_idx on public.rf_produtos (fornecedor_id);

-- 3) Pedidos feitos pelo site para um fornecedor (pagos direto a ele)
create table if not exists public.forn_pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  token text not null unique,                 -- link da página de pagamento do cliente
  fornecedor_id uuid not null references public.forn_empresas(id),
  -- aguardando_pagamento | cliente_pagou | pago | pronto_coleta | coletado | enviado | entregue | cancelado
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

  itens jsonb not null,                       -- cada item guarda o preço do cliente, o do fornecedor e a comissão (foto do momento da compra)
  subtotal numeric(10,2) not null,            -- produtos, preço que o cliente paga
  preco_fornecedor_total numeric(10,2) not null,
  comissao_total numeric(10,2) not null,      -- sua comissão sobre este pedido
  frete numeric(10,2) not null default 0,     -- frete cobrado do cliente (vai junto no PIX do fornecedor)
  total numeric(10,2) not null,

  cliente_pagou_em timestamptz,
  pago_em timestamptz,                        -- o fornecedor confirmou o recebimento
  nota_na_embalagem boolean not null default false,
  pronto_em timestamptz,
  coletado_em timestamptz,
  enviado_em timestamptz,
  entregue_em timestamptz,
  codigo_rastreio text,
  custo_postagem numeric(10,2),               -- custo real dos Correios (entra no acerto)
  motivo_cancelamento text,
  comissao_acertada_em timestamptz,           -- preenchido quando o fornecedor pagou a comissão e a postagem
  nota_interna text
);
create index if not exists forn_pedidos_forn_idx on public.forn_pedidos (fornecedor_id, status, criado_em desc);
create index if not exists forn_pedidos_status_idx on public.forn_pedidos (status, criado_em desc);

-- Trava de segurança: ninguém de fora lê ou grava. Só o servidor (chave de serviço).
alter table public.forn_empresas enable row level security;
alter table public.forn_pedidos enable row level security;
