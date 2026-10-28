-- Radar de Pontos: onde ficam os cartazes com QR, por cidade.
-- Rode uma vez no Supabase (SQL Editor). Pode rodar de novo sem problema.

create table if not exists rf_pontos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,           -- vai no QR: /p/CODIGO
  token_convite text unique not null,    -- vai no link do convite: /convite/TOKEN
  cidade text not null,
  uf text not null,
  nome text not null,
  tipo text not null default 'comercio',
  endereco text,
  lat double precision,
  lng double precision,
  nota int not null default 3 check (nota between 1 and 5),
  status text not null default 'mapeado'
    check (status in ('mapeado','convidado','autorizado','ativo','recusado')),
  contato_email text,
  contato_whatsapp text,
  observacao text,
  convidado_em timestamptz,
  respondido_em timestamptz,
  criado_em timestamptz not null default now()
);
create index if not exists rf_pontos_cidade_idx on rf_pontos (cidade, status);

create table if not exists rf_pontos_visitas (
  id bigint generated always as identity primary key,
  codigo text not null,
  em timestamptz not null default now()
);
create index if not exists rf_pontos_visitas_codigo_idx on rf_pontos_visitas (codigo);

-- Só o servidor (chave secreta) acessa estas tabelas.
alter table rf_pontos enable row level security;
alter table rf_pontos_visitas enable row level security;
