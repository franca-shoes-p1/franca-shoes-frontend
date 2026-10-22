-- Ateliê Sob Medida: pedidos do site e candidatos a montador.
-- Rode uma vez no Supabase: SQL Editor -> New query -> cole tudo -> Run.
-- Não altera nenhuma tabela que já existe (só cria as duas abaixo).

create table if not exists public.op_atelie_pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  servico text not null,                        -- o que o cliente quer montar
  descricao text,                               -- situação e objetivo, nas palavras do cliente
  prazo text,
  status text not null default 'novo',          -- novo | em_consultoria | orcamento_enviado | entrada_paga | em_producao | entregue | cancelado
  origem text not null default 'site',
  nota_interna text
);

create table if not exists public.op_atelie_candidatos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  nome text not null,
  whatsapp text not null,
  setor text not null,
  disponibilidade text,                         -- equipamento e horas por semana
  experiencia text,
  status text not null default 'novo',          -- novo | triagem | teste_pago | aprovado | recusado
  origem text not null default 'site',
  nota_interna text
);

create index if not exists op_atelie_pedidos_status on public.op_atelie_pedidos (status, criado_em desc);
create index if not exists op_atelie_candidatos_status on public.op_atelie_candidatos (status, setor, criado_em desc);

-- Só o servidor (chave de serviço) lê e grava. O navegador nunca acessa estas tabelas.
alter table public.op_atelie_pedidos enable row level security;
alter table public.op_atelie_candidatos enable row level security;
