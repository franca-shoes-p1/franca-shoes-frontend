-- Entrega em Casa: encomendas feitas pela página /encomendar.
-- Rode uma vez no Supabase (SQL Editor). Pode rodar de novo sem problema.

create table if not exists rf_encomendas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,              -- ex.: ENA1B2C3 (o cliente usa no WhatsApp)
  nome text not null,
  whatsapp text not null,                   -- só dígitos, com DDD
  email text,
  categoria text not null default 'calcado',
  produto text not null,                    -- o que o cliente quer, nas palavras dele
  numeracao text,
  quantidade int not null default 1 check (quantidade between 1 and 10),
  referencia text,                          -- link (https) ou descrição de referência
  cidade text not null,
  uf text not null,
  bairro text,
  endereco text not null,                   -- rua e número
  melhor_horario text not null default 'qualquer'
    check (melhor_horario in ('manha','tarde','noite','qualquer')),
  aceite_visita boolean not null default false,
  interesse_pacote text[] not null default '{}',   -- loja_pronta, revenda, site, servicos
  status text not null default 'aguardando_cotacao'
    check (status in ('aguardando_cotacao','cotado','aguardando_lote','lote_fechado',
                      'comprado','rota_agendada','visita_confirmada','entregue','recusou','desistiu')),
  empresa_sugerida text,                    -- preenchido pelo radar/painel depois
  preco_cotado numeric(10,2),
  observacao text,
  origem text not null default 'site',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists rf_encomendas_status_idx on rf_encomendas (status, criado_em desc);
create index if not exists rf_encomendas_cidade_idx on rf_encomendas (uf, cidade, status);
create index if not exists rf_encomendas_whatsapp_idx on rf_encomendas (whatsapp);

-- Só o servidor (chave secreta) acessa esta tabela.
alter table rf_encomendas enable row level security;
