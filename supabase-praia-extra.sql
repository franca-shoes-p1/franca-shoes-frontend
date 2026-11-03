-- Parceiros da Praia: tabelas e colunas extras (rodar DEPOIS do SQL das tabelas praia_ já criadas).
-- Seguro para rodar mais de uma vez.

alter table praia_parceiros  add column if not exists codigo_hash text;
alter table praia_candidatos add column if not exists origem text;
alter table praia_candidatos add column if not exists aceito_em timestamptz;
alter table praia_candidatos add column if not exists tem_licenca text check (tem_licenca in ('sim','andamento','nao'));

create table if not exists praia_vagas (
  cidade text primary key,
  total int not null default 0 check (total >= 0),
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

create table if not exists praia_avisos (
  id bigint generated always as identity primary key,
  titulo text not null,
  texto text,
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

create table if not exists praia_etapas (
  chave text primary key,
  feito boolean not null default false,
  feito_em timestamptz
);

create table if not exists praia_checklists (
  id bigint generated always as identity primary key,
  parceiro_id uuid references praia_parceiros(id),
  data date not null default current_date,
  tipo text not null check (tipo in ('abertura','fechamento')),
  itens jsonb,
  criado_em timestamptz default now(),
  unique (parceiro_id, data, tipo)
);

alter table praia_vagas       enable row level security;
alter table praia_avisos      enable row level security;
alter table praia_etapas      enable row level security;
alter table praia_checklists  enable row level security;
-- Sem policies de propósito: só o servidor do site (chave de serviço) lê e grava.
