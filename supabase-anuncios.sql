-- Central de Anúncios (Entrega em Casa): biblioteca de anúncios gerados e contagem de visitas por link rastreado.
-- Rode uma vez no Supabase (SQL Editor). Pode rodar de novo sem problema.

create table if not exists rf_anuncios (
  id uuid primary key default gen_random_uuid(),
  campanha text not null,                 -- ex.: entrega-belo-horizonte
  canal text not null,                    -- feed, story, reels, whatsapp, telegram, facebook, grupo
  angulo text not null,                   -- prova, preco, fila, cidade, duvida, bastidores
  cidade text,
  uf text,
  titulo text,
  texto text not null,
  arte text,                              -- ideia de imagem ou vídeo
  link text not null,                     -- endereço com utm_source e utm_campaign
  status text not null default 'rascunho' check (status in ('rascunho','aprovado','publicado')),
  agendado_para date,
  publicado_em timestamptz,
  avisos text[] not null default '{}',    -- alertas da conferência automática do texto
  gerado_por text not null default 'modelo' check (gerado_por in ('ia','modelo')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists rf_anuncios_status_idx on rf_anuncios (status, agendado_para);
create index if not exists rf_anuncios_campanha_idx on rf_anuncios (campanha, canal);

create table if not exists rf_anuncios_visitas (
  id bigint generated always as identity primary key,
  campanha text not null,
  canal text not null,
  em timestamptz not null default now()
);
create index if not exists rf_anuncios_visitas_idx on rf_anuncios_visitas (campanha, canal, em desc);

-- Só o servidor (chave secreta) acessa estas tabelas.
alter table rf_anuncios enable row level security;
alter table rf_anuncios_visitas enable row level security;
