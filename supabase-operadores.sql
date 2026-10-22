-- Painel dos operadores (Fábrica Digital). Rode uma vez no Supabase: SQL Editor -> New query -> Run.
create table if not exists public.op_operarios (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text not null,
  whatsapp text,
  chave_pix text,
  setor text not null,
  nivel text not null default 'iniciante',          -- iniciante | aprovado | referencia
  ativo boolean not null default true,
  codigo_hash text not null unique,                  -- só o "carimbo" do código de acesso; o código em si não é guardado
  aceite_em timestamptz,                             -- quando aceitou as regras de trabalho
  nota_interna text
);

create table if not exists public.op_ordens (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  criado_em timestamptz not null default now(),
  cliente text not null,
  servico text not null,                             -- ex.: Loja de Calçados Pronta - Iniciante
  prazo date,
  valor_total numeric(10,2) not null default 0,
  entrada_confirmada boolean not null default false, -- 50% de entrada paga (libera a produção)
  saldo_confirmado boolean not null default false,   -- 50% restantes pagos
  status text not null default 'aberta',             -- aberta | entregue | cancelada
  nota_interna text
);

create table if not exists public.op_tarefas (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  ordem_id uuid not null references public.op_ordens(id) on delete cascade,
  posicao int not null default 0,
  setor text not null,
  titulo text not null,
  instrucoes text,
  criterio text,
  operario_id uuid references public.op_operarios(id),
  prazo date,
  valor numeric(10,2) not null default 0,
  depende_saldo boolean not null default false,      -- só paga depois do saldo do cliente
  status text not null default 'pendente',           -- pendente | em_andamento | entregue | ajuste | aprovada | paga | cancelada
  entrega_texto text,
  entregue_em timestamptz,
  comentario_revisao text,
  aprovada_em timestamptz,
  paga_em timestamptz
);

create index if not exists op_tarefas_ordem on public.op_tarefas (ordem_id, posicao);
create index if not exists op_tarefas_operario on public.op_tarefas (operario_id, status);

-- Só o servidor (chave de serviço) acessa estas tabelas.
alter table public.op_operarios enable row level security;
alter table public.op_ordens enable row level security;
alter table public.op_tarefas enable row level security;
